// app/dashboard/layout.js
"use client";

import { HeaderProvider, useHeader } from "@/context/HeaderContext";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        router.replace("/login");
      } else {
        setUserEmail(session.user.email);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <main className="flex-1 p-10 overflow-auto">
        <p>Cargando sesión…</p>
      </main>
    );
  }

  return (
    <HeaderProvider>
      <DashboardLayoutContent userEmail={userEmail}>
        {children}
      </DashboardLayoutContent>
    </HeaderProvider>
  );
}

function DashboardLayoutContent({ children, userEmail }) {
  const { header } = useHeader();

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white text-black">
      <aside className="w-64 h-screen overflow-y-auto border-r bg-white">
        <Sidebar userEmail={userEmail} />
      </aside>

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <header className="h-16 flex-shrink-0 border-b bg-white">
          <DashboardHeader
            title={header.title}
            subtitle={header.subtitle}
            actions={header.actions}
          />
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
