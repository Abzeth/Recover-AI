/**
 * Closed-loop recovery engine (deterministic demo simulation).
 * Detect -> Diagnose -> Decide -> Act -> Measure -> Stop.
 *
 * Everything here is computed from the event batch: estimated recovery,
 * attempted recovery and actually recovered money are three DIFFERENT numbers
 * and are never conflated.
 */

export type RiskCategory =
  | "Payment failure"
  | "Checkout abandonment"
  | "Subscription failure"
  | "Overdue invoice";

export type Decision =
  | "Retry payment"
  | "Send payment reminder"
  | "Send checkout reminder"
  | "Update payment method"
  | "Escalate to human"
  | "Do not contact";

export type Outcome =
  | "Recovered"
  | "Partially recovered"
  | "Pending"
  | "Failed"
  | "Expired"
  | "Escalated"
  | "Stopped"
  | "Customer declined";

export type StopReason =
  | "Payment recovered — workflow closed"
  | "Payment method updated by customer"
  | "Customer explicitly declined"
  | "Maximum retry attempts reached"
  | "Maximum contact attempts reached"
  | "Recovery probability below 60% threshold"
  | "Invoice paid in full"
  | "Customer requested no further contact"
  | "Human intervention required"
  | "Recovery window expired"
  | null;

/** Hard boundaries every agent runs inside. The AI cannot exceed these. */
export const policy = {
  maxPaymentRetries: 3,
  minRecoveryProbability: 60,
  maxAutomatedDiscount: 10,
  maxContactAttempts: 3,
  humanEscalationMinAmount: 50000,
  messageCooldownHours: 48,
  workflowWindowHours: 72,
} as const;

export const policyRows = [
  { label: "Maximum payment retries", value: "3", note: "hard cap per event" },
  { label: "Minimum recovery probability", value: "60%", note: "below this, do not contact" },
  { label: "Maximum automated discount", value: "10%", note: "above needs human sign-off" },
  { label: "Maximum customer contact attempts", value: "3", note: "across all channels" },
  { label: "Human escalation threshold", value: "₹50,000", note: "invoice / balance value" },
  { label: "Cooldown between messages", value: "48 hours", note: "no message before cooldown" },
  { label: "Workflow time window", value: "72 hours", note: "then workflow expires" },
] as const;

export const escalationLadder = [
  { level: 1, label: "Automated payment retry", detail: "Smart retry inside issuer-friendly window. Max 3 attempts." },
  { level: 2, label: "Email / WhatsApp / SMS reminder", detail: "Single reminder per channel, 48h cooldown enforced." },
  { level: 3, label: "Personalised recovery message", detail: "Context-aware message, optional discount capped at 10%." },
  { level: 4, label: "Human finance-team review", detail: "Mandatory for balances ≥ ₹50,000 or repeat failures." },
  { level: 5, label: "Manual collections process", detail: "Owned by finance. AI stops acting and only reports." },
] as const;

export interface RiskEvent {
  id: string;
  customer: string;
  category: RiskCategory;
  rootCause: string;
  amount: number;
  probability: number;
  attempts: number;
  contactAttempts: number;
  hoursSinceLastContact: number;
  daysOverdue: number;
  declined: boolean;
  noContactRequest: boolean;
  /** decide phase */
  decision: Decision;
  rationale: string;
  expectedRecovery: number;
  escalationLevel: number;
  maxAttemptsAllowed: number;
  stopConditions: string[];
  /** act + measure phase */
  attempted: boolean;
  outcome: Outcome;
  recovered: number;
  stopReason: StopReason;
  detectedAt: string;
}

/* ------------------------------------------------------------------ */
/* deterministic pseudo-random so every demo run is identical         */
/* ------------------------------------------------------------------ */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const firstNames = ["Aarav", "Kalyani", "Ishaan", "Sunita", "Devika", "Karan", "Rhea", "Zaid", "Tanvi", "Neel", "Meera", "Rohan", "Anaya", "Vikram", "Sara", "Aditya"];
const lastNames = ["Mehta", "Rao", "Kulkarni", "Desai", "Nair", "Bhatt", "Kapoor", "Ahmed", "Shah", "Iyer", "Verma", "Sen", "Joshi", "Menon"];
const companies = ["Vertex Labs", "Orbit Retail", "Meridian Foods", "Northline Studio", "Quillbase", "Claymark Interiors", "Sablefox Design", "ABC Technologies", "Lumenpath", "Fernpost Media", "Stonefeather", "Amber & Co"];

