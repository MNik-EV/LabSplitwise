"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createUser } from "@/actions";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

export function MembersManager() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error(t("members.nameRequired"));
      return;
    }
    startTransition(async () => {
      try {
        await createUser({ name: name.trim() });
        toast.success(t("members.addSuccess"));
        setName("");
        setOpen(false);
        router.refresh();
      } catch {
        toast.error(t("members.addError"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4" />
          {t("members.addMember")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("members.addTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder={t("members.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={isPending} className="w-full">
            <Plus className="h-4 w-4" />
            {isPending ? t("common.loading") : t("common.add")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
