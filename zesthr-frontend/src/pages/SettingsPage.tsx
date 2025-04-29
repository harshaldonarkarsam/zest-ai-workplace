
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, BellRing, Palette, Shield, Users } from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <Button className="flex gap-2">
            <Settings className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">System Language</h3>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Time Zone</h3>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option>Pacific Time (UTC-8)</option>
                    <option>Mountain Time (UTC-7)</option>
                    <option>Central Time (UTC-6)</option>
                    <option>Eastern Time (UTC-5)</option>
                    <option>GMT (UTC+0)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Date Format</h3>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>Update your organization information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Company Name</h3>
                    <input
                      type="text"
                      defaultValue="Zest Technologies, Inc."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Company Address</h3>
                    <textarea
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      defaultValue="123 Tech Boulevard, Suite 400, San Francisco, CA 94103"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Theme</h3>
                  <div className="flex space-x-4">
                    <div className="border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                      <Palette className="h-5 w-5 mb-2" />
                      <span>Light</span>
                    </div>
                    <div className="border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                      <Palette className="h-5 w-5 mb-2" />
                      <span>Dark</span>
                    </div>
                    <div className="border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                      <Palette className="h-5 w-5 mb-2" />
                      <span>System</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Density</h3>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option>Comfortable</option>
                    <option>Compact</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Accent Color</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {["Teal", "Blue", "Purple", "Orange", "Green"].map((color) => (
                      <div key={color} className="border rounded-md p-2 text-center cursor-pointer hover:bg-muted/50">
                        <div className="w-8 h-8 rounded-full mx-auto mb-2 bg-hrms-teal" />
                        <span className="text-xs">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {["Email Notifications", "Push Notifications", "SMS Notifications"].map((type) => (
                    <div key={type} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">{type}</h3>
                        <p className="text-sm text-muted-foreground">Manage your {type.toLowerCase()}</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <BellRing className="h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure system security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" checked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Password Policy</h3>
                      <p className="text-sm text-muted-foreground">Set password requirements</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Session Timeout</h3>
                      <p className="text-sm text-muted-foreground">Time before automatic logout</p>
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users & Roles</CardTitle>
                <CardDescription>
                  Manage system users and their access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="font-medium">User Management</h3>
                    <p className="text-sm text-muted-foreground">Add, remove, or edit system users</p>
                  </div>
                  <Button className="gap-2">
                    <Users className="h-4 w-4" />
                    Manage Users
                  </Button>
                </div>
                
                <div className="flex justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="font-medium">Role Management</h3>
                    <p className="text-sm text-muted-foreground">Configure roles and permissions</p>
                  </div>
                  <Button className="gap-2">
                    <Shield className="h-4 w-4" />
                    Manage Roles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
