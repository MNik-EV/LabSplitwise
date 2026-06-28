"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Store, Pencil, Trash2, Check, X } from "lucide-react";
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
import { createRestaurant, updateRestaurant, deleteRestaurant } from "@/actions";
import { toastActionError } from "@/lib/action-error-toast";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

interface RestaurantsManagerProps {
  restaurants: { id: string; name: string }[];
}

export function RestaurantsManager({ restaurants }: RestaurantsManagerProps) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error(t("settings.restaurantRequired"));
      return;
    }
    startTransition(async () => {
      try {
        await createRestaurant({ name: name.trim() });
        toast.success(t("settings.restaurantSuccess"));
        setName("");
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "settings.restaurantError");
      }
    });
  };

  const startEdit = (restaurant: { id: string; name: string }) => {
    setEditingId(restaurant.id);
    setEditName(restaurant.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) {
      toast.error(t("settings.restaurantRequired"));
      return;
    }
    startTransition(async () => {
      try {
        await updateRestaurant({ id, name: editName.trim() });
        toast.success(t("settings.restaurantUpdateSuccess"));
        cancelEdit();
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "settings.restaurantError");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteRestaurant(id);
        toast.success(t("settings.restaurantDeleteSuccess"));
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "settings.restaurantError");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("settings.restaurants")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t("settings.newRestaurant")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={isPending}>
            <Plus className="h-4 w-4" />
            {t("settings.addRestaurant")}
          </Button>
        </div>

        {restaurants.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("settings.restaurantRequired")}</p>
        ) : (
          <div className="divide-y rounded-xl border">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {editingId === r.id ? (
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-1.5">
                      <Label>{t("settings.newRestaurant")}</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" onClick={() => handleUpdate(r.id)} disabled={isPending}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 font-medium">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {r.name}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="icon" variant="outline" onClick={() => startEdit(r)}>
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
                            <AlertDialogTitle>{t("settings.restaurantDeleteTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("settings.restaurantDeleteDesc", { name: r.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(r.id)}
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
      </CardContent>
    </Card>
  );
}
