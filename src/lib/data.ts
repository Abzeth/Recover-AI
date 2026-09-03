export type FailureReason =
  | "Insufficient funds"
  | "Bank decline"
  | "Expired card"
  | "Authentication failure"
  | "Network failure"
  | "Temporary payment failure"
  | "Unknown failure";

export type RecoveryStatus = "New" | "AI analysed" | "Awaiting approval" | "In progress" | "Recovered" | "Lost";

export type RecoveryChannel =
  | "Email reminder"
  | "WhatsApp reminder"
  | "SMS"
  | "Discount offer"
  | "Payment retry"
  | "Alternative method"
  | "Personalised message"
  | "Dunning sequence"
  | "Payment link";

export interface FailedPayment {
  id: string;
  customer: string;
  email: string;
  amount: number;
  method: string;
  reason: FailureReason;
  attempts: number;
  failedAt: string;
  probability: number;
  status: RecoveryStatus;
  recommended: RecoveryChannel;
  lifetimeValue: number;
}

export interface AbandonedCheckout {
  id: string;
  customer: string;
  email: string;
  cartValue: number;
  stage: "Payment page" | "OTP screen" | "Address" | "Method select";
  cause: "Payment friction" | "Price hesitation" | "Authentication issues" | "Unknown";
  minutesAgo: number;
  probability: number;
  status: RecoveryStatus;
  recommended: RecoveryChannel;
}

export interface Subscription {
  id: string;
  customer: string;
  plan: string;
  mrr: number;
  cycleFailures: number;
  churnRisk: number;
  state: "Active" | "Past due" | "Grace period" | "Cancelled";
  nextRetry: string;
  status: RecoveryStatus;
  recommended: RecoveryChannel;
}

export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  dueDays: number;
  bucket: "0-30" | "31-60" | "61-90" | "90+";
  contact: string;
  probability: number;
  status: RecoveryStatus;
  recommended: RecoveryChannel;
}

export const failedPayments: FailedPayment[] = [
  { id: "pay_9F42KX", customer: "Aarav Mehta", email: "aarav@northloop.in", amount: 12400, method: "HDFC Credit", reason: "Insufficient funds", attempts: 2, failedAt: "12 min ago", probability: 74, status: "AI analysed", recommended: "Payment retry", lifetimeValue: 184000 },
  { id: "pay_7B18QM", customer: "Kalyani Rao", email: "k.rao@brightfold.co", amount: 8900, method: "ICICI Debit", reason: "Expired card", attempts: 3, failedAt: "28 min ago", probability: 61, status: "Awaiting approval", recommended: "Personalised message", lifetimeValue: 96500 },
  { id: "pay_2C77LZ", customer: "Vertex Labs Pvt Ltd", email: "billing@vertexlabs.io", amount: 24800, method: "Corporate Amex", reason: "Bank decline", attempts: 1, failedAt: "41 min ago", probability: 48, status: "New", recommended: "Alternative method", lifetimeValue: 512000 },
  { id: "pay_5J91TP", customer: "Ishaan Kulkarni", email: "ishaan.k@fernpost.in", amount: 4300, method: "UPI", reason: "Authentication failure", attempts: 2, failedAt: "1 hr ago", probability: 82, status: "In progress", recommended: "Payment retry", lifetimeValue: 41000 },
  { id: "pay_1M63RD", customer: "Sunita Desai", email: "sunita@claymark.in", amount: 6750, method: "Axis Credit", reason: "Network failure", attempts: 1, failedAt: "2 hr ago", probability: 88, status: "Recovered", recommended: "Payment retry", lifetimeValue: 78000 },
  { id: "pay_8T05WQ", customer: "Orbit Retail", email: "ap@orbitretail.com", amount: 15900, method: "Netbanking", reason: "Temporary payment failure", attempts: 4, failedAt: "3 hr ago", probability: 66, status: "AI analysed", recommended: "Payment link", lifetimeValue: 233000 },
  { id: "pay_4H29VN", customer: "Devika Nair", email: "devika@sablefox.in", amount: 3200, method: "Rupay Debit", reason: "Insufficient funds", attempts: 3, failedAt: "5 hr ago", probability: 39, status: "Awaiting approval", recommended: "Discount offer", lifetimeValue: 22400 },
  { id: "pay_6P84YB", customer: "Meridian Foods", email: "finance@meridianfoods.in", amount: 7950, method: "HDFC Credit", reason: "Unknown failure", attempts: 2, failedAt: "8 hr ago", probability: 52, status: "New", recommended: "WhatsApp reminder", lifetimeValue: 141000 },
];

