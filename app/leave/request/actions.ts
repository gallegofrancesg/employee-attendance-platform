"use server";

import { createClient } from "@/lib/supabase/server";

export type LeaveRequestActionState = {
  message: string;
  success: boolean;
};

const initialState: LeaveRequestActionState = {
  message: "",
  success: false,
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function submitLeaveRequest(
  _previousState: LeaveRequestActionState,
  formData: FormData,
): Promise<LeaveRequestActionState> {
  const leaveType = formData.get("leave_type");
  const startDate = formData.get("start_date");
  const endDate = formData.get("end_date");
  const reason = formData.get("reason");

  if (
    (leaveType !== "VL" && leaveType !== "SL") ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    typeof reason !== "string" ||
    !reason.trim()
  ) {
    return { ...initialState, message: "Complete all fields before submitting." };
  }

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { ...initialState, message: "Enter valid start and end dates." };
  }

  if (endDate < startDate) {
    return {
      ...initialState,
      message: "The end date cannot be earlier than the start date.",
    };
  }

  const numberOfDays =
    (Date.parse(`${endDate}T00:00:00.000Z`) -
      Date.parse(`${startDate}T00:00:00.000Z`)) /
      86_400_000 +
    1;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ...initialState,
      message: "Your session could not be verified. Please sign in again.",
    };
  }

  const { data: overlaps, error: overlapError } = await supabase
    .from("leave_requests")
    .select("id")
    .eq("employee_id", user.id)
    .in("status", ["pending", "approved"])
    .lte("start_date", endDate)
    .gte("end_date", startDate)
    .limit(1);

  if (overlapError) {
    return {
      ...initialState,
      message: `Could not check for overlapping requests: ${overlapError.message}`,
    };
  }

  if (overlaps?.length) {
    return {
      ...initialState,
      message: "These dates overlap an existing pending or approved request.",
    };
  }

  const { error: insertError } = await supabase.from("leave_requests").insert({
    employee_id: user.id,
    leave_type: leaveType,
    start_date: startDate,
    end_date: endDate,
    number_of_days: numberOfDays,
    reason: reason.trim(),
    status: "pending",
  });

  if (insertError) {
    return {
      ...initialState,
      message: `Could not submit the leave request: ${insertError.message}`,
    };
  }

  return {
    message: "Your leave request was submitted successfully.",
    success: true,
  };
}
