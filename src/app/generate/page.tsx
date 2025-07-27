import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import EmailTemplateGenerator from "@/components/email-template-generator";
import DashboardNavbar from "@/components/dashboard-navbar";

export default async function GeneratePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <SubscriptionCheck>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <DashboardNavbar />
        <EmailTemplateGenerator />
      </div>
    </SubscriptionCheck>
  );
}
