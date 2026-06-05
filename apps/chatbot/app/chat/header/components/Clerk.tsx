"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useRef } from "react";

export const ClerkAuth = ({ collapsed }: { collapsed: boolean }) => {
  const { isSignedIn, user } = useUser();
  const btnRef = useRef<HTMLDivElement>(null);

  const name =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "User";

  if (!isSignedIn) {
    return (
      <SignInButton mode="redirect">
        <button
          className={`
            flex items-center rounded-xl py-2 transition
            hover:bg-black/5 dark:hover:bg-white/10
            ${collapsed ? "justify-center px-2" : "gap-2 px-3 w-full"}
          `}
        >
          👤
          {!collapsed && <span className="text-sm">Sign in</span>}
        </button>
      </SignInButton>
    );
  }

  const handleClick = () => {
    const trigger = btnRef.current?.querySelector("button");
    trigger?.click();
  };

  return (
    <div
      className={`
        group relative flex items-center rounded-xl py-2 cursor-pointer
        hover:bg-black/5 dark:hover:bg-white/10 transition
        ${collapsed ? "justify-center px-2" : "gap-2 px-3 w-full"}
      `}
      onClick={handleClick}
    >
      <div
        ref={btnRef}
        className="pointer-events-none absolute opacity-0 w-0 h-0 overflow-hidden"
      >
        <UserButton />
      </div>

      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-black/10 dark:ring-white/10">
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-xs font-semibold truncate">{name}</div>
          <div className="text-[11px] opacity-70 truncate">
            {user?.emailAddresses?.[0]?.emailAddress}
          </div>
        </div>
      )}

      {collapsed && (
        <div
          className="
            pointer-events-none
            absolute left-full ml-3 top-1/2 -translate-y-1/2
            bg-black/90 text-white dark:bg-white dark:text-black
            px-3 py-2 rounded-lg
            opacity-0 translate-x-[-6px]
            group-hover:opacity-100 group-hover:translate-x-0
            transition-all duration-200
            z-[9999] w-max max-w-[220px]
          "
        >
          <div className="text-xs font-semibold">{name}</div>
          <div className="text-[11px] opacity-70 break-words">
            {user?.emailAddresses?.[0]?.emailAddress}
          </div>
        </div>
      )}
    </div>
  );
};
