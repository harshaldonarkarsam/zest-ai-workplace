
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Trophy, Users, Calendar } from "lucide-react";

const TrainingPage = () => {
  const [activeTab, setActiveTab] = useState("courses");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Training & Development</h1>
          <Button className="flex gap-2">
            <BookOpen className="h-4 w-4" />
            Add New Course
          </Button>
        </div>

        <Tabs defaultValue="courses" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((course) => (
                <Card key={course} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>Leadership Masterclass</CardTitle>
                      <GraduationCap className="h-5 w-5 text-hrms-teal" />
                    </div>
                    <CardDescription>Advanced leadership skills for managers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">Duration</span>
                          <span>8 weeks</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">Enrolled</span>
                          <span>24 employees</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">Start Date</span>
                          <span>Jun 15, 2025</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button className="w-full">Enroll</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Learning Progress</h2>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Filter by Date
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Learning progress data will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Skills Matrix</h2>
              <Button variant="outline" size="sm">Add Skill</Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Company Skills Map</CardTitle>
                <CardDescription>
                  Overview of skill distribution across departments
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <div className="flex items-center justify-center h-full">
                  <Users className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-4 text-muted-foreground">Skills matrix will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Employee Certifications</h2>
              <Button variant="outline" size="sm">Add Certification</Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Certification Dashboard</CardTitle>
                <CardDescription>
                  Track and manage employee certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <div className="flex items-center justify-center h-full">
                  <Trophy className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-4 text-muted-foreground">Certifications data will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TrainingPage;
