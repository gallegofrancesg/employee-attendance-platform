"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitLeaveRequest,
  type LeaveRequestActionState,
} from "@/app/leave/request/actions";

const initialState: LeaveRequestActionState = {
  message: "",
  success: false,
};

function getInclusiveDays(startDate: string, endDate: string) {
  if (!startDate || !endDate || endDate < startDate) {
    return null;
  }

  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return null;
  }

  return (end - start) / 86_400_000 + 1;
}

export function LeaveRequestForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    submitLeaveRequest,
    initialState,
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const numberOfDays = getInclusiveDays(startDate, endDate);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="grid gap-2 text-sm font-medium" htmlFor="leave_type">
        Leave type
        <select
          id="leave_type"
          name="leave_type"
          required
          defaultValue="VL"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="VL">Vacation Leave (VL)</option>
          <option value="SL">Sick Leave (SL)</option>
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium" htmlFor="start_date">
          Start date
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium" htmlFor="end_date">
          End date
          <Input
            id="end_date"
            name="end_date"
            type="date"
            min={startDate || undefined}
            required
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {numberOfDays === null
          ? "Select a valid start and end date to see the number of calendar days."
          : `Requested days: ${numberOfDays}`}
      </p>

      <label className="grid gap-2 text-sm font-medium" htmlFor="reason">
        Reason
        <textarea
          id="reason"
          name="reason"
          required
          rows={4}
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </label>

      {state.message && (
        <p
          className={`text-sm ${state.success ? "text-green-700" : "text-red-600"}`}
          role="status"
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit request"}
      </Button>
    </form>
  );
}
