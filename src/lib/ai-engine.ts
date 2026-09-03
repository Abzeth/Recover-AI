import type { RecoveryChannel } from "./data";

export interface PlanStep {
  order: number;
  channel: RecoveryChannel;
  timing: string;
  detail: string;
}

export interface RecoveryPlan {
  id: string;
  subject: string;
  diagnosis: string;
  evidence: string[];
  confidence: number;
  atRisk: number;
  estimatedRecovery: number;
  steps: PlanStep[];
  risks: string[];
  financialAction: string;
}

/** Deterministic demo "reasoning" traces the AI panel streams line by line. */
export const reasoningTraces: Record<string, string[]> = {
  failed: [
    "Reading 37 failed payment events from the last 24 hours…",
    "Clustering by decline code, issuer bank and retry history…",
    "11 failures map to insufficient funds — salary-cycle correlated.",
    "8 issuer declines concentrated on one acquirer route.",
    "Scoring retry-window probability per customer lifetime value…",
    "Drafting a staged recovery plan with approval gate.",
  ],
  checkout: [
    "Loading 1,248 checkout sessions, 312 abandoned…",
    "Segmenting drop-off by funnel stage and time-on-page…",
    "42% abandon at the payment page — friction signature.",
    "18% fail at OTP: authentication issues on two issuers.",
    "Matching each cohort to the highest-converting channel…",
    "Preparing outreach plan for human approval.",
  ],
  subs: [
    "Evaluating 18 subscriptions in past-due or grace period…",
    "Modelling churn risk from failure count, tenure and plan value…",
    "4 accounts above 85% churn risk — intervene within 6 hours.",
    "Selecting dunning cadence per account sensitivity…",
    "Holding all charges until an operator approves.",
  ],
  receivables: [
    "Reconciling 24 outstanding invoices across ageing buckets…",
    "Weighting by amount, ageing and prior payment behaviour…",
    "₹5.37L outstanding; ₹2.91L judged collectable this cycle.",
    "Escalation ladder drafted from reminder to call script.",
    "Awaiting approval before any customer contact.",
  ],
};

