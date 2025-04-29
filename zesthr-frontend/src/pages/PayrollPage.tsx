
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, FileText, DollarSign, Users, Printer } from "lucide-react";

const PayrollPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="flex gap-2">
              <Printer className="h-4 w-4" />
              Print Payslips
            </Button>
            <Button className="flex gap-2">
              <FileText className="h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payslips">Payslips</TabsTrigger>
            <TabsTrigger value="taxes">Taxes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$487,593</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$86,245</div>
                  <p className="text-xs text-muted-foreground">+3.2% from last year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Bonuses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$142,800</div>
                  <p className="text-xs text-muted-foreground">This quarter</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tax Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$104,282</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex items-center justify-center h-full">
                  <DollarSign className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-4 text-muted-foreground">Payroll trend chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payslips" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Employee Payslips</h2>
              <Button variant="outline" size="sm">
                Generate Payslips
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Employee payslips will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tax Management</h2>
              <Button variant="outline" size="sm">Tax Settings</Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Tax Summary</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex items-center justify-center h-full">
                  <Wallet className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-4 text-muted-foreground">Tax summary data will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Payroll Settings</h2>
              <Button variant="outline" size="sm">Save Changes</Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Payroll Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Payroll settings will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default PayrollPage;