const causes: Record<RiskCategory, string[]> = {
  "Payment failure": ["Insufficient funds", "Issuer decline", "Expired payment method", "Authentication failure", "Network timeout"],
  "Checkout abandonment": ["Payment friction at OTP", "Price hesitation", "Authentication failure", "Session timeout"],
  "Subscription failure": ["Expired payment method", "Insufficient funds", "Mandate revoked", "Issuer decline"],
  "Overdue invoice": ["Approval pending with buyer", "Disputed line item", "Cash-flow delay", "Wrong billing contact"],
};

const categoryPlan: { category: RiskCategory; count: number; min: number; max: number }[] = [
  { category: "Payment failure", count: 128, min: 900, max: 26000 },
  { category: "Checkout abandonment", count: 64, min: 1200, max: 42000 },
  { category: "Subscription failure", count: 31, min: 2400, max: 48000 },
  { category: "Overdue invoice", count: 24, min: 18000, max: 260000 },
];

export const TOTAL_AT_RISK = 842000;

function decide(e: Omit<RiskEvent, "decision" | "rationale" | "expectedRecovery" | "escalationLevel" | "maxAttemptsAllowed" | "stopConditions" | "attempted" | "outcome" | "recovered" | "stopReason">): {
  decision: Decision;
  rationale: string;
  escalationLevel: number;
  maxAttemptsAllowed: number;
  stopConditions: string[];
} {
  const base = [
    `Stop on success (payment cleared / invoice paid)`,
    `Stop at ${policy.maxPaymentRetries} retry attempts`,
    `Stop at ${policy.maxContactAttempts} contact attempts`,
    `Stop if probability drops below ${policy.minRecoveryProbability}%`,
    `Stop on customer decline or opt-out`,
    `Stop after ${policy.workflowWindowHours}h workflow window`,
  ];

  if (e.noContactRequest)
    return { decision: "Do not contact", rationale: "Customer is on the do-not-contact list. Policy blocks all outreach.", escalationLevel: 0, maxAttemptsAllowed: 0, stopConditions: base };
  if (e.declined)
    return { decision: "Do not contact", rationale: "Customer explicitly declined recovery. Workflow must terminate.", escalationLevel: 0, maxAttemptsAllowed: 0, stopConditions: base };
  if (e.contactAttempts >= policy.maxContactAttempts)
    return { decision: "Do not contact", rationale: `Already contacted ${e.contactAttempts}/${policy.maxContactAttempts} times. Contact budget exhausted.`, escalationLevel: 0, maxAttemptsAllowed: 0, stopConditions: base };
  if (e.amount >= policy.humanEscalationMinAmount)
    return { decision: "Escalate to human", rationale: `Balance ${e.amount} ≥ ₹50,000 escalation threshold. High-value case requires finance review, not automation.`, escalationLevel: 4, maxAttemptsAllowed: 0, stopConditions: base };
  if (e.attempts >= policy.maxPaymentRetries)
    return { decision: "Escalate to human", rationale: `Retry budget spent (${e.attempts}/${policy.maxPaymentRetries}). Further retries are forbidden — hand to a human.`, escalationLevel: 4, maxAttemptsAllowed: 0, stopConditions: base };
  if (e.probability < policy.minRecoveryProbability)
    return { decision: "Do not contact", rationale: `Recovery probability ${e.probability}% is below the ${policy.minRecoveryProbability}% floor. Contacting costs goodwill for little expected return.`, escalationLevel: 0, maxAttemptsAllowed: 0, stopConditions: base };
  if (e.rootCause === "Expired payment method" || e.rootCause === "Mandate revoked")
    return { decision: "Update payment method", rationale: "Root cause is a dead instrument — a retry cannot succeed. Ask the customer to update the method instead.", escalationLevel: 2, maxAttemptsAllowed: 2, stopConditions: base };
  if (e.category === "Checkout abandonment")
    return { decision: "Send checkout reminder", rationale: "Intent was high but the session broke. A single reminder with a resume link is the cheapest winning nudge.", escalationLevel: 2, maxAttemptsAllowed: 2, stopConditions: base };
  if (e.category === "Overdue invoice")
    return { decision: "Send payment reminder", rationale: "Sub-threshold receivable with a reachable billing contact. Reminder sequence before any human effort.", escalationLevel: 2, maxAttemptsAllowed: 3, stopConditions: base };
  if (e.hoursSinceLastContact < policy.messageCooldownHours && e.contactAttempts > 0)
    return { decision: "Retry payment", rationale: `Message cooldown active (${e.hoursSinceLastContact}h of ${policy.messageCooldownHours}h). Silent retry only — no new message allowed.`, escalationLevel: 1, maxAttemptsAllowed: policy.maxPaymentRetries - e.attempts, stopConditions: base };
  if (e.probability >= 70)
    return { decision: "Retry payment", rationale: "Transient decline with a strong retry window. Retry silently before spending any customer attention.", escalationLevel: 1, maxAttemptsAllowed: policy.maxPaymentRetries - e.attempts, stopConditions: base };
  return { decision: "Send payment reminder", rationale: "Retry alone is unlikely to clear; a reminder asks the customer to fund the account first.", escalationLevel: 2, maxAttemptsAllowed: 2, stopConditions: base };
}

