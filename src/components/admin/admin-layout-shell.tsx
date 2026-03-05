"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-16 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div
          className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] transition-transform md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:block`}
        >
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