export const recoveryPlans: Record<string, RecoveryPlan> = {
  failed: {
    id: "plan_failed",
    subject: "Failed payment recovery — last 24 hours",
    diagnosis:
      "37 payments failed, worth ₹84,200. The dominant cause is insufficient funds (11 payments) clustered before the monthly salary cycle, followed by 8 issuer declines routed through a single acquirer. These are recoverable with timed retries rather than customer contact.",
    evidence: [
      "11 insufficient-funds failures — 82% historically recover on a T+2 retry",
      "8 bank declines share one acquirer route; alternate route succeeds 64% of the time",
      "6 expired cards need a card-update request, not a retry",
      "5 authentication failures retried inside 15 minutes recover at 71%",
    ],
    confidence: 87,
    atRisk: 84200,
    estimatedRecovery: 61400,
    steps: [
      { order: 1, channel: "Payment retry", timing: "Immediately", detail: "Retry 5 authentication and network failures on the original method." },
      { order: 2, channel: "Alternative method", timing: "Within 1 hour", detail: "Re-route 8 issuer declines through the secondary acquirer." },
      { order: 3, channel: "Payment retry", timing: "T+2 days, 10:30 IST", detail: "Schedule 11 insufficient-funds retries after the salary credit window." },
      { order: 4, channel: "Personalised message", timing: "T+0, then T+3", detail: "Send card-update requests to 6 expired-card customers with a secure link." },
      { order: 5, channel: "Discount offer", timing: "T+5", detail: "Offer 5% goodwill credit to the 3 low-LTV accounts still unpaid." },
    ],
    risks: [
      "Retrying twice inside 24 hours can trigger issuer risk flags",
      "Discount step reduces realised revenue by ~₹1,100",
    ],
    financialAction: "Charge 24 payment methods for a combined ₹61,400 across 5 scheduled batches.",
  },
  checkout: {
    id: "plan_checkout",
    subject: "Checkout abandonment recovery — 312 sessions",
    diagnosis:
      "312 of 1,248 checkout sessions were abandoned, representing ₹2.84L of potential revenue. Payment friction at the payment page accounts for 42% of drop-off, price hesitation for 27%, and OTP/authentication issues for 18%. Each cohort needs a different nudge.",
    evidence: [
      "42% exit within 40 seconds of the payment page — a friction signature, not intent loss",
      "27% return twice without paying — price-sensitive, respond to time-boxed offers",
      "18% fail at OTP on two specific issuers",
      "WhatsApp recovers 54% of high-value carts within 90 minutes",
    ],
    confidence: 81,
    atRisk: 284000,
    estimatedRecovery: 116000,
    steps: [
      { order: 1, channel: "WhatsApp reminder", timing: "20 min after drop-off", detail: "One-tap resume link for the 131 payment-friction carts." },
      { order: 2, channel: "Alternative method", timing: "30 min", detail: "Offer UPI intent to 56 OTP-failure sessions where cards failed." },
      { order: 3, channel: "Email reminder", timing: "4 hours", detail: "Cart summary email to all remaining sessions." },
      { order: 4, channel: "Discount offer", timing: "24 hours", detail: "7% time-boxed offer to 84 price-hesitant carts above ₹5,000." },
    ],
    risks: [
      "Discounting trains repeat customers to wait for offers",
      "WhatsApp template must stay inside the approved utility category",
    ],
    financialAction: "Send 271 outbound messages and issue 84 discount codes worth up to ₹8,100.",
  },
  subs: {
    id: "plan_subs",
    subject: "Subscription churn recovery — 18 accounts",
    diagnosis:
      "18 subscriptions worth ₹1.16L MRR are past due or in grace period. Four accounts exceed 85% churn risk and lapse within 24 hours. Involuntary churn — repeated card failures — explains 13 of the 18; only 5 show genuine cancellation intent.",
    evidence: [
      "13 accounts failed on card issues, not cancellation requests",
      "Fernpost Media at 91% risk after 4 consecutive failures",
      "Accounts contacted before the 3rd failure retain at 2.4x the rate",
      "Annual plans respond better to a human message than to dunning email",
    ],
    confidence: 84,
    atRisk: 116400,
    estimatedRecovery: 72300,
    steps: [
      { order: 1, channel: "Payment retry", timing: "Next 2 hours", detail: "Retry 9 grace-period charges inside the issuer's soft-decline window." },
      { order: 2, channel: "Personalised message", timing: "Today", detail: "Account-manager note to the 2 annual Scale accounts at risk." },
      { order: 3, channel: "Dunning sequence", timing: "Day 1, 3, 5", detail: "Three-step cadence for 7 monthly plans with a card-update link." },
      { order: 4, channel: "Discount offer", timing: "Day 5", detail: "One-month 20% retention credit for accounts above 85% risk." },
    ],
    risks: [
      "Retention credit lowers MRR by ₹4,300 for one cycle",
      "Cancelled accounts must be excluded from all charge attempts",
    ],
    financialAction: "Attempt ₹72,300 in subscription charges and apply 4 retention credits.",
  },
  receivables: {
    id: "plan_receivables",
    subject: "Receivables collection — 24 invoices",
    diagnosis:
      "₹5.37L is outstanding across 24 invoices. ₹3.14L sits in the 0–30 day bucket and is largely a process delay rather than a credit problem. The 90+ bucket (₹31,200) needs escalation, and two accounts hold 58% of the total exposure.",
    evidence: [
      "0–30 bucket collects at 89% with a single reminder",
      "Vertex Labs and Orbit Retail hold ₹2.8L of the exposure",
      "Invoices with an embedded payment link settle 6 days sooner",
      "90+ invoices recover at 22% without escalation",
    ],
    confidence: 79,
    atRisk: 537500,
    estimatedRecovery: 291000,
    steps: [
      { order: 1, channel: "Email reminder", timing: "Today", detail: "Reminder with one-click payment link to all 0–30 day invoices." },
      { order: 2, channel: "Payment link", timing: "Today", detail: "Re-issue links on 31–60 day invoices with GST-ready statements." },
      { order: 3, channel: "Personalised message", timing: "Day 2", detail: "Named-contact follow-up on the two largest exposures." },
      { order: 4, channel: "WhatsApp reminder", timing: "Day 4", detail: "Escalation ladder with a call script for the 90+ bucket." },
    ],
    risks: [
      "Escalating enterprise accounts too fast can strain the relationship",
      "Reminders must respect finance-team contact preferences",
    ],
    financialAction: "Issue 24 payment links and request collection of ₹2,91,000.",
  },
};

export const planKeys = ["failed", "checkout", "subs", "receivables"] as const;
export type PlanKey = (typeof planKeys)[number];
