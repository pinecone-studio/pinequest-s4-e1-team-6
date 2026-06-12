import { isAdmin } from "@/lib/isAdmin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PageWrapper from "../components/PageWrapper";
import AdminSettings from "../components/product/AdminSetting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const { userId } = await auth();
  if (!userId) return redirect("/chat/sign-in");

  if (!(await isAdmin())) return redirect("/");

  return (
    <PageWrapper>
      <AdminSettings />
    </PageWrapper>
  );
}
