"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const DynamicBarChart = dynamic(
  () => import("./BarChartWrapper"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
);

export const DynamicPieChart = dynamic(
  () => import("./PieChartWrapper"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-full" />,
  }
);
