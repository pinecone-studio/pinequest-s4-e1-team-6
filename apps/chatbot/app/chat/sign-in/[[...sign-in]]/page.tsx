import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="text-black">
      <SignIn />
    </div>
  )
}
