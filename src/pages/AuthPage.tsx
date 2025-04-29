
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sparkles } from "lucide-react";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-12 w-12 rounded-lg bg-hrms-teal flex items-center justify-center">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <h1 className="text-3xl font-bold">ZestHR</h1>
          <p className="text-muted-foreground">
            AI-powered Human Resource Management System
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="sso">SSO</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <LoginForm />
              </TabsContent>
              <TabsContent value="sso">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground text-center">
                    Choose a provider to continue
                  </div>
                  <div className="grid gap-2">
                    <button className="flex items-center justify-center gap-2 w-full border rounded-md h-10 hover:bg-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
                      </svg>
                      <span>GitHub</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 w-full border rounded-md h-10 hover:bg-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      <span>Microsoft</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 w-full border rounded-md h-10 hover:bg-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                        <line x1="21.17" x2="12" y1="8" y2="8" />
                        <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
                        <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
                      </svg>
                      <span>Google</span>
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-0">
            <div className="text-xs text-muted-foreground text-center w-full">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-hrms-teal underline-offset-4 hover:underline"
              >
                Sign up
              </a>
            </div>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-hrms-teal" />
          <span>Powered by AI for enhanced HR management</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
