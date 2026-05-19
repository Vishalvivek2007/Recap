import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  return (
    <Tag className={cn("text-gradient", className)}>
      {children}
    </Tag>
  );
}