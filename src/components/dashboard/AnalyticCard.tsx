
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
    text: string;
  };
  className?: string;
}

export function AnalyticCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: AnalyticCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-3">
            <span
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-hrms-success" : "text-hrms-danger"
              )}
            >
              {trend.value}
            </span>
            <p className="text-xs text-muted-foreground">{trend.text}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
