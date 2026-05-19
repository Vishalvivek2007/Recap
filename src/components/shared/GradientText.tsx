import React from "react";
import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return React.createElement(Tag, { className: cn("text-gradient", className) }, children);
}
