"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BirthProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string | null;
  birthCity: string;
  birthCountry: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isOwner: boolean;
  chartData?: unknown;
  createdAt: string;
}

interface ProfileFormData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
}

interface CityResult {
  display: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

interface ProfileFormSubmitData extends ProfileFormData {
  latitude: number | null;
  longitude: number | null;
}

// ---------------------------------------------------------------------------
// Skeleton Card component
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <Card className="rounded-2xl border-white/10 bg-white/[0.03] animate-pulse">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-3 w-20 rounded bg-white/5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-white/5" />
          <div className="h-3 w-3/4 rounded bg-white/5" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded bg-white/5" />
          <div className="h-8 w-16 rounded bg-white/5" />
        </div>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Profile Form (used for both Add and Edit)
// ---------------------------------------------------------------------------

function ProfileForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormSubmitData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<ProfileFormData>(
    initialData ?? {
      name: "",
      birthDate: "",
      birthTime: "",
      birthCity: "",
      birthCountry: "",
    }
  );
  const [unknownBirthTime, setUnknownBirthTime] = useState(
    initialData ? !initialData.birthTime : false
  );

  // City autocomplete state
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // City search with debounce
  const searchCities = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (query.length < 2) {
        setCitySuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setCityLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ q: query });
          if (form.birthCountry) params.set("country", form.birthCountry);

          const res = await fetch(`/api/city-search?${params}`);
          if (res.ok) {
            const data: CityResult[] = await res.json();
            setCitySuggestions(data);
            setShowSuggestions(data.length > 0);
          }
        } catch {
          // Silently fail — user can still type city name manually
        } finally {
          setCityLoading(false);
        }
      }, 500);
    },
    [form.birthCountry]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCitySelect = (result: CityResult) => {
    setForm((prev) => ({ ...prev, birthCity: result.city }));
    setSelectedCoords({ lat: result.lat, lon: result.lon });
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || citySuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < citySuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : citySuggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleCitySelect(citySuggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      birthTime: unknownBirthTime ? "" : form.birthTime,
      latitude: selectedCoords?.lat ?? null,
      longitude: selectedCoords?.lon ?? null,
    });
  };

  const isValid =
    form.name.trim().length > 0 &&
    form.birthDate.length > 0 &&
    form.birthCity.trim().length > 0 &&
    form.birthCountry.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Name *</Label>
        <Input
          id="profile-name"
          placeholder="e.g. Jane Doe"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          className="h-11 border-white/10 bg-white/5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profile-birth-date">Birth Date *</Label>
          <Input
            id="profile-birth-date"
            type="date"
            value={form.birthDate}
            onChange={(e) => handleChange("birthDate", e.target.value)}
            required
            className="h-11 border-white/10 bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-birth-time">Birth Time</Label>
          <Input
            id="profile-birth-time"
            type="time"
            value={form.birthTime}
            onChange={(e) => handleChange("birthTime", e.target.value)}
            disabled={unknownBirthTime}
            className="h-11 border-white/10 bg-white/5 disabled:opacity-40"
          />
          <label
            htmlFor="unknown-birth-time"
            className="flex cursor-pointer items-center gap-2 rounded-lg py-2 text-xs text-muted-foreground select-none"
          >
            <input
              id="unknown-birth-time"
              type="checkbox"
              checked={unknownBirthTime}
              onChange={(e) => {
                setUnknownBirthTime(e.target.checked);
                if (e.target.checked) {
                  handleChange("birthTime", "");
                }
              }}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cosmic-purple"
            />
            I don&apos;t know the birth time
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Birth City with autocomplete */}
        <div className="space-y-2">
          <Label htmlFor="profile-birth-city">Birth City *</Label>
          <div className="relative">
            <Input
              ref={cityInputRef}
              id="profile-birth-city"
              placeholder="e.g. New York"
              value={form.birthCity}
              onChange={(e) => {
                handleChange("birthCity", e.target.value);
                setSelectedCoords(null);
                setHighlightedIndex(-1);
                searchCities(e.target.value);
              }}
              onFocus={() => {
                if (citySuggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleCityKeyDown}
              role="combobox"
              aria-expanded={showSuggestions && citySuggestions.length > 0}
              aria-autocomplete="list"
              aria-controls="profile-city-listbox"
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `profile-city-option-${highlightedIndex}`
                  : undefined
              }
              autoComplete="off"
              required
              className={cn(
                "h-11 border-white/10 bg-white/5 pr-8",
                selectedCoords && "border-green-500/50"
              )}
            />
            {cityLoading ? (
              <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : selectedCoords ? (
              <MapPin className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
            ) : null}

            {/* Suggestions dropdown */}
            {showSuggestions && citySuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                id="profile-city-listbox"
                role="listbox"
                aria-live="polite"
                className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-navy-light shadow-lg max-h-48 overflow-y-auto"
              >
                {citySuggestions.map((result, i) => (
                  <button
                    key={`${result.lat}-${result.lon}-${i}`}
                    id={`profile-city-option-${i}`}
                    role="option"
                    aria-selected={i === highlightedIndex}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-white/5 transition-colors",
                      i === highlightedIndex && "bg-white/5"
                    )}
                    onClick={() => handleCitySelect(result)}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{result.city}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[result.state, result.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Warn if city typed but no coords picked */}
          {form.birthCity.trim().length > 0 && !selectedCoords && (
            <p className="text-[11px] text-amber-400/80">
              Select a suggestion for accurate chart coordinates.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-birth-country">Birth Country *</Label>
          <Input
            id="profile-birth-country"
            placeholder="e.g. United States"
            value={form.birthCountry}
            onChange={(e) => handleChange("birthCountry", e.target.value)}
            required
            className="h-11 border-white/10 bg-white/5"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-white/10"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Profile"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProfilesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<BirthProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success toast state
  const [successToast, setSuccessToast] = useState<{
    message: string;
    profileId: string;
  } | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch profiles
  const fetchProfiles = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/profile");
      if (!res.ok) {
        throw new Error("Failed to fetch profiles");
      }
      const data = await res.json();
      setProfiles(data.profiles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfiles();
    }
  }, [status, fetchProfiles]);

  // Create profile
  const handleCreate = async (formData: ProfileFormSubmitData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          birthDate: formData.birthDate,
          birthTime: formData.birthTime || null,
          birthCity: formData.birthCity.trim(),
          birthCountry: formData.birthCountry.trim(),
          latitude: formData.latitude ?? 0,
          longitude: formData.longitude ?? 0,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create profile");
      }

      const created = await res.json();
      setAddDialogOpen(false);
      await fetchProfiles();
      setSuccessToast({
        message: "Profile created! View your chart?",
        profileId: created.profile?.id ?? created.id ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update profile
  const handleUpdate = async (formData: ProfileFormSubmitData) => {
    if (!activeProfile) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/profile/${activeProfile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          birthDate: formData.birthDate,
          birthTime: formData.birthTime || null,
          birthCity: formData.birthCity.trim(),
          birthCountry: formData.birthCountry.trim(),
          ...(formData.latitude !== null && formData.longitude !== null
            ? { latitude: formData.latitude, longitude: formData.longitude }
            : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setEditDialogOpen(false);
      setActiveProfile(null);
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete profile
  const handleDelete = async () => {
    if (!activeProfile) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/profile/${activeProfile.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete profile");
      }

      setDeleteDialogOpen(false);
      setActiveProfile(null);
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format birth date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-8">
        <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-white/5" />
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen pt-8">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold">
                <span className="cosmic-text">Birth Profiles</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage birth profiles for yourself and others
              </p>
            </div>

            {/* Add Profile button */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/10 bg-navy-light">
                <DialogHeader>
                  <DialogTitle className="cosmic-text text-xl">
                    Add New Profile
                  </DialogTitle>
                </DialogHeader>
                <ProfileForm
                  onSubmit={handleCreate}
                  onCancel={() => setAddDialogOpen(false)}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Error banner */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
            <button
              type="button"
              onClick={() => fetchProfiles()}
              className="ml-3 underline hover:no-underline"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-3 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success toast */}
      {successToast && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span className="flex-1">{successToast.message}</span>
            {successToast.profileId && (
              <Link
                href={`/chart/${successToast.profileId}`}
                className="shrink-0 font-medium underline hover:no-underline"
              >
                View Chart
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="shrink-0 text-emerald-400 hover:text-emerald-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {profiles.length === 0 ? (
          /* ---- Empty state ---- */
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10">
              <Sparkles className="h-8 w-8 text-cosmic-purple-light" />
            </div>
            <h2 className="font-heading text-xl font-semibold mb-2">
              No Profiles Yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Create your first birth profile to unlock natal charts,
              compatibility reports, and personalized cosmic insights.
            </p>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/10 bg-navy-light">
                <DialogHeader>
                  <DialogTitle className="cosmic-text text-xl">
                    Add New Profile
                  </DialogTitle>
                </DialogHeader>
                <ProfileForm
                  onSubmit={handleCreate}
                  onCancel={() => setAddDialogOpen(false)}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          /* ---- Profile grid ---- */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Card key={profile.id} className="rounded-2xl border-white/10 bg-white/[0.03] flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cosmic-purple/10">
                        <User className="h-5 w-5 text-cosmic-purple-light" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">
                          {profile.name}
                        </CardTitle>
                      </div>
                    </div>
                    {profile.isOwner && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light text-[10px]"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{formatDate(profile.birthDate)}</span>
                  </div>
                  {profile.birthTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{profile.birthTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {profile.birthCity}
                      {profile.birthCountry ? `, ${profile.birthCountry}` : ""}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="default"
                    variant="outline"
                    className="border-white/10"
                  >
                    <Link href={`/chart/${profile.id}`}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View Chart
                    </Link>
                  </Button>

                  <Button
                    size="default"
                    variant="outline"
                    className="border-white/10"
                    onClick={() => {
                      setActiveProfile(profile);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>

                  {!profile.isOwner && (
                    <Button
                      size="default"
                      variant="outline"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => {
                        setActiveProfile(profile);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ---- Edit Dialog ---- */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setActiveProfile(null);
        }}
      >
        <DialogContent className="border-white/10 bg-navy-light">
          <DialogHeader>
            <DialogTitle className="cosmic-text text-xl">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          {activeProfile && (
            <ProfileForm
              initialData={{
                name: activeProfile.name,
                birthDate: activeProfile.birthDate,
                birthTime: activeProfile.birthTime ?? "",
                birthCity: activeProfile.birthCity,
                birthCountry: activeProfile.birthCountry,
              }}
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditDialogOpen(false);
                setActiveProfile(null);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Delete Confirmation Dialog ---- */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setActiveProfile(null);
        }}
      >
        <DialogContent className="border-white/10 bg-navy-light">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Profile</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {activeProfile?.name}
            </span>
            ? This action cannot be undone. Any compatibility reports associated
            with this profile will also be removed.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setActiveProfile(null);
              }}
              disabled={isSubmitting}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
