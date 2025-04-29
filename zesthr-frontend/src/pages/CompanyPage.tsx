
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, FileText, Settings, Network } from "lucide-react";

const CompanyPage = () => {
  const [activeTab, setActiveTab] = useState("structure");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Company</h1>
          <Button className="flex gap-2">
            <FileText className="h-4 w-4" />
            Export Company Data
          </Button>
        </div>

        <Tabs defaultValue="structure" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organizational Chart</CardTitle>
                <CardDescription>
                  Visualize the company's organizational structure
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <div className="flex items-center justify-center h-full">
                  <Network className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-4 text-muted-foreground">Organizational chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Departments</h2>
              <Button variant="outline" size="sm">Add Department</Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {["Engineering", "Marketing", "HR", "Finance", "Product", "Sales"].map((dept) => (
                <Card key={dept} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>{dept}</CardTitle>
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">Employees</span>
                          <span>48</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">Manager</span>
                          <span>Alex Morgan</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">Open Positions</span>
                          <span>3</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button variant="outline" className="w-full">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Company Policies</h2>
              <Button variant="outline" size="sm">Add Policy</Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {["Employee Handbook", "Code of Conduct", "Remote Work Policy", "Travel Policy", "IT Security Policy"].map((policy) => (
                    <div key={policy} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                        <span>{policy}</span>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Company Documents</h2>
              <Button variant="outline" size="sm">Upload Document</Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>
                  Access and manage company-wide documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Document library will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CompanyPage;
