
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Sample team members data
const members = [
  {
    id: 1,
    name: "Emily Johnson",
    role: "HR Manager",
    avatar: "/placeholder.svg",
    online: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Recruitment Specialist",
    avatar: "/placeholder.svg",
    online: true,
  },
  {
    id: 3,
    name: "Sophia Rodriguez",
    role: "Payroll Coordinator",
    avatar: "/placeholder.svg",
    online: false,
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Training Coordinator",
    avatar: "/placeholder.svg",
    online: false,
  },
  {
    id: 5,
    name: "Olivia Davis",
    role: "HR Analyst",
    avatar: "/placeholder.svg",
    online: true,
  },
];

export function TeamMembers() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Your HR team members and their status</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {member.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-hrms-success"></span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Message
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
