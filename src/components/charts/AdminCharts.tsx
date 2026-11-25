"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const DynamicBarChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } = mod;
      return function RevenueChartComponent({
        data,
      }: {
        data: Array<{ month: string; revenue: number }>;
      }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
);

const DynamicPieChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } = mod;
      return function PriorityChartComponent({
        data,
      }: {
        data: Array<{ name: string; value: number; color: string }>;
      }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      });
    }),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-full" />,
  }
);

export { DynamicBarChart, DynamicPieChart };
