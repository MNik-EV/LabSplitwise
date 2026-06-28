"use client";

import { useRef, useTransition } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserAvatar, type UserAvatarSize } from "@/components/shared/user-avatar";
import { updateUserAvatar } from "@/actions";
import { AvatarImageError, processAvatarFile } from "@/lib/avatar-image";
import { toastActionError } from "@/lib/action-error-toast";
import { useI18n } from "@/components/layout/i18n-provider";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  userId: string;
  name: string;
  avatar?: string | null;
  size?: UserAvatarSize;
  className?: string;
}

export function AvatarUpload({
  userId,
  name,
  avatar,
  size = "lg",
  className,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    startTransition(async () => {
      try {
        const dataUrl = await processAvatarFile(file);
        await updateUserAvatar(userId, dataUrl);
        toast.success(t("members.avatarSuccess"));
        router.refresh();
      } catch (error) {
        if (error instanceof AvatarImageError) {
          if (error.code === "type") toast.error(t("members.avatarTypeError"));
          else if (error.code === "size") toast.error(t("members.avatarSizeError"));
          else toast.error(t("members.avatarError"));
          return;
        }
        toastActionError(error, t, "members.avatarError");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await updateUserAvatar(userId, null);
        toast.success(t("members.avatarRemoved"));
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "members.avatarError");
      }
    });
  };

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <UserAvatar src={avatar} name={name} size={size} />

      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-0.5 -end-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
        aria-label={t("members.avatarUpload")}
      >
        <Camera className="h-3.5 w-3.5" />
      </button>

      {avatar && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleRemove}
          className="absolute -top-0.5 -end-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          aria-label={t("members.avatarRemove")}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
