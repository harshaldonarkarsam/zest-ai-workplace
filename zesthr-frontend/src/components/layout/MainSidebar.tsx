
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  CircleUser,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Settings,
  UserPlus,
  UsersRound,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MainSidebarProps {
  open: boolean;
}

export function MainSidebar({ open }: MainSidebarProps) {
  const navigate = useNavigate();
  
  const mainNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Employees", icon: UsersRound, path: "/employees" },
    { name: "Recruitment", icon: UserPlus, path: "/recruitment" },
    { name: "Performance", icon: LineChart, path: "/performance" },
    { name: "Training", icon: GraduationCap, path: "/training" },
    { name: "Time & Attendance", icon: CalendarDays, path: "/attendance" },
    { name: "Payroll", icon: Wallet, path: "/payroll" },
    { name: "Company", icon: Building2, path: "/company" },
  ];
  
  const secondaryNavItems = [
    { name: "Profile", icon: CircleUser, path: "/profile" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-sidebar transition-all duration-300 ease-in-out lg:relative",
        open ? "w-64" : "w-[60px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className={cn("flex items-center", !open && "justify-center w-full")}>
          {open ? (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-hrms-teal flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-white">ZestHR</span>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-md bg-hrms-teal flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-hide">
        <nav className="flex-1 px-2 py-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  !open && "justify-center px-2"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className={cn("h-5 w-5", open && "mr-2")} />
                {open && <span>{item.name}</span>}
              </Button>
            ))}
          </div>

          <Separator className="my-4 bg-sidebar-border" />

          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  !open && "justify-center px-2"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className={cn("h-5 w-5", open && "mr-2")} />
                {open && <span>{item.name}</span>}
              </Button>
            ))}
          </div>
        </nav>
      </div>

      {/* Collapsible button at the bottom */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full flex justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          onClick={(e) => {
            e.stopPropagation();
            // This button is just visual - the actual toggle happens in the parent component
          }}
        >
          <ChevronLeft className={cn("h-5 w-5", !open && "rotate-180")} />
        </Button>
      </div>
    </aside>
  );
}
