
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data
const employeeData = [
  { month: "Jan", hired: 12, departed: 4 },
  { month: "Feb", hired: 18, departed: 5 },
  { month: "Mar", hired: 15, departed: 7 },
  { month: "Apr", hired: 20, departed: 3 },
  { month: "May", hired: 22, departed: 8 },
  { month: "Jun", hired: 19, departed: 10 },
  { month: "Jul", hired: 25, departed: 6 },
  { month: "Aug", hired: 15, departed: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-lg shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-hrms-teal">
          Hired: <span className="font-medium">{payload[0].value}</span>
        </p>
        <p className="text-hrms-danger">
          Departed: <span className="font-medium">{payload[1].value}</span>
        </p>
      </div>
    );
  }

  return null;
};

export function EmployeeTrendChart() {
  const isMobile = useIsMobile();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Employee Trends</CardTitle>
        <CardDescription>Employee hiring and attrition over time</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={employeeData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F766E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDeparted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="hired"
                stroke="#0F766E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorHired)"
              />
              <Area
                type="monotone"
                dataKey="departed"
                stroke="#EF4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDeparted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
