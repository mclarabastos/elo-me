"use server";

import { createAccessRequest } from "@/lib/api";
import type {
  AccessRequestCreate,
  AccessRequestResponse,
} from "@/types/api";

export async function createDoctorAccessRequestAction(
  payload: AccessRequestCreate
): Promise<AccessRequestResponse> {
  return createAccessRequest(payload);
}