function buildBatch(): RiskEvent[] {
  const rand = rng(20260904);
  const raw: RiskEvent[] = [];

  for (const plan of categoryPlan) {
    for (let i = 0; i < plan.count; i++) {
      const r = rand();
      const isCompany = plan.category === "Overdue invoice" || r > 0.72;
      const customer = isCompany
        ? `${companies[Math.floor(rand() * companies.length)]!}${plan.category === "Overdue invoice" ? " Pvt Ltd" : ""}`
        : `${firstNames[Math.floor(rand() * firstNames.length)]!} ${lastNames[Math.floor(rand() * lastNames.length)]!}`;
      const causeList = causes[plan.category];
      const rootCause = causeList[Math.floor(rand() * causeList.length)]!;
      const amount = Math.round((plan.min + rand() * (plan.max - plan.min)) / 100) * 100;
      const probability = Math.round(28 + rand() * 66);
      const attempts = plan.category === "Payment failure" || plan.category === "Subscription failure" ? Math.floor(rand() * 4) : 0;
      const contactAttempts = Math.floor(rand() * 4);

      const partial: Omit<RiskEvent, "decision" | "rationale" | "expectedRecovery" | "escalationLevel" | "maxAttemptsAllowed" | "stopConditions" | "attempted" | "outcome" | "recovered" | "stopReason"> = {
        id: `REC-${(90000 + raw.length * 37 + Math.floor(rand() * 30)).toString()}`,
        customer,
        category: plan.category,
        rootCause,
        amount,
        probability: Math.min(96, probability),
        attempts,
        contactAttempts,
        hoursSinceLastContact: Math.floor(rand() * 96),
        daysOverdue: plan.category === "Overdue invoice" ? 8 + Math.floor(rand() * 110) : 0,
        declined: rand() < 0.04,
        noContactRequest: rand() < 0.03,
        detectedAt: `${String(6 + Math.floor(rand() * 14)).padStart(2, "0")}:${String(Math.floor(rand() * 60)).padStart(2, "0")}`,
      };

      const d = decide(partial);
      raw.push({
        ...partial,
        ...d,
        expectedRecovery: d.decision === "Do not contact" || d.decision === "Escalate to human" ? 0 : Math.round((partial.amount * partial.probability) / 100),
        attempted: false,
        outcome: "Pending",
        recovered: 0,
        stopReason: null,
      });
    }
  }

  // Normalise the batch so total revenue at risk is exactly ₹8.42L.
  const sum = raw.reduce((a, e) => a + e.amount, 0);
  const scale = TOTAL_AT_RISK / sum;
  raw.forEach((e) => {
    e.amount = Math.max(400, Math.round((e.amount * scale) / 100) * 100);
    e.expectedRecovery = e.expectedRecovery === 0 ? 0 : Math.round((e.amount * e.probability) / 100);
  });
  const drift = TOTAL_AT_RISK - raw.reduce((a, e) => a + e.amount, 0);
  if (raw[0]) raw[0].amount += drift;

  return raw;
}

