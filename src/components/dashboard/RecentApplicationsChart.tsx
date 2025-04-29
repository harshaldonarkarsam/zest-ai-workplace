
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Sample data for recent applications
const applicationData = [
  {
    name: "Engineering",
    applied: 35,
    interviewed: 12,
    hired: 5,
  },
  {
    name: "Marketing",
    applied: 28,
    interviewed: 10,
    hired: 4,
  },
  {
    name: "Sales",
    applied: 45,
    interviewed: 15,
    hired: 7,
  },
  {
    name: "Design",
    applied: 22,
    interviewed: 8,
    hired: 3,
  },
  {
    name: "Product",
    applied: 18,
    interviewed: 6,
    hired: 2,
  },
  {
    name: "Finance",
    applied: 15,
    interviewed: 5,
    hired: 2,
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-lg shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-[#0EA5E9]">
          Applied: <span className="font-medium">{payload[0].value}</span>
        </p>
        <p className="text-[#F59E0B]">
          Interviewed: <span className="font-medium">{payload[1].value}</span>
        </p>
        <p className="text-[#10B981]">
          Hired: <span className="font-medium">{payload[2].value}</span>
        </p>
      </div>
    );
  }

  return null;
};

export function RecentApplicationsChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>
          Job applications by department in the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={applicationData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="applied" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="interviewed" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hired" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
