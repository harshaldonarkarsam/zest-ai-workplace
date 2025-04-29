
import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Insight {
  id: number;
  title: string;
  description: string;
  type: "sentiment" | "match" | "prediction";
}

const insights: Insight[] = [
  {
    id: 1,
    title: "High Match Candidate",
    description:
      "John Smith matches 92% of the requirements for Software Engineer position. Strong in algorithms and system design.",
    type: "match",
  },
  {
    id: 2,
    title: "Interview Sentiment",
    description:
      "Positive sentiment detected in recent interviews for Marketing Manager role. Candidates showed enthusiasm about company culture.",
    type: "sentiment",
  },
  {
    id: 3,
    title: "Time to Fill Prediction",
    description:
      "Based on historical data and current market trends, the Data Scientist position will likely take 25-32 days to fill.",
    type: "prediction",
  },
];

export function AiInsightsCard() {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "match":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "sentiment":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "prediction":
        return "bg-green-50 text-green-800 border-green-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <CardTitle>AI-Powered Insights</CardTitle>
        </div>
        <CardDescription>
          Machine learning recommendations for your recruitment process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-lg border p-3 shadow-sm ${getTypeStyles(
              insight.type
            )}`}
          >
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-semibold">{insight.title}</h4>
              <span className="text-xs capitalize rounded-full px-2 py-0.5 bg-white/60 border-[1px] border-current">
                {insight.type}
              </span>
            </div>
            <p className="mt-2 text-sm">{insight.description}</p>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate More Insights
        </Button>
      </CardContent>
    </Card>
  );
}