/** The detected batch: 247 revenue-at-risk events, ₹8.42L. */
export const riskBatch: RiskEvent[] = buildBatch();

/** Resolve the act + measure phase for the batch (deterministic outcomes). */
export function resolveBatch(events: RiskEvent[]): RiskEvent[] {
  const rand = rng(77003);
  return events.map((e) => {
    if (e.decision === "Do not contact") {
      const stopReason: StopReason = e.noContactRequest
        ? "Customer requested no further contact"
        : e.declined
          ? "Customer explicitly declined"
          : e.contactAttempts >= policy.maxContactAttempts
            ? "Maximum contact attempts reached"
            : "Recovery probability below 60% threshold";
      return { ...e, attempted: false, outcome: e.declined ? "Customer declined" : "Stopped", recovered: 0, stopReason };
    }
    if (e.decision === "Escalate to human") {
      return {
        ...e,
        attempted: false,
        outcome: "Escalated",
        recovered: 0,
        stopReason: e.attempts >= policy.maxPaymentRetries ? "Maximum retry attempts reached" : "Human intervention required",
      };
    }

    const roll = rand();
    const hit = roll < e.probability / 100;
    if (hit) {
      const partial = e.category === "Overdue invoice" && rand() < 0.35;
      return {
        ...e,
        attempted: true,
        outcome: partial ? "Partially recovered" : "Recovered",
        recovered: partial ? Math.round(e.amount * 0.6) : e.amount,
        stopReason: e.decision === "Update payment method" ? "Payment method updated by customer" : e.category === "Overdue invoice" ? "Invoice paid in full" : "Payment recovered — workflow closed",
      };
    }
    const r2 = rand();
    if (r2 < 0.42) return { ...e, attempted: true, outcome: "Pending", recovered: 0, stopReason: null };
    if (r2 < 0.62) return { ...e, attempted: true, outcome: "Expired", recovered: 0, stopReason: "Recovery window expired" };
    if (r2 < 0.78) return { ...e, attempted: true, outcome: "Escalated", recovered: 0, stopReason: "Human intervention required" };
    return {
      ...e,
      attempted: true,
      outcome: "Failed",
      recovered: 0,
      stopReason: e.attempts + 1 >= policy.maxPaymentRetries ? "Maximum retry attempts reached" : "Maximum contact attempts reached",
    };
  });
}

export const resolvedBatch: RiskEvent[] = resolveBatch(riskBatch);

/* ------------------------------------------------------------------ */
/* aggregates                                                          */
/* ------------------------------------------------------------------ */

export function categoryCounts(events: RiskEvent[]) {
  return categoryPlan.map((p) => ({
    category: p.category,
    count: events.filter((e) => e.category === p.category).length,
    atRisk: events.filter((e) => e.category === p.category).reduce((a, e) => a + e.amount, 0),
  }));
}

export const decisionOrder: Decision[] = ["Retry payment", "Send payment reminder", "Send checkout reminder", "Update payment method", "Escalate to human", "Do not contact"];

export function decisionCounts(events: RiskEvent[]) {
  return decisionOrder.map((d) => ({
    decision: d,
    count: events.filter((e) => e.decision === d).length,
    value: events.filter((e) => e.decision === d).reduce((a, e) => a + e.amount, 0),
  }));
}

export function funnel(events: RiskEvent[]) {
  const atRisk = events.reduce((a, e) => a + e.amount, 0);
  const eligible = events.filter((e) => e.decision !== "Do not contact" && e.decision !== "Escalate to human");
  const estimatedRecovery = eligible.reduce((a, e) => a + e.expectedRecovery, 0);
  const attemptedEvents = events.filter((e) => e.attempted);
  const attempted = attemptedEvents.reduce((a, e) => a + e.amount, 0);
  const recovered = events.reduce((a, e) => a + e.recovered, 0);
  const escalated = events.filter((e) => e.outcome === "Escalated");
  return {
    atRisk,
    eligibleValue: eligible.reduce((a, e) => a + e.amount, 0),
    eligibleCount: eligible.length,
    estimatedRecovery,
    attempted,
    attemptedCount: attemptedEvents.length,
    recovered,
    recoveredCount: events.filter((e) => e.outcome === "Recovered" || e.outcome === "Partially recovered").length,
    outstanding: atRisk - recovered,
    recoveryRate: attempted > 0 ? (recovered / attempted) * 100 : 0,
    escalatedCount: escalated.length,
    escalatedValue: escalated.reduce((a, e) => a + e.amount, 0),
    stoppedCount: events.filter((e) => e.outcome === "Stopped" || e.outcome === "Customer declined").length,
  };
}