export const failureBreakdown = [
  { reason: "Insufficient funds", count: 11, value: 24800 },
  { reason: "Bank decline", count: 8, value: 19600 },
  { reason: "Expired card", count: 6, value: 14200 },
  { reason: "Authentication failure", count: 5, value: 11400 },
  { reason: "Network failure", count: 4, value: 8100 },
  { reason: "Temporary failure", count: 2, value: 4200 },
  { reason: "Unknown", count: 1, value: 1900 },
];

export const abandonedCheckouts: AbandonedCheckout[] = [
  { id: "ck_38FQ2", customer: "Rhea Kapoor", email: "rhea@lumenpath.in", cartValue: 18400, stage: "Payment page", cause: "Payment friction", minutesAgo: 9, probability: 71, status: "AI analysed", recommended: "WhatsApp reminder" },
  { id: "ck_71LM8", customer: "Zaid Ahmed", email: "zaid@quillbase.co", cartValue: 6200, stage: "OTP screen", cause: "Authentication issues", minutesAgo: 22, probability: 64, status: "New", recommended: "Alternative method" },
  { id: "ck_04PT6", customer: "Northline Studio", email: "hello@northline.studio", cartValue: 42500, stage: "Method select", cause: "Price hesitation", minutesAgo: 47, probability: 43, status: "Awaiting approval", recommended: "Discount offer" },
  { id: "ck_92RB3", customer: "Tanvi Shah", email: "tanvi.shah@petalcraft.in", cartValue: 2800, stage: "Address", cause: "Unknown", minutesAgo: 96, probability: 31, status: "New", recommended: "Email reminder" },
  { id: "ck_57WD1", customer: "Karan Bhatt", email: "karan@stonefeather.in", cartValue: 11900, stage: "Payment page", cause: "Payment friction", minutesAgo: 134, probability: 58, status: "In progress", recommended: "Payment link" },
  { id: "ck_66JN9", customer: "Amber & Co", email: "orders@amberco.in", cartValue: 27300, stage: "OTP screen", cause: "Authentication issues", minutesAgo: 210, probability: 49, status: "Recovered", recommended: "SMS" },
];

export const abandonCauses = [
  { cause: "Payment friction", share: 42 },
  { cause: "Price hesitation", share: 27 },
  { cause: "Authentication issues", share: 18 },
  { cause: "Unknown", share: 13 },
];

export const subscriptions: Subscription[] = [
  { id: "sub_A417", customer: "Vertex Labs Pvt Ltd", plan: "Scale — Annual", mrr: 41600, cycleFailures: 2, churnRisk: 78, state: "Past due", nextRetry: "in 6 hrs", status: "Awaiting approval", recommended: "Dunning sequence" },
  { id: "sub_B928", customer: "Orbit Retail", plan: "Growth — Monthly", mrr: 15900, cycleFailures: 3, churnRisk: 86, state: "Grace period", nextRetry: "in 2 hrs", status: "AI analysed", recommended: "Personalised message" },
  { id: "sub_C233", customer: "Meridian Foods", plan: "Growth — Monthly", mrr: 12400, cycleFailures: 1, churnRisk: 44, state: "Past due", nextRetry: "in 18 hrs", status: "New", recommended: "Payment retry" },
  { id: "sub_D671", customer: "Fernpost Media", plan: "Starter — Monthly", mrr: 4900, cycleFailures: 4, churnRisk: 91, state: "Grace period", nextRetry: "in 1 hr", status: "In progress", recommended: "Discount offer" },
  { id: "sub_E502", customer: "Claymark Interiors", plan: "Scale — Annual", mrr: 38200, cycleFailures: 1, churnRisk: 29, state: "Active", nextRetry: "—", status: "Recovered", recommended: "Payment retry" },
  { id: "sub_F844", customer: "Sablefox Design", plan: "Starter — Monthly", mrr: 3400, cycleFailures: 5, churnRisk: 94, state: "Cancelled", nextRetry: "—", status: "Lost", recommended: "Personalised message" },
];

