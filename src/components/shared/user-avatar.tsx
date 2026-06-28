"use client";

import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
} as const;

const iconClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

export type UserAvatarSize = keyof typeof sizeClasses;

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: UserAvatarSize;
  className?: string;
}

export function UserAvatar({ src, name, size = "md", className }: UserAvatarProps) {
  const hasImage = Boolean(src?.trim());

  return (
    <Avatar className={cn(sizeClasses[size], "ring-1 ring-border/60", className)}>
      {hasImage && (
        <AvatarImage src={src!} alt={name ?? ""} className="object-cover" />
      )}
      <AvatarFallback
        delayMs={hasImage ? 600 : 0}
        className="border-0 bg-muted text-muted-foreground"
      >
        <User className={iconClasses[size]} strokeWidth={1.75} aria-hidden />
        <span className="sr-only">{name}</span>
      </AvatarFallback>
    </Avatar>
  );
}
