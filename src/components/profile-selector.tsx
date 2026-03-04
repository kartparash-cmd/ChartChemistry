"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
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
}

interface ProfileSelectorProps {
  profiles: Profile[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  excludeId?: string;
  label?: string;
}

function formatBirthDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type { Profile };

export function ProfileSelector({
  profiles,
  value,
  onValueChange,
  placeholder = "Select a profile",
  excludeId,
  label,
}: ProfileSelectorProps) {
  const filteredProfiles = excludeId
    ? profiles.filter((p) => p.id !== excludeId)
    : profiles;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] transition-colors">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-navy-light/95 backdrop-blur-xl">
          {filteredProfiles.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No profiles available
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <SelectItem
                key={profile.id}
                value={profile.id}
                className="cursor-pointer focus:bg-white/5"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{profile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBirthDate(profile.birthDate)} -- {profile.birthCity}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