export const invoices: Invoice[] = [
  { id: "INV-2041", customer: "Vertex Labs Pvt Ltd", amount: 186000, dueDays: 14, bucket: "0-30", contact: "billing@vertexlabs.io", probability: 81, status: "AI analysed", recommended: "Email reminder" },
  { id: "INV-2033", customer: "Orbit Retail", amount: 94500, dueDays: 38, bucket: "31-60", contact: "ap@orbitretail.com", probability: 63, status: "Awaiting approval", recommended: "Personalised message" },
  { id: "INV-2018", customer: "Meridian Foods", amount: 52800, dueDays: 67, bucket: "61-90", contact: "finance@meridianfoods.in", probability: 41, status: "New", recommended: "Payment link" },
  { id: "INV-1994", customer: "Northline Studio", amount: 31200, dueDays: 104, bucket: "90+", contact: "hello@northline.studio", probability: 22, status: "In progress", recommended: "WhatsApp reminder" },
  { id: "INV-2052", customer: "Claymark Interiors", amount: 128400, dueDays: 8, bucket: "0-30", contact: "accounts@claymark.in", probability: 89, status: "Recovered", recommended: "Email reminder" },
  { id: "INV-2007", customer: "Quillbase Co", amount: 44600, dueDays: 55, bucket: "31-60", contact: "zaid@quillbase.co", probability: 57, status: "New", recommended: "SMS" },
];

export const agingBuckets = [
  { bucket: "0-30", amount: 314400 },
  { bucket: "31-60", amount: 139100 },
  { bucket: "61-90", amount: 52800 },
  { bucket: "90+", amount: 31200 },
];

export const recoveryTrend = [
  { day: "Mon", atRisk: 62000, recovered: 31000 },
  { day: "Tue", atRisk: 74000, recovered: 42000 },
  { day: "Wed", atRisk: 58000, recovered: 39000 },
  { day: "Thu", atRisk: 91000, recovered: 55000 },
  { day: "Fri", atRisk: 84200, recovered: 61400 },
  { day: "Sat", atRisk: 46000, recovered: 28000 },
  { day: "Sun", atRisk: 38000, recovered: 24000 },
];

export const channelPerformance = [
  { channel: "Payment retry", success: 68, sent: 412 },
  { channel: "WhatsApp", success: 54, sent: 288 },
  { channel: "Payment link", success: 47, sent: 196 },
  { channel: "Email", success: 33, sent: 604 },
  { channel: "SMS", success: 26, sent: 174 },
  { channel: "Discount", success: 61, sent: 88 },
];

export const moduleSummary = [
  { key: "failed", label: "Failed payments", atRisk: 84200, recoverable: 61400, count: 37, to: "/app/failed-payments" as const },
  { key: "checkout", label: "Abandoned checkouts", atRisk: 284000, recoverable: 116000, count: 312, to: "/app/checkouts" as const },
  { key: "subs", label: "Subscription churn", atRisk: 116400, recoverable: 72300, count: 18, to: "/app/subscriptions" as const },
  { key: "receivables", label: "Overdue receivables", atRisk: 537500, recoverable: 291000, count: 24, to: "/app/receivables" as const },
];

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  amount?: number;
  outcome: "Approved" | "Rejected" | "Executed" | "Recovered" | "Failed";
}

export const auditLog: AuditEntry[] = [
  { id: "au_01", at: "Today 14:22", actor: "AI agent", action: "Generated recovery plan", target: "37 failed payments", outcome: "Executed" },
  { id: "au_02", at: "Today 14:24", actor: "priya@company.in", action: "Approved retry batch", target: "pay_9F42KX +11 more", amount: 61400, outcome: "Approved" },
  { id: "au_03", at: "Today 14:25", actor: "System", action: "Executed smart retry", target: "pay_1M63RD", amount: 6750, outcome: "Recovered" },
  { id: "au_04", at: "Today 13:48", actor: "priya@company.in", action: "Rejected discount offer", target: "ck_04PT6", amount: 42500, outcome: "Rejected" },
  { id: "au_05", at: "Today 11:03", actor: "AI agent", action: "Churn analysis", target: "18 at-risk subscriptions", outcome: "Executed" },
  { id: "au_06", at: "Yesterday 18:11", actor: "System", action: "Dunning email sent", target: "sub_B928", amount: 15900, outcome: "Executed" },
  { id: "au_07", at: "Yesterday 16:40", actor: "arjun@company.in", action: "Approved payment link", target: "INV-2033", amount: 94500, outcome: "Approved" },
  { id: "au_08", at: "Yesterday 09:12", actor: "System", action: "Retry attempt", target: "pay_4H29VN", amount: 3200, outcome: "Failed" },
];
