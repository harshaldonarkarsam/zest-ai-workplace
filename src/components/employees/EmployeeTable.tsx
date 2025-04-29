
import {
  MoreHorizontal,
  FileEdit,
  Trash,
  User,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Sample employee data
interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  status: "active" | "onleave" | "offboarding";
  avatar?: string;
}

const employees: Employee[] = [
  {
    id: 1,
    name: "Alex Morgan",
    email: "alex.morgan@zesthr.com",
    department: "Engineering",
    position: "Software Engineer",
    hireDate: "2022-02-15",
    status: "active",
  },
  {
    id: 2,
    name: "Taylor Swift",
    email: "taylor.swift@zesthr.com",
    department: "Marketing",
    position: "Marketing Manager",
    hireDate: "2021-06-10",
    status: "active",
  },
  {
    id: 3,
    name: "Jordan Peterson",
    email: "jordan.peterson@zesthr.com",
    department: "Sales",
    position: "Account Executive",
    hireDate: "2023-01-05",
    status: "onleave",
  },
  {
    id: 4,
    name: "Jamie Lee",
    email: "jamie.lee@zesthr.com",
    department: "Design",
    position: "UI/UX Designer",
    hireDate: "2022-11-18",
    status: "active",
  },
  {
    id: 5,
    name: "Casey Brown",
    email: "casey.brown@zesthr.com",
    department: "Product",
    position: "Product Manager",
    hireDate: "2021-08-22",
    status: "offboarding",
  },
];

interface EmployeeTableProps {
  data?: Employee[];
  isLoading?: boolean;
}

export function EmployeeTable({ data = employees, isLoading = false }: EmployeeTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "onleave":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "offboarding":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Employee Directory</CardTitle>
        <CardDescription>Manage your team members</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-hrms-teal border-r-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading employees...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <p className="text-muted-foreground">No employees found</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={employee.avatar || "/placeholder.svg"}
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{formatDate(employee.hireDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(getStatusColor(employee.status))}
                    >
                      {employee.status.charAt(0).toUpperCase() +
                        employee.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileEdit className="mr-2 h-4 w-4" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Performance</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Schedule</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Remove</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
