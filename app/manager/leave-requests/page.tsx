import { redirect } from "next/navigation";

import { ManagerLeaveRequests } from "@/components/manager-leave-requests";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function ManagerLeaveRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <main className="mx-auto w-full max-w-5xl px-5 py-10">
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not verify your manager profile: {profileError.message}
        </p>
      </main>
    );
  }

  if (profile?.role !== "manager") {
    redirect("/dashboard");
  }

  const { data: requests, error: requestError } = await supabase
    .from("leave_requests")
    .select(
      "id, employee_id, leave_type, start_date, end_date, number_of_days, reason, status, manager_comment",
    )
    .order("created_at", { ascending: false });

  const employeeIds = [
    ...new Set((requests ?? []).map((request) => request.employee_id)),
  ];

  const { data: employeeProfiles, error: employeeError } = employeeIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", employeeIds)
    : { data: [], error: null };

  const employees = Object.fromEntries(
    (employeeProfiles ?? []).map((employee) => [
      employee.id,
      { full_name: employee.full_name, email: employee.email },
    ]),
  );

  return (
    <ManagerLeaveRequests
      requests={requests ?? []}
      employees={employees}
      requestError={requestError?.message ?? null}
      employeeError={employeeError?.message ?? null}
    />
  );
}
