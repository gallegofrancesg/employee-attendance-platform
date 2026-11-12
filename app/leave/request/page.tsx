import Link from "next/link";
import { redirect } from "next/navigation";

import { LeaveRequestForm } from "@/components/leave-request-form";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function LeaveRequestPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: requests, error: requestsError } = await supabase
    .from("leave_requests")
    .select(
      "id, leave_type, start_date, end_date, number_of_days, reason, status",
    )
    .eq("employee_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10">
      <nav className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="text-sm font-medium underline underline-offset-4"
        >
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Leave requests</h1>
      </nav>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Request leave</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select leave type, dates, and provide a reason.
        </p>
        <div className="mt-6">
          <LeaveRequestForm />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Your previous requests</h2>

        {requestsError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Could not load your previous requests: {requestsError.message}
          </p>
        ) : !requests?.length ? (
          <p className="mt-4 rounded-md border bg-card p-4 text-sm text-muted-foreground">
            You have not submitted any leave requests yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {requests.map((request) => (
              <article
                key={request.id}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    {request.leave_type === "VL"
                      ? "Vacation Leave (VL)"
                      : "Sick Leave (SL)"}
                  </h3>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                    {request.status}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Dates</dt>
                    <dd>
                      {request.start_date} to {request.end_date}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Number of days</dt>
                    <dd>{request.number_of_days}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Reason</dt>
                    <dd className="whitespace-pre-wrap">{request.reason}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
