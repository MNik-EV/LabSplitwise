"use client";

import { useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  Store,
  CreditCard,
  Users,
  Receipt,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCenteredField } from "@/components/shared/icon-centered-field";
import { LocaleDatePicker } from "@/components/shared/locale-date-picker";
import { FormError } from "@/components/shared/form-error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { useOrderFormStore } from "@/stores/app-store";
import { useI18n } from "@/components/layout/i18n-provider";
import { cn } from "@/lib/utils";

interface OrderFormProps {
  users: { id: string; name: string }[];
  restaurants: { id: string; name: string }[];
  labPerPerson: number;
  defaultValues?: Partial<CreateOrderInput & { id?: string }>;
  mode?: "create" | "edit";
}

const stepKeys = [
  { id: 1, key: "orders.stepBasic", icon: Calendar },
  { id: 2, key: "orders.stepMembers", icon: Users },
  { id: 3, key: "orders.stepShared", icon: Receipt },
  { id: 4, key: "orders.stepReview", icon: Check },
] as const;

export function OrderForm({
  users,
  restaurants,
  labPerPerson,
  defaultValues,
  mode = "create",
}: OrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { step, setStep, reset: resetStep } = useOrderFormStore();
  const { t, formatMoney, dir, dict } = useI18n();
  const isRtl = dir === "rtl";
  const PrevChevron = isRtl ? ChevronRight : ChevronLeft;
  const NextChevron = isRtl ? ChevronLeft : ChevronRight;

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

  useEffect(() => {
    if (mode === "create") resetStep();
  }, [mode, resetStep]);

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

  const nextStep = async () => {
    if (step === 1) {
      const valid = await form.trigger(["date", "restaurantId", "payerId", "labPerPerson", "notes"]);
      if (!valid) {
        toast.error(t("orders.fixErrors"));
        return;
      }
    } else if (step === 2) {
      if (memberFields.length === 0) {
        toast.error(t("orders.minMember"));
        return;
      }
      const members = form.getValues("members");
      if (members.some((m) => !m.foodPrice || m.foodPrice <= 0)) {
        toast.error(t("orders.foodPriceRequired"));
        await form.trigger("members");
        return;
      }
      const valid = await form.trigger("members");
      if (!valid) {
        toast.error(t("orders.fixErrors"));
        return;
      }
    } else if (step === 3) {
      const expenses = form.getValues("sharedExpenses") ?? [];
      const hasRows = expenses.length > 0;
      const hasIncomplete = expenses.some(
        (e) => !e.name?.trim() || e.amount === undefined || e.amount <= 0,
      );
      if (hasRows && hasIncomplete) {
        const valid = await form.trigger("sharedExpenses");
        if (!valid) toast.error(t("orders.expenseIncomplete"));
        return;
      }
    }
    setStep(step + 1);
  };

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name ?? "";
  const getRestaurantName = (id: string) =>
    restaurants.find((r) => r.id === id)?.name ?? "";

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
        resetStep();
        router.push("/orders");
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "orders.createError");
      }
    });
  };

  const payerOutOfPocket =
    calculation && watchedValues.payerId
      ? calculation.totalAmount - calculation.labTotalAmount
      : null;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, () => toast.error(t("orders.fixErrors")))}
      className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col"
    >
      <div className="mb-4 flex shrink-0 items-center justify-between">
        {stepKeys.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors sm:h-10 sm:w-10",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              {i < stepKeys.length - 1 && (
                <div
                  className={cn(
                    "mx-1.5 hidden h-0.5 w-6 sm:block md:w-12",
                    isDone ? "bg-success" : "bg-muted",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              <Card>
                <CardContent className="space-y-3 p-4 sm:p-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="date">{t("orders.date")}</Label>
                    <LocaleDatePicker
                      id="date"
                      value={form.watch("date")}
                      invalid={!!errors.date}
                      onChange={(v) =>
                        form.setValue("date", v, { shouldValidate: true, shouldDirty: true })
                      }
                    />
                    <FormError message={errors.date?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("orders.restaurant")}</Label>
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
                            centered
                            className={errors.restaurantId ? "border-destructive" : ""}
                          >
                            <Store className="h-4 w-4 text-muted-foreground" />
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
                    <Label>{t("common.payer")}</Label>
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
                          <SelectTrigger centered className={errors.payerId ? "border-destructive" : ""}>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
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
                  <div className="space-y-1.5">
                    <Label htmlFor="labPerPerson">{t("orders.labField")}</Label>
                    <IconCenteredField icon={Building2} invalid={!!errors.labPerPerson}>
                      <Input
                        id="labPerPerson"
                        type="number"
                        {...form.register("labPerPerson")}
                      />
                    </IconCenteredField>
                    <FormError message={errors.labPerPerson?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="order-notes">{t("orders.notes")}</Label>
                    <Textarea
                      id="order-notes"
                      placeholder={t("orders.notesPlaceholder")}
                      rows={2}
                      maxLength={fieldLimits.orderNotes}
                      className="resize-none"
                      {...form.register("notes")}
                    />
                    <FormError message={errors.notes?.message} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground">{t("orders.selectMembers")}</p>
              <FormError message={errors.members?.message ?? errors.members?.root?.message} />
              <div className="grid gap-2 sm:grid-cols-2">
                {users.map((user) => {
                  const memberIndex = memberFields.findIndex((m) => m.userId === user.id);
                  const isSelected = memberIndex >= 0;
                  const memberError = errors.members?.[memberIndex]?.foodPrice;

                  return (
                    <Card
                      key={user.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        isSelected && "border-primary ring-1 ring-primary",
                      )}
                      onClick={() => !isSelected && toggleMember(user.id)}
                    >
                      <CardContent className="flex items-center gap-3 p-3">
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
                            className={cn("h-8 w-24", memberError && "border-destructive")}
                            {...form.register(`members.${memberIndex}.foodPrice`, {
                              valueAsNumber: true,
                            })}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground">{t("orders.sharedExpensesDesc")}</p>
              {expenseFields.map((field, index) => {
                const nameError = errors.sharedExpenses?.[index]?.name;
                const amountError = errors.sharedExpenses?.[index]?.amount;
                return (
                  <Card key={field.id}>
                    <CardContent className="flex items-start gap-2 p-3">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <Input
                          placeholder={t("orders.expenseName")}
                          maxLength={fieldLimits.expenseName}
                          className={nameError ? "border-destructive" : ""}
                          {...form.register(`sharedExpenses.${index}.name`)}
                        />
                        <FormError message={nameError?.message} />
                      </div>
                      <div className="w-24 space-y-0.5">
                        <Input
                          type="number"
                          placeholder={t("orders.amount")}
                          className={amountError ? "border-destructive" : ""}
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
                        className="shrink-0"
                        onClick={() => removeExpense(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => appendExpense({ name: "", amount: 0 })}
              >
                <Plus className="h-4 w-4" />
                {t("orders.addShared")}
              </Button>
            </motion.div>
          )}

          {step === 4 && !calculation && (
            <motion.div
              key="step4-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
            >
              {t("orders.reviewEmpty")}
            </motion.div>
          )}

          {step === 4 && calculation && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              <Card>
                <CardContent className="space-y-3 p-4 sm:p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("orders.restaurant")}</span>
                    <span className="font-medium">
                      {getRestaurantName(watchedValues.restaurantId)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("common.payer")}</span>
                    <span className="font-medium">{getUserName(watchedValues.payerId)}</span>
                  </div>
                  <Separator />
                  {calculation.members.map((m) => {
                    const isPayer = m.userId === watchedValues.payerId;
                    const payerName = getUserName(watchedValues.payerId);
                    return (
                      <div key={m.userId} className="flex justify-between text-sm">
                        <span>{getUserName(m.userId)}</span>
                        <div className="text-end">
                          <span className="font-medium">{formatMoney(m.shareAmount)}</span>
                          {isPayer ? (
                            <span className="ms-2 text-xs text-muted-foreground">
                              ({t("orders.ownShare")}: {formatMoney(m.pocketAmount)})
                            </span>
                          ) : m.pocketAmount > 0 ? (
                            <span className="ms-2 text-xs text-muted-foreground">
                              ({t("orders.owesPayerShort", {
                                payer: payerName,
                                amount: formatMoney(m.pocketAmount),
                              })})
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>{t("common.total")}</span>
                    <span className="text-primary">{formatMoney(calculation.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-success">
                    <span>{t("orders.labShare")}</span>
                    <span>{formatMoney(calculation.labTotalAmount)}</span>
                  </div>
                  {payerOutOfPocket !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("orders.payerOutOfPocket")}</span>
                      <span>{formatMoney(payerOutOfPocket)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex shrink-0 justify-between border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
        >
          <PrevChevron className="h-4 w-4" />
          {step === 1 ? t("common.cancel") : t("common.back")}
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={nextStep}>
            {t("common.next")}
            <NextChevron className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending || !calculation}>
            {isPending
              ? t("orders.submitting")
              : mode === "edit"
                ? t("orders.saveChanges")
                : t("orders.submit")}
          </Button>
        )}
      </div>
    </form>
  );
}
