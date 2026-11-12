"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type LeaveDecision = "approved" | "rejected";

export type ReviewActionResult = {
  success: boolean;
  message: string;
};

export async function reviewLeaveRequest(
  requestId: string,
  decision: LeaveDecision,
  reviewComment: string,
): Promise<ReviewActionResult> {
  if (!/^\d+$/.test(requestId)) {
    return { success: false, message: "Invalid leave request." };
  }

  if (decision !== "approved" && decision !== "rejected") {
    return { success: false, message: "Invalid review decision." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Your session could not be verified. Please sign in again.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      success: false,
      message: `Could not verify manager access: ${profileError.message}`,
    };
  }

  if (profile?.role !== "manager") {
    return {
      success: false,
      message: "You are not authorized to review leave requests.",
    };
  }

  const { error: rpcError } = await supabase.rpc("review_leave_request", {
    request_id: requestId,
    decision,
    review_comment: reviewComment.trim(),
  });

  if (rpcError) {
    const errorText = rpcError.message.toLowerCase();

    if (errorText.includes("balance") || errorText.includes("insufficient")) {
      return {
        success: false,
        message:
          "Approval failed because the employee has insufficient leave balance.",
      };
    }

    if (errorText.includes("already") || errorText.includes("reviewed")) {
      return {
        success: false,
        message:
          "This request has already been reviewed. Refresh the list to see its current status.",
      };
    }

    return {
      success: false,
      message: `Could not review this request: ${rpcError.message}`,
    };
  }

  revalidatePath("/manager/leave-requests");
  return {
    success: true,
    message: `Request ${decision}.`,
  };
}
