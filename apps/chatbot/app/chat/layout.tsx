import { FavoriteDrawer } from "../store/components/FavoriteDrawer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FavoriteDrawer />
      {children}
    </>
  );
}
