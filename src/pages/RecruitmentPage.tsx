
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, FileText, Users, Filter, BarChart } from "lucide-react";

const RecruitmentPage = () => {
  const [activeTab, setActiveTab] = useState("jobs");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Recruitment</h1>
          <Button className="flex gap-2">
            <UserPlus className="h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="jobs">Open Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5].map((job) => (
                <Card key={job} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Senior Full Stack Developer</CardTitle>
                        <p className="text-sm text-muted-foreground">Engineering • Full-time</p>
                      </div>
                      <span className="bg-hrms-teal/10 text-hrms-teal text-xs font-medium px-2 py-1 rounded-full">
                        12 Applicants
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span>Remote / San Francisco</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">Department</span>
                          <span>Engineering</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">Posted</span>
                          <span>2 weeks ago</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex items-center justify-between">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Applications</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </div>
            <p className="text-muted-foreground">Applications content will be displayed here.</p>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Candidate Pool</h2>
              <Button variant="outline" size="sm">Add Candidate</Button>
            </div>
            <p className="text-muted-foreground">Candidates content will be displayed here.</p>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recruitment Analytics</h2>
              <Button variant="outline" size="sm">Export Report</Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Time to Fill</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24 days</div>
                  <p className="text-xs text-muted-foreground">5% faster than last quarter</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cost per Hire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,250</div>
                  <p className="text-xs text-muted-foreground">12% lower than industry average</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">186</div>
                  <p className="text-xs text-muted-foreground">+32 new this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">+8% from previous period</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RecruitmentPage;
