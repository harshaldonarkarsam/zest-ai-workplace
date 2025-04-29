
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUser, FileText, Shield, BellRing, Key } from "lucide-react";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg" alt="User Avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">John Doe</h1>
            <p className="text-muted-foreground">HR Administrator</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button className="gap-2">
                <CircleUser className="h-4 w-4" />
                View as Employee
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="personal" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Full Name</h3>
                    <p>John Alexander Doe</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Email</h3>
                    <p>john.doe@zesthr.com</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Phone</h3>
                    <p>+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Birth Date</h3>
                    <p>April 12, 1985</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Address</h3>
                    <p>123 Main Street, Apt 4B<br />San Francisco, CA 94103</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Department</h3>
                    <p>Human Resources</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
                <CardDescription>
                  Your work details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Employee ID</h3>
                    <p>HR-2023-0042</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Position</h3>
                    <p>HR Administrator</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Start Date</h3>
                    <p>June 15, 2023</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Manager</h3>
                    <p>Sarah Johnson</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Office Location</h3>
                    <p>San Francisco HQ</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Work Schedule</h3>
                    <p>Monday - Friday, 9:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Key className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button className="gap-2">
                    <Shield className="h-4 w-4" />
                    Enable 2FA
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Login Sessions</h3>
                    <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <CircleUser className="h-4 w-4" />
                    View Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <BellRing className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">System Announcements</h3>
                      <p className="text-sm text-muted-foreground">Important updates about the system</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Documents</h2>
              <Button variant="outline" size="sm">Upload Document</Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {["Employment Contract", "Confidentiality Agreement", "Performance Review 2024", "Tax Form W-2"].map((doc) => (
                    <div key={doc} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                        <span>{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
