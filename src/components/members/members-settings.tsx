"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toastActionError } from "@/lib/action-error-toast";
import { Plus, Pencil, Trash2, UserPlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CopyCardNumber } from "@/components/shared/copy-card-number";
import { FormError } from "@/components/shared/form-error";
import { createUser, updateUser, deleteUser } from "@/actions";
import { formatCardNumber, isValidCardNumber, normalizeCardNumber } from "@/lib/card-number";
import { fieldLimits } from "@/lib/field-limits";
import { isNameTooLong, isNameTooShort } from "@/lib/field-validation";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

interface MemberRow {
  id: string;
  name: string;
  cardNumber: string | null;
}

interface MembersSettingsProps {
  members: MemberRow[];
}

export function MembersSettings({ members }: MembersSettingsProps) {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCardNumber, setEditCardNumber] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const validateCard = (value: string) => {
    if (!value.trim()) return true;
    if (!isValidCardNumber(value)) {
      toast.error(t("members.cardInvalid"));
      return false;
    }
    return true;
  };

  const validateName = (value: string, setError: (msg: string | null) => void): boolean => {
    if (isNameTooShort(value)) {
      const msg = t("validation.nameMin");
      setError(msg);
      toast.error(msg);
      return false;
    }
    if (isNameTooLong(value)) {
      const msg = t("validation.nameMax");
      setError(msg);
      toast.error(msg);
      return false;
    }
    setError(null);
    return true;
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error(t("members.nameRequired"));
      return;
    }
    if (!validateName(name, setNameError)) return;
    if (!validateCard(cardNumber)) return;

    startTransition(async () => {
      try {
        await createUser({
          name: name.trim(),
          cardNumber: cardNumber.trim() || undefined,
        });
        toast.success(t("members.addSuccess"));
        setName("");
        setCardNumber("");
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "members.addError");
      }
    });
  };

  const startEdit = (member: MemberRow) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditCardNumber(member.cardNumber ? formatCardNumber(member.cardNumber) : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCardNumber("");
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) {
      toast.error(t("members.nameRequired"));
      return;
    }
    if (!validateName(editName, setEditNameError)) return;
    if (!validateCard(editCardNumber)) return;

    startTransition(async () => {
      try {
        await updateUser({
          id,
          name: editName.trim(),
          cardNumber: editCardNumber.trim() || undefined,
        });
        toast.success(t("members.updateSuccess"));
        cancelEdit();
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "members.updateError");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteUser(id);
        toast.success(t("members.deleteSuccess"));
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "members.deleteError");
      }
    });
  };

  const onCardInput = (value: string, setter: (v: string) => void) => {
    const digits = normalizeCardNumber(value).slice(0, 16);
    setter(digits ? formatCardNumber(digits) : "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4" />
          {t("members.manage")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-medium">{t("members.addTitle")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-member-name">{t("members.namePlaceholder")}</Label>
              <Input
                id="new-member-name"
                placeholder={t("members.namePlaceholder")}
                maxLength={fieldLimits.memberName + 1}
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  setName(v);
                  if (isNameTooLong(v)) setNameError(t("validation.nameMax"));
                  else setNameError(null);
                }}
              />
              <FormError message={nameError ?? undefined} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-member-card">{t("members.cardNumber")}</Label>
              <Input
                id="new-member-card"
                dir="ltr"
                inputMode="numeric"
                placeholder="6219 8619 2782 4416"
                value={cardNumber}
                onChange={(e) => onCardInput(e.target.value, setCardNumber)}
              />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={isPending} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {isPending ? t("common.loading") : t("members.addMember")}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("members.list")}</p>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("members.empty")}</p>
          ) : (
            <div className="divide-y rounded-xl border">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {editingId === member.id ? (
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1 space-y-1.5">
                        <Label>{t("members.namePlaceholder")}</Label>
                        <Input
                          maxLength={fieldLimits.memberName + 1}
                          value={editName}
                          onChange={(e) => {
                            const v = e.target.value;
                            setEditName(v);
                            if (isNameTooLong(v)) setEditNameError(t("validation.nameMax"));
                            else setEditNameError(null);
                          }}
                        />
                        <FormError message={editNameError ?? undefined} />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <Label>{t("members.cardNumber")}</Label>
                        <Input
                          dir="ltr"
                          inputMode="numeric"
                          value={editCardNumber}
                          onChange={(e) => onCardInput(e.target.value, setEditCardNumber)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          onClick={() => handleUpdate(member.id)}
                          disabled={isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{member.name}</p>
                        {member.cardNumber ? (
                          <div className="mt-2">
                            <CopyCardNumber value={member.cardNumber} compact />
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("members.noCard")}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button size="icon" variant="outline" onClick={() => startEdit(member)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="outline">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("members.deleteTitle")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("members.deleteDesc", { name: member.name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(member.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t("common.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
