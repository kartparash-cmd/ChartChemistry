"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BirthData {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity: string;
  birthCountry: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  defaultValues?: Partial<BirthData>;
  label?: string;
  className?: string;
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Germany",
  "France",
  "Brazil",
  "Mexico",
  "Japan",
  "South Korea",
  "China",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Austria",
  "Belgium",
  "Portugal",
  "Ireland",
  "New Zealand",
  "South Africa",
  "Argentina",
  "Colombia",
  "Chile",
  "Peru",
  "Philippines",
  "Thailand",
  "Vietnam",
  "Indonesia",
  "Malaysia",
  "Singapore",
  "Nigeria",
  "Kenya",
  "Egypt",
  "Turkey",
  "Russia",
  "Poland",
  "Czech Republic",
  "Greece",
  "Romania",
  "Hungary",
  "Israel",
  "United Arab Emirates",
  "Saudi Arabia",
  "Pakistan",
];

export function BirthDataForm({
  onSubmit,
  defaultValues,
  label = "Your Details",
  className,
}: BirthDataFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [birthDate, setBirthDate] = useState(defaultValues?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(defaultValues?.birthTime ?? "");
  const [unknownTime, setUnknownTime] = useState(false);
  const [birthCity, setBirthCity] = useState(defaultValues?.birthCity ?? "");
  const [birthCountry, setBirthCountry] = useState(
    defaultValues?.birthCountry ?? ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!birthDate) {
      newErrors.birthDate = "Date of birth is required";
    }
    if (!unknownTime && !birthTime) {
      newErrors.birthTime = "Birth time is required (or select unknown)";
    }
    if (!birthCity.trim()) {
      newErrors.birthCity = "Birth city is required";
    }
    if (!birthCountry) {
      newErrors.birthCountry = "Birth country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, birthDate, birthTime, unknownTime, birthCity, birthCountry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      birthDate,
      birthTime: unknownTime ? undefined : birthTime,
      birthCity: birthCity.trim(),
      birthCountry,
    });
  };

  const isValid =
    name.trim() &&
    birthDate &&
    (unknownTime || birthTime) &&
    birthCity.trim() &&
    birthCountry;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "glass-card rounded-2xl p-6 space-y-5",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-foreground">{label}</h3>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor={`name-${label}`}>Name</Label>
        <Input
          id={`name-${label}`}
          placeholder="Enter name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          className={cn(
            "bg-background/50",
            errors.name && "border-destructive"
          )}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label htmlFor={`birthDate-${label}`}>Date of Birth</Label>
        <Input
          id={`birthDate-${label}`}
          type="date"
          value={birthDate}
          onChange={(e) => {
            setBirthDate(e.target.value);
            if (errors.birthDate)
              setErrors((prev) => ({ ...prev, birthDate: "" }));
          }}
          max={new Date().toISOString().split("T")[0]}
          className={cn(
            "bg-background/50",
            errors.birthDate && "border-destructive"
          )}
        />
        {errors.birthDate && (
          <p className="text-xs text-destructive">{errors.birthDate}</p>
        )}
      </div>

      {/* Birth Time */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`birthTime-${label}`}>Birth Time</Label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`unknownTime-${label}`}
              checked={unknownTime}
              onChange={(e) => {
                setUnknownTime(e.target.checked);
                if (e.target.checked) {
                  setBirthTime("");
                  setErrors((prev) => ({ ...prev, birthTime: "" }));
                }
              }}
              className="h-4 w-4 rounded border-border accent-cosmic-purple"
            />
            <label
              htmlFor={`unknownTime-${label}`}
              className="text-xs text-muted-foreground cursor-pointer"
            >
              I don&apos;t know my birth time
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]">
                <p>
                  Without birth time, we cannot calculate house placements or
                  exact Moon position. Your report will still include planetary
                  aspects and sign compatibility.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        {!unknownTime && (
          <>
            <Input
              id={`birthTime-${label}`}
              type="time"
              value={birthTime}
              onChange={(e) => {
                setBirthTime(e.target.value);
                if (errors.birthTime)
                  setErrors((prev) => ({ ...prev, birthTime: "" }));
              }}
              className={cn(
                "bg-background/50",
                errors.birthTime && "border-destructive"
              )}
            />
            {errors.birthTime && (
              <p className="text-xs text-destructive">{errors.birthTime}</p>
            )}
          </>
        )}
      </div>

      {/* Birth City */}
      <div className="space-y-2">
        <Label htmlFor={`birthCity-${label}`}>Birth City</Label>
        <Input
          id={`birthCity-${label}`}
          placeholder="e.g., New York, London, Mumbai"
          value={birthCity}
          onChange={(e) => {
            setBirthCity(e.target.value);
            if (errors.birthCity)
              setErrors((prev) => ({ ...prev, birthCity: "" }));
          }}
          className={cn(
            "bg-background/50",
            errors.birthCity && "border-destructive"
          )}
        />
        {errors.birthCity && (
          <p className="text-xs text-destructive">{errors.birthCity}</p>
        )}
      </div>

      {/* Birth Country */}
      <div className="space-y-2">
        <Label>Birth Country</Label>
        <Select
          value={birthCountry}
          onValueChange={(value) => {
            setBirthCountry(value);
            if (errors.birthCountry)
              setErrors((prev) => ({ ...prev, birthCountry: "" }));
          }}
        >
          <SelectTrigger
            className={cn(
              "w-full bg-background/50",
              errors.birthCountry && "border-destructive"
            )}
          >
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.birthCountry && (
          <p className="text-xs text-destructive">{errors.birthCountry}</p>
        )}
      </div>

      {/* Hidden submit button for form submission, main CTA is external */}
      <input type="submit" className="hidden" />

      {/* Visual indicator of form completeness */}
      <div className="flex items-center gap-2 pt-1">
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            isValid ? "bg-green-500" : "bg-muted-foreground/30"
          )}
        />
        <span className="text-xs text-muted-foreground">
          {isValid ? "All details filled" : "Please complete all fields"}
        </span>
      </div>
    </form>
  );
}
