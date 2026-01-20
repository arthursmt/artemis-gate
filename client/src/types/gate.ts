export interface ProposalSummary {
  proposalId: string;
  groupId?: string;
  leaderName?: string;
  membersCount?: number;
  totalAmount?: number;
  submittedAt?: string;
  stage?: string;
  evidenceRequiredCount?: number;
  evidenceCompletedCount?: number;
  assignedTo?: string;
}

export interface ProposalDecision {
  stage?: string;
  decision?: string;
  reasons?: string[];
  comment?: string;
  userId?: string;
  decidedAt?: string;
}

export interface ProposalDetail {
  proposalId: string;
  groupId?: string;
  stage?: string;
  submittedAt?: string;
  payload?: Record<string, unknown>;
  decisions?: ProposalDecision[];
}

export interface Member {
  id?: string;
  name?: string;
  isLeader?: boolean;
  loanAmount?: number;
  loanPurpose?: string;
  phoneNumber?: string;
  email?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  existingLoans?: number;
  evidence?: Record<string, string>;
}

export interface ContractSignature {
  memberId?: string;
  name?: string;
  signedAt?: string;
  signatureUrl?: string;
}

export interface Contract {
  contractId?: string;
  createdAt?: string;
  signatures?: ContractSignature[];
}

export interface HealthResponse {
  status: string;
  service?: string;
}

export interface DecisionPayload {
  stage: string;
  decision: "APPROVE" | "REJECT";
  reasons: string[];
  comment: string;
  userId: string;
}

export const OPS_REJECTION_REASONS = [
  "Incomplete documentation",
  "Invalid ID document",
  "Blurry/unreadable photos",
  "Missing business proof",
  "Address mismatch",
  "Signature missing",
  "Duplicate application",
];

export const RISK_REJECTION_REASONS = [
  "High debt-to-income ratio",
  "Insufficient income",
  "Poor credit history",
  "Overleveraged",
  "Business viability concerns",
  "Fraud indicators",
  "Age restriction",
];

export const EVIDENCE_KEYS = [
  "clientSelfie",
  "idFront",
  "idBack",
  "businessProofOfAddress",
  "businessPhoto",
] as const;
