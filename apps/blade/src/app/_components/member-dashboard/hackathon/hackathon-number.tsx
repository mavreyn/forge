import { Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  //CardDescription,
  CardHeader,
  CardTitle,
} from "@forge/ui/card";

export function HackathonNumber({ size }: { size: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Hackathons Attended
        </CardTitle>
        <Trophy color="hsl(263.4 70% 50.4%)" size={15} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{size}</div>
        <p className="text-xs text-muted-foreground">All academic year</p>
      </CardContent>
    </Card>
  );
}
