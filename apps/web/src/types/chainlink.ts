export type ChainlinkWorkflowStatus = "pending" | "running" | "completed" | "failed";

export type ChainlinkVerification = {
  id: string;
  workflowId: string;
  status: ChainlinkWorkflowStatus;
  transactionHash?: string;
  createdAt: string;
};
