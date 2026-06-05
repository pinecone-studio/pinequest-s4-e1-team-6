import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PageWrapper from "../components/PageWrapper";
import AdminSettings from "../components/product/AdminSetting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const { userId } = await auth();
  if (!userId) return redirect("/login");

  const user = await currentUser();
  const role = (user?.publicMetadata as any)?.role;
  if (role !== "admin") return redirect("/chat");

  return (
    <PageWrapper>
      <AdminSettings />
    </PageWrapper>
  );
}   