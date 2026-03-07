"use client";

import { useState } from "react";
import { Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function AccountManagement() {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chartchemistry-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      signOut({ callbackUrl: "/" });
    } catch {
      alert("Failed to delete account. Please try again.");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading font-semibold">Account & Data</h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export My Data
        </Button>
      </div>

      <div className="border-t border-border pt-4">
        {!showConfirm ? (
          <Button
            variant="outline"
            className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        ) : (
          <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">
                  Delete your account?
                </p>
                <p className="text-sm text-muted-foreground">
                  This permanently deletes all your data including birth
                  profiles, reports, and chat history. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Yes, Delete Everything
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
