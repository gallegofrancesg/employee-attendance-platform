import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, vl_balance, sl_balance")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-red-700">Profile not found</h1>
          <p className="mt-4 text-sm text-slate-600">
            No profile was found for this account. Please contact support or try
            signing in again.
          </p>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Employee dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Welcome, {profile.full_name || "Employee"}
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Full name
            </p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {profile.full_name || "Not set"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Email
            </p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {profile.email || user.email || "Not set"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Role
            </p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {profile.role || "Not set"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              VL balance
            </p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {profile.vl_balance ?? 0}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              SL balance
            </p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {profile.sl_balance ?? 0}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
