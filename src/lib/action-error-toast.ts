import { toast } from "sonner";
import { isActionError } from "@/lib/errors";

export function toastActionError(
  error: unknown,
  t: (key: string) => string,
  fallbackKey = "common.error",
) {
  if (isActionError(error)) {
    toast.error(t(error.code));
    return;
  }
  toast.error(t(fallbackKey));
}
