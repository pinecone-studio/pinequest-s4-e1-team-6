import { isAdmin } from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardContent from "./components/dashboard/AdminDashboardContent";
import PageWrapper from "./components/PageWrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return redirect("/chat/sign-in");

  if (!(await isAdmin())) return redirect("/chat");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      stores: {
        where: { status: "APPROVED" },
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const savedStore = user?.stores.find((store) => store.name === user.storeName);
  const storeName = savedStore?.name || user?.stores[0]?.name || null;

  return (
    <PageWrapper>
      <AdminDashboardContent
        initialStoreName={storeName}
        existingStores={user?.stores || []}
      />
    </PageWrapper>
  );
}
