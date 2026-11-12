"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { reviewLeaveRequest, type LeaveDecision } from "@/app/manager/leave-requests/actions";
import { Button } from "@/components/ui/button";

type ManagerLeaveRequest = {
  id: number | string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  status: string;
  manager_comment: string | null;
};

type EmployeeProfile = {
  full_name: string | null;
  email: string | null;
};

type Props = {
  requests: ManagerLeaveRequest[];
  employees: Record<string, EmployeeProfile>;
  requestError: string | null;
  employeeError: string | null;
};

export function ManagerLeaveRequests({
  requests,
  employees,
  requestError,
  employeeError,
}: Props) {
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const reviewedRequests = requests.filter((request) => request.status !== "pending");

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Manager
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Leave approvals</h1>
      </header>

      {requestError ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load leave requests: {requestError}
        </p>
      ) : (
        <>
          {employeeError && (
            <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Could not load employee details: {employeeError}
            </p>
          )}

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Pending requests</h2>
            {pendingRequests.length ? (
              <div className="mt-4 grid gap-4">
                {pendingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    employee={employees[request.employee_id]}
                    canReview
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-md border bg-card p-4 text-sm text-muted-foreground">
                There are no pending requests.
              </p>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Reviewed requests</h2>
            {reviewedRequests.length ? (
              <div className="mt-4 grid gap-4">
                {reviewedRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    employee={employees[request.employee_id]}
                    canReview={false}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-md border bg-card p-4 text-sm text-muted-foreground">
                There are no reviewed requests.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function RequestCard({
  request,
  employee,
  canReview,
}: {
  request: ManagerLeaveRequest;
  employee: EmployeeProfile | undefined;
  canReview: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reviewComment, setReviewComment] = useState("");
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  function submitDecision(decision: LeaveDecision) {
    setFeedback(null);
    startTransition(async () => {
      const result = await reviewLeaveRequest(
        String(request.id),
        decision,
        reviewComment,
      );
      setFeedback(result);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            {employee?.full_name || "Employee profile unavailable"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {employee?.email || "Email unavailable"}
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
          {request.status}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <Detail
          label="Leave type"
          value={request.leave_type === "VL" ? "Vacation Leave (VL)" : "Sick Leave (SL)"}
        />
        <Detail
          label="Dates"
          value={`${request.start_date} to ${request.end_date}`}
        />
        <Detail label="Number of days" value={String(request.number_of_days)} />
        <Detail label="Reason" value={request.reason} />
        {!canReview && request.manager_comment && (
          <Detail label="Manager comment" value={request.manager_comment} />
        )}
      </dl>

      {canReview && (
        <div className="mt-5 border-t pt-5">
          <label
            htmlFor={`review-comment-${request.id}`}
            className="grid gap-2 text-sm font-medium"
          >
            Manager comment (optional)
            <textarea
              id={`review-comment-${request.id}`}
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              rows={3}
              disabled={isPending}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={isPending}
              onClick={() => submitDecision("approved")}
            >
              {isPending ? "Processing..." : "Approve"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => submitDecision("rejected")}
            >
              {isPending ? "Processing..." : "Reject"}
            </Button>
          </div>

          {feedback && (
            <p
              className={`mt-4 text-sm ${feedback.success ? "text-green-700" : "text-red-600"}`}
              role="status"
            >
              {feedback.message}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
