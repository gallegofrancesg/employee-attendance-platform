import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function DashboardPage() {
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
    .select("full_name, email, role, vl_balance, sl_balance")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Employee dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Welcome, {profile?.full_name || user.email || "Employee"}
          </h1>
        </div>
        <LogoutButton />
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/leave/request"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Request leave
        </Link>
        {profile?.role === "manager" && (
          <Link
            href="/manager/leave-requests"
            className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-sm hover:bg-accent"
          >
            Manager Approvals
          </Link>
        )}
      </div>

      {profileError ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load your profile: {profileError.message}
        </p>
      ) : !profile ? (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No employee profile was found for this account.
        </p>
      ) : (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <ProfileValue label="Full name" value={profile.full_name || "Not set"} />
          <ProfileValue label="Email" value={profile.email || user.email || "Not set"} />
          <ProfileValue label="Role" value={profile.role || "Not set"} />
          <ProfileValue label="VL balance" value={String(profile.vl_balance ?? 0)} />
          <ProfileValue label="SL balance" value={String(profile.sl_balance ?? 0)} />
        </section>
      )}
    </main>
  );
}

function ProfileValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}
