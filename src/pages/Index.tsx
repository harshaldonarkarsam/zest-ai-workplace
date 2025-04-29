
import { useState } from "react";
import { 
  Users, 
  Briefcase, 
  BarChart2, 
  Calendar,
  Sparkles
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { AnalyticCard } from "@/components/dashboard/AnalyticCard";
import { EmployeeTrendChart } from "@/components/dashboard/EmployeeTrendChart";
import { TeamMembers } from "@/components/dashboard/TeamMembers";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentApplicationsChart } from "@/components/dashboard/RecentApplicationsChart";
import { AiInsightsCard } from "@/components/recruitment/AiInsightsCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back to your HR management dashboard
            </p>
          </div>

          <Button className="hidden sm:flex gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticCard
            title="Total Employees"
            value="423"
            icon={<Users className="h-5 w-5" />}
            trend={{
              value: "+8%",
              positive: true,
              text: "from last month",
            }}
          />
          <AnalyticCard
            title="Open Positions"
            value="18"
            icon={<Briefcase className="h-5 w-5" />}
            trend={{
              value: "+4",
              positive: true,
              text: "new this week",
            }}
          />
          <AnalyticCard
            title="Performance Score"
            value="86%"
            icon={<BarChart2 className="h-5 w-5" />}
            trend={{
              value: "+2.5%",
              positive: true,
              text: "from last quarter",
            }}
          />
          <AnalyticCard
            title="Upcoming Reviews"
            value="36"
            icon={<Calendar className="h-5 w-5" />}
            description="Next 30 days"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-2">
            <EmployeeTrendChart />
          </div>
          <div className="col-span-1">
            <TeamMembers />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-2">
            <RecentApplicationsChart />
          </div>
          <div className="col-span-1 space-y-6">
            <UpcomingEvents />
            <AiInsightsCard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
