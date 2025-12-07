"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function Home() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!token) {
        router.replace("/auth");
      } else {
        router.replace("/dashboard");
      }
      setLoading(false);
    }, 50);

    return () => clearTimeout(t);
  }, [token, router]);

  if (loading) return <div className="">Loading...</div>;

  return null;
}
