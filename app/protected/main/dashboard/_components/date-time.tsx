"use client";

import { useEffect, useState } from "react";

export function DateTimeCard() {
  const [mounted, setMounted] = useState(false);
  const date = new Date();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-row justify-between">
        {/* You can put a skeleton loader here or just invisible text to hold space */}
        <div className="invisible">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-between">
      <div>{date.toLocaleDateString("default", { dateStyle: "long" })}</div>
      <div>{time.toLocaleTimeString()}</div>
    </div>
  );
}