export const outcomeOrder: Outcome[] = ["Recovered", "Partially recovered", "Pending", "Failed", "Expired", "Escalated", "Stopped", "Customer declined"];

export function outcomeCounts(events: RiskEvent[]) {
  return outcomeOrder.map((o) => ({
    outcome: o,
    count: events.filter((e) => e.outcome === o).length,
    value: events.filter((e) => e.outcome === o).reduce((a, e) => a + e.recovered, 0),
  }));
}

export function stopReasonCounts(events: RiskEvent[]) {
  const map = new Map<string, number>();
  events.forEach((e) => {
    if (e.stopReason) map.set(e.stopReason, (map.get(e.stopReason) ?? 0) + 1);
  });
  return [...map.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}

/** Events the AI refuses to automate — they need a human. */
export function humanReviewQueue(events: RiskEvent[]) {
  return events
    .filter((e) => e.decision === "Escalate to human")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
}

/** Per-event recovery timeline, derived from the event's own decision + outcome. */
export function timelineFor(e: RiskEvent) {
  const [hh, mm] = e.detectedAt.split(":").map(Number);
  const base = (hh ?? 9) * 60 + (mm ?? 12);
  const at = (add: number) => `${String(Math.floor(((base + add) % 1440) / 60)).padStart(2, "0")}:${String((base + add) % 60).padStart(2, "0")}`;
  const steps: { t: string; label: string; tone?: "gold" | "success" | "danger" }[] = [
    { t: at(0), label: `${e.category} detected — ${e.customer}` },
    { t: at(1), label: `AI diagnosed root cause: ${e.rootCause}` },
    { t: at(2), label: `Decision: ${e.decision} (probability ${e.probability}%)`, tone: "gold" },
  ];
  if (e.decision === "Do not contact") {
    steps.push({ t: at(3), label: `Policy blocked outreach — ${e.stopReason}`, tone: "danger" });
    return steps;
  }
  if (e.decision === "Escalate to human") {
    steps.push({ t: at(3), label: "Bounded workflow refused automation — escalation level 4", tone: "gold" });
    steps.push({ t: at(4), label: `Assigned to finance review — ${e.stopReason}`, tone: "danger" });
    return steps;
  }
  steps.push({ t: at(3), label: "Human approved bounded workflow", tone: "gold" });
  steps.push({ t: at(4), label: `Action executed: ${e.decision} (attempt ${e.attempts + 1}/${policy.maxPaymentRetries})` });
  if (e.outcome === "Recovered" || e.outcome === "Partially recovered") {
    steps.push({ t: at(33), label: e.decision === "Update payment method" ? "Customer updated payment method" : "Customer responded" });
    steps.push({ t: at(35), label: `✓ ${e.outcome} — ${e.recovered}`, tone: "success" });
    steps.push({ t: at(35), label: `Workflow stopped: ${e.stopReason}`, tone: "gold" });
  } else if (e.outcome === "Pending") {
    steps.push({ t: at(35), label: "Awaiting customer action — inside 72h window, no further contact until cooldown clears" });
  } else {
    steps.push({ t: at(35), label: `Attempt did not clear — outcome ${e.outcome}`, tone: "danger" });
    steps.push({ t: at(36), label: `Workflow stopped: ${e.stopReason}`, tone: "gold" });
  }
  return steps;
}

/** Verified month-to-date impact (closed, reconciled batches). */
export const monthImpact = {
  atRisk: 4280000,
  recovered: 2740000,
  recoveryRate: 64.0,
  attempts: 3842,
  successes: 2491,
} as const;
