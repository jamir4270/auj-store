"use client";

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { useState } from "react";

export function OrderInterface() {
  const [isOrdering, setIsOrdering] = useState(false);
  return (
    <div className="flex flex-row h-full gap-3 px-3">
      <div className="flex flex-col flex-2 w-full">
        <Card>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
      <div className="flex flex-col flex-1 w-full">
        <Card>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}
