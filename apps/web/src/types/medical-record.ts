export type MedicalRecordCategory =
  | "exam"
  | "prescription"
  | "report"
  | "vaccine"
  | "consultation"
  | "other";

export type MedicalRecord = {
  id: string;
  patientId: string;
  title: string;
  category: MedicalRecordCategory;
  issuedAt: string;
  issuerName: string;
  hash?: string;
  cid?: string;
};
