"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SyncUser() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    fetch("/api/clerk/sync-user", {
      method: "POST",
    }).catch((error) => {
      console.error("Failed to sync user:", error);
    });
  }, [isLoaded, isSignedIn]);

  return null;
}
