"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ChartWheel = dynamic(
  () => import("@/components/chart-wheel").then((mod) => mod.ChartWheel),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-cosmic-purple-light" />
      </div>
    ),
    ssr: false,
  }
);

export { ChartWheel as LazyChartWheel };
