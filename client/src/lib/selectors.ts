import type { Member, Contract, ContractSignature } from "@/types/gate";
import { EVIDENCE_KEYS } from "@/types/gate";

type Payload = Record<string, unknown> | undefined | null;

function safeGet<T>(obj: unknown, ...paths: string[]): T | undefined {
  for (const path of paths) {
    const keys = path.split(".");
    let current: unknown = obj;
    for (const key of keys) {
      if (current == null || typeof current !== "object") {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[key];
    }
    if (current !== undefined) {
      return current as T;
    }
  }
  return undefined;
}

function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

export function extractMembers(payload: Payload): Member[] {
  if (!payload) return [];

  const candidates = [
    safeGet<unknown[]>(payload, "members"),
    safeGet<unknown[]>(payload, "group.members"),
    safeGet<unknown[]>(payload, "clients"),
    safeGet<unknown[]>(payload, "applicants"),
  ];

  for (const arr of candidates) {
    if (isArray(arr) && arr.length > 0) {
      return arr.map((m, idx) => normalizeMember(m, idx));
    }
  }

  return [];
}

function normalizeMember(raw: unknown, index: number): Member {
  if (!raw || typeof raw !== "object") {
    return { id: `member-${index}`, name: "--" };
  }

  const obj = raw as Record<string, unknown>;

  const isLeader = Boolean(
    obj.isLeader ||
    obj.is_leader ||
    obj.leader === true ||
    obj.role === "leader" ||
    obj.type === "leader"
  );

  return {
    id: String(obj.id || obj.memberId || obj.clientId || `member-${index}`),
    name: String(obj.name || obj.fullName || obj.clientName || "--"),
    isLeader,
    loanAmount: typeof obj.loanAmount === "number" ? obj.loanAmount : undefined,
    loanPurpose: obj.loanPurpose ? String(obj.loanPurpose) : undefined,
    phoneNumber: obj.phoneNumber || obj.phone ? String(obj.phoneNumber || obj.phone) : undefined,
    email: obj.email ? String(obj.email) : undefined,
    nationalId: obj.nationalId || obj.idNumber ? String(obj.nationalId || obj.idNumber) : undefined,
    dateOfBirth: obj.dateOfBirth || obj.dob ? String(obj.dateOfBirth || obj.dob) : undefined,
    gender: obj.gender ? String(obj.gender) : undefined,
    address: obj.address ? String(obj.address) : undefined,
    businessName: obj.businessName ? String(obj.businessName) : undefined,
    businessType: obj.businessType ? String(obj.businessType) : undefined,
    businessAddress: obj.businessAddress ? String(obj.businessAddress) : undefined,
    monthlyIncome: typeof obj.monthlyIncome === "number" ? obj.monthlyIncome : undefined,
    monthlyExpenses: typeof obj.monthlyExpenses === "number" ? obj.monthlyExpenses : undefined,
    existingLoans: typeof obj.existingLoans === "number" ? obj.existingLoans : undefined,
    evidence: extractMemberEvidence(obj),
  };
}

function extractMemberEvidence(member: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};

  const evidenceSources = [
    member.evidence,
    member.documents,
    member.files,
    member.uploads,
  ];

  for (const source of evidenceSources) {
    if (source && typeof source === "object") {
      const obj = source as Record<string, unknown>;
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string" && value.startsWith("http")) {
          result[key] = value;
        }
      }
    }
  }

  for (const key of EVIDENCE_KEYS) {
    const directValue = member[key];
    if (typeof directValue === "string" && directValue.startsWith("http")) {
      result[key] = directValue;
    }
  }

  return result;
}

export function extractGlobalEvidence(payload: Payload): Record<string, string> {
  if (!payload) return {};

  const result: Record<string, string> = {};

  const evidenceSources = [
    safeGet<unknown>(payload, "evidence"),
    safeGet<unknown>(payload, "documents"),
    safeGet<unknown>(payload, "files"),
  ];

  for (const source of evidenceSources) {
    if (source && typeof source === "object" && !Array.isArray(source)) {
      const obj = source as Record<string, unknown>;
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string" && value.startsWith("http")) {
          result[key] = value;
        }
      }
    }
  }

  return result;
}

export function extractContract(payload: Payload): Contract | undefined {
  if (!payload) return undefined;

  const contractData = safeGet<Record<string, unknown>>(payload, "contract");
  if (!contractData) return undefined;

  const signaturesRaw = safeGet<unknown[]>(contractData, "signatures") ||
    safeGet<unknown[]>(payload, "signatures") ||
    [];

  const signatures: ContractSignature[] = isArray(signaturesRaw)
    ? signaturesRaw.map((s) => normalizeSignature(s))
    : [];

  return {
    contractId: contractData.contractId ? String(contractData.contractId) : undefined,
    createdAt: contractData.createdAt ? String(contractData.createdAt) : undefined,
    signatures,
  };
}

function normalizeSignature(raw: unknown): ContractSignature {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const obj = raw as Record<string, unknown>;

  return {
    memberId: obj.memberId ? String(obj.memberId) : undefined,
    name: obj.name || obj.memberName ? String(obj.name || obj.memberName) : undefined,
    signedAt: obj.signedAt ? String(obj.signedAt) : undefined,
    signatureUrl: obj.signatureUrl || obj.signature ? String(obj.signatureUrl || obj.signature) : undefined,
  };
}

export function findLeader(members: Member[]): Member | undefined {
  return members.find((m) => m.isLeader) || members[0];
}

export function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "--";
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return String(value);
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "--";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
