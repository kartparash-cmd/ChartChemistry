"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Info, MapPin, Loader2 } from "lucide-react";
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
  onSubmit: (data: BirthData | null) => void;
  defaultValues?: Partial<BirthData>;
  label?: string;
  className?: string;
}

interface CityResult {
  display: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
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
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  // City autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [citySearching, setCitySearching] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Use ref for onSubmit to avoid triggering useEffect on parent re-renders
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  // Auto-notify parent whenever form validity changes
  const isValid =
    name.trim() &&
    birthDate &&
    (unknownTime || birthTime) &&
    birthCity.trim() &&
    birthCountry;

  useEffect(() => {
    if (isValid) {
      onSubmitRef.current({
        name: name.trim(),
        birthDate,
        birthTime: unknownTime ? undefined : birthTime,
        birthCity: birthCity.trim(),
        birthCountry,
        latitude: selectedCoords?.lat,
        longitude: selectedCoords?.lon,
      });
    } else {
      onSubmitRef.current(null);
    }
  }, [
    name,
    birthDate,
    birthTime,
    unknownTime,
    birthCity,
    birthCountry,
    isValid,
    selectedCoords,
  ]);

  // City search with debounce
  const searchCities = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (query.length < 2) {
        setCitySuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setCitySearching(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ q: query });
          if (birthCountry) params.set("country", birthCountry);

          const res = await fetch(`/api/city-search?${params}`);
          if (res.ok) {
            const data: CityResult[] = await res.json();
            setCitySuggestions(data);
            setShowSuggestions(data.length > 0);
          }
        } catch {
          // Silently fail — user can still type city name manually
        } finally {
          setCitySearching(false);
        }
      }, 500);
    },
    [birthCountry]
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
    setBirthCity(result.city);
    setSelectedCoords({ lat: result.lat, lon: result.lon });
    setShowSuggestions(false);
  };

  return (
    <div
      className={cn("glass-card rounded-2xl p-6 space-y-5", className)}
    >
      <h3 className="text-lg font-semibold text-foreground">{label}</h3>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor={`name-${label}`}>Name</Label>
        <Input
          id={`name-${label}`}
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background/50"
        />
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label htmlFor={`birthDate-${label}`}>Date of Birth</Label>
        <Input
          id={`birthDate-${label}`}
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="bg-background/50"
        />
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
                if (e.target.checked) setBirthTime("");
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
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
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
          <Input
            id={`birthTime-${label}`}
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="bg-background/50"
          />
        )}
      </div>

      {/* Birth City — with autocomplete */}
      <div className="space-y-2">
        <Label htmlFor={`birthCity-${label}`}>Birth City</Label>
        <div className="relative">
          <Input
            ref={cityInputRef}
            id={`birthCity-${label}`}
            placeholder="Start typing a city name..."
            value={birthCity}
            onChange={(e) => {
              setBirthCity(e.target.value);
              setSelectedCoords(null);
              searchCities(e.target.value);
            }}
            onFocus={() => {
              if (citySuggestions.length > 0) setShowSuggestions(true);
            }}
            autoComplete="off"
            className={cn(
              "bg-background/50 pr-8",
              selectedCoords && "border-green-500/50"
            )}
          />
          {citySearching ? (
            <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : selectedCoords ? (
            <MapPin className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
          ) : null}

          {/* Suggestions dropdown */}
          {showSuggestions && citySuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
            >
              {citySuggestions.map((result, i) => (
                <button
                  key={`${result.lat}-${result.lon}-${i}`}
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
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
      </div>

      {/* Birth Country */}
      <div className="space-y-2">
        <Label>Birth Country</Label>
        <Select
          value={birthCountry}
          onValueChange={(value) => setBirthCountry(value)}
        >
          <SelectTrigger className="w-full bg-background/50">
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
      </div>

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
    </div>
  );
}
