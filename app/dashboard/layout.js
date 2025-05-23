// app/dashboard/layout.js
"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) router.replace("/login");
      else {
        setUserEmail(session.user.email);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando sesión…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex bg-white text-black">
      <Sidebar userEmail={userEmail} />
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
