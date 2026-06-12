import { FavoriteDrawer } from "./favorites/FavoriteDrawer";

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
