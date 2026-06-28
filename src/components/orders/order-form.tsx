"use client";

import { useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Store,
  CreditCard,
  Plus,
  Trash2,
  Check,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocaleDatePicker } from "@/components/shared/locale-date-picker";
import { FormError } from "@/components/shared/form-error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { buildValidationSchemas, type CreateOrderInput } from "@/lib/validations";
import { toDateInputValue } from "@/lib/date-input";
import { toastActionError } from "@/lib/action-error-toast";
import { calculateOrder } from "@/lib/calculations";
import { fieldLimits } from "@/lib/field-limits";
import { createOrder, updateOrder } from "@/actions";
import { useI18n } from "@/components/layout/i18n-provider";
import { cn } from "@/lib/utils";

interface OrderFormProps {
  users: { id: string; name: string }[];
  restaurants: { id: string; name: string }[];
  labPerPerson: number;
  defaultValues?: Partial<CreateOrderInput & { id?: string }>;
  mode?: "create" | "edit";
}

export function OrderForm({
  users,
  restaurants,
  labPerPerson,
  defaultValues,
  mode = "create",
}: OrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t, formatMoney, dict } = useI18n();

  const orderSchema = useMemo(
    () => buildValidationSchemas(dict.validation).createOrderSchema,
    [dict],
  );

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      date: toDateInputValue(new Date()),
      restaurantId: "",
      payerId: "",
      members: [],
      sharedExpenses: [],
      labPerPerson,
      notes: "",
      ...defaultValues,
    },
    mode: "onSubmit",
  });

  const { fields: memberFields, append: appendMember, remove: removeMember } =
    useFieldArray({ control: form.control, name: "members" });

  const {
    fields: expenseFields,
    append: appendExpense,
    remove: removeExpense,
  } = useFieldArray({ control: form.control, name: "sharedExpenses" });

  const watchedValues = form.watch();
  const { errors } = form.formState;

  const calculation = useMemo(() => {
    if (watchedValues.members.length === 0) return null;
    try {
      return calculateOrder({
        members: watchedValues.members.filter((m) => m.userId),
        sharedExpenses: (watchedValues.sharedExpenses ?? []).filter(
          (e) => e.name?.trim() && e.amount > 0,
        ),
        labPerPerson: watchedValues.labPerPerson ?? labPerPerson,
      });
    } catch {
      return null;
    }
  }, [watchedValues, labPerPerson]);

  const toggleMember = (userId: string) => {
    const index = memberFields.findIndex((m) => m.userId === userId);
    if (index >= 0) removeMember(index);
    else appendMember({ userId, foodPrice: 0 });
  };

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name ?? "";

  const onSubmit = (data: CreateOrderInput) => {
    const payload = {
      ...data,
      sharedExpenses: (data.sharedExpenses ?? []).filter(
        (e) => e.name?.trim() && e.amount > 0,
      ),
    };

    startTransition(async () => {
      try {
        if (mode === "edit" && defaultValues?.id) {
          await updateOrder({ ...payload, id: defaultValues.id });
          toast.success(t("orders.updateSuccess"));
        } else {
          await createOrder(payload);
          toast.success(t("orders.createSuccess"));
        }
        router.push("/orders");
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "orders.createError");
      }
    });
  };

  const payerOutOfPocket =
    calculation && watchedValues.payerId
      ? calculation.totalAmount -
        calculation.labTotalAmount
      : null;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, () => toast.error(t("orders.fixErrors")))}
      className="mx-auto max-w-6xl"
    >
      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("orders.stepBasic")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs">
                {t("orders.date")}
              </Label>
              <LocaleDatePicker
                id="date"
                value={form.watch("date")}
                onChange={(v) =>
                  form.setValue("date", v, { shouldValidate: true, shouldDirty: true })
                }
              />
              <FormError message={errors.date?.message} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("orders.restaurant")}</Label>
                <Controller
                  control={form.control}
                  name="restaurantId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.clearErrors("restaurantId");
                      }}
                    >
                      <SelectTrigger
                        className={cn("h-9", errors.restaurantId && "border-destructive")}
                      >
                        <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <SelectValue placeholder={t("orders.selectRestaurant")} />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={errors.restaurantId?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{t("common.payer")}</Label>
                <Controller
                  control={form.control}
                  name="payerId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.clearErrors("payerId");
                      }}
                    >
                      <SelectTrigger
                        className={cn("h-9", errors.payerId && "border-destructive")}
                      >
                        <CreditCard className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <SelectValue placeholder={t("orders.selectPayer")} />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={errors.payerId?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="labPerPerson" className="text-xs">
                {t("orders.labField")}
              </Label>
              <Input
                id="labPerPerson"
                type="number"
                className={cn("h-9", errors.labPerPerson && "border-destructive")}
                {...form.register("labPerPerson")}
              />
              <FormError message={errors.labPerPerson?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-notes" className="text-xs">
                {t("orders.notes")}
              </Label>
              <Textarea
                id="order-notes"
                placeholder={t("orders.notesPlaceholder")}
                rows={2}
                maxLength={fieldLimits.orderNotes}
                className="resize-none text-sm"
                {...form.register("notes")}
              />
              <FormError message={errors.notes?.message} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("orders.members")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <FormError message={errors.members?.message ?? errors.members?.root?.message} />
            <div className="grid gap-2 sm:grid-cols-2">
              {users.map((user) => {
                const memberIndex = memberFields.findIndex((m) => m.userId === user.id);
                const isSelected = memberIndex >= 0;
                const memberError = errors.members?.[memberIndex]?.foodPrice;

                return (
                  <div
                    key={user.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => !isSelected && toggleMember(user.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!isSelected) toggleMember(user.id);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/30",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        isSelected && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {user.name}
                    </span>
                    {isSelected && (
                      <Input
                        type="number"
                        placeholder={t("orders.foodPrice")}
                        className={cn(
                          "h-8 w-24 shrink-0 text-sm",
                          memberError && "border-destructive",
                        )}
                        {...form.register(`members.${memberIndex}.foodPrice`, {
                          valueAsNumber: true,
                        })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("orders.sharedExpenses")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {expenseFields.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("orders.sharedExpensesDesc")}</p>
            ) : (
              expenseFields.map((field, index) => {
                const nameError = errors.sharedExpenses?.[index]?.name;
                const amountError = errors.sharedExpenses?.[index]?.amount;
                return (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <Input
                        placeholder={t("orders.expenseName")}
                        maxLength={fieldLimits.expenseName}
                        className={cn("h-9 text-sm", nameError && "border-destructive")}
                        {...form.register(`sharedExpenses.${index}.name`)}
                      />
                      <FormError message={nameError?.message} />
                    </div>
                    <div className="w-24 space-y-0.5">
                      <Input
                        type="number"
                        placeholder={t("orders.amount")}
                        className={cn("h-9 text-sm", amountError && "border-destructive")}
                        {...form.register(`sharedExpenses.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                      />
                      <FormError message={amountError?.message} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => removeExpense(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => appendExpense({ name: "", amount: 0 })}
            >
              <Plus className="h-3.5 w-3.5" />
              {t("orders.addShared")}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 lg:sticky lg:top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("orders.summary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {!calculation ? (
              <p className="text-sm text-muted-foreground">{t("orders.summaryEmpty")}</p>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("common.total")}</span>
                  <span className="font-bold text-primary">
                    {formatMoney(calculation.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {t("orders.labShare")}
                  </span>
                  <span>{formatMoney(calculation.labTotalAmount)}</span>
                </div>
                {payerOutOfPocket !== null && watchedValues.payerId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("orders.payerOutOfPocket")}</span>
                    <span className="font-medium">{formatMoney(payerOutOfPocket)}</span>
                  </div>
                )}
                <Separator />
                <div className="max-h-32 space-y-1 overflow-y-auto text-xs">
                  {calculation.members.map((m) => {
                    const isPayer = m.userId === watchedValues.payerId;
                    return (
                      <div key={m.userId} className="flex justify-between gap-2">
                        <span className="truncate">{getUserName(m.userId)}</span>
                        <span className="shrink-0 font-medium">
                          {formatMoney(m.shareAmount)}
                          {isPayer
                            ? ` · ${t("orders.ownShareShort")}`
                            : m.pocketAmount > 0
                              ? ` → ${formatMoney(m.pocketAmount)}`
                              : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending || !calculation || memberFields.length === 0}
              >
                {isPending
                  ? t("orders.submitting")
                  : mode === "edit"
                    ? t("orders.saveChanges")
                    : t("orders.submit")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
