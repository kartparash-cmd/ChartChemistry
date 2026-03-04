"use client";

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/admin/user-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersResponse {
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    plan: string;
    role: string;
    createdAt: string;
    _count: { birthProfiles: number; reports: number };
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (plan !== "ALL") params.set("plan", plan);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/users?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [search, plan, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage platform users and their plans
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select value={plan} onValueChange={(v) => { setPlan(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Plans</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="PREMIUM">Premium</SelectItem>
            <SelectItem value="ANNUAL">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading users...</div>
      ) : data && data.users.length > 0 ? (
        <>
          <UserTable users={data.users} />

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.page - 1) * 20 + 1}–{Math.min(data.page * 20, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No users found.</div>
      )}
    </div>
  );
}
