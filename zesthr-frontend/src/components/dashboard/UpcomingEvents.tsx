
import { CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const upcomingEvents = [
  {
    id: 1,
    title: "New Employee Orientation",
    date: "2025-05-05T09:00",
    type: "orientation",
    location: "Training Room 3",
  },
  {
    id: 2,
    title: "Performance Review Deadline",
    date: "2025-05-10T17:00",
    type: "deadline",
    location: "Companywide",
  },
  {
    id: 3,
    title: "Team Building Workshop",
    date: "2025-05-15T13:00",
    type: "workshop",
    location: "Conference Hall",
  },
  {
    id: 4,
    title: "Leadership Training",
    date: "2025-05-18T10:00",
    type: "training",
    location: "Training Room 1",
  },
];

export function UpcomingEvents() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "orientation":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "deadline":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "workshop":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "training":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>
          Important HR events for the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">
                    {event.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={getBadgeVariant(event.type)}
                  >
                    {event.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(event.date)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
