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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocaleDatePicker } from "@/components/shared/locale-date-picker";
import { FormError } from "@/components/shared/form-error";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations";
import { calculateOrder } from "@/lib/calculations";
import { createOrder, updateOrder } from "@/actions";
import { useOrderFormStore } from "@/stores/app-store";
import { useI18n } from "@/components/layout/i18n-provider";

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
  const { t, formatMoney, dir } = useI18n();
  const isRtl = dir === "rtl";
  const PrevChevron = isRtl ? ChevronRight : ChevronLeft;
  const NextChevron = isRtl ? ChevronLeft : ChevronRight;

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
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

  const calculation = useMemo(() => {
    if (watchedValues.members.length === 0) return null;
    try {
      return calculateOrder({
        members: watchedValues.members.filter((m) => m.userId),
        sharedExpenses: watchedValues.sharedExpenses ?? [],
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
      const valid = await form.trigger(["date", "restaurantId", "payerId", "labPerPerson"]);
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

  const { errors } = form.formState;

  const onSubmit = (data: CreateOrderInput) => {
    startTransition(async () => {
      try {
        if (mode === "edit" && defaultValues?.id) {
          await updateOrder({ ...data, id: defaultValues.id });
          toast.success(t("orders.updateSuccess"));
        } else {
          await createOrder(data);
          toast.success(t("orders.createSuccess"));
        }
        resetStep();
        router.push("/orders");
        router.refresh();
      } catch {
        toast.error(t("orders.createError"));
      }
    });
  };

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name ?? "";
  const getRestaurantName = (id: string) =>
    restaurants.find((r) => r.id === id)?.name ?? "";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        {stepKeys.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              {i < stepKeys.length - 1 && (
                <div
                  className={`mx-2 hidden h-0.5 w-8 sm:block md:w-16 ${
                    isDone ? "bg-success" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">{t("orders.date")}</Label>
                    <LocaleDatePicker
                      id="date"
                      value={form.watch("date")}
                      onChange={(v) =>
                        form.setValue("date", v, { shouldValidate: true, shouldDirty: true })
                      }
                    />
                    <FormError message={errors.date?.message} />
                  </div>
                  <div className="space-y-2">
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
                            className={errors.restaurantId ? "border-destructive ring-destructive/30" : ""}
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
                  <div className="space-y-2">
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
                          <SelectTrigger
                            className={errors.payerId ? "border-destructive ring-destructive/30" : ""}
                          >
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
                  <div className="space-y-2">
                    <Label htmlFor="labPerPerson">{t("orders.labField")}</Label>
                    <Input
                      id="labPerPerson"
                      type="number"
                      className={errors.labPerPerson ? "border-destructive" : ""}
                      {...form.register("labPerPerson")}
                    />
                    <FormError message={errors.labPerPerson?.message} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">{t("orders.selectMembers")}</p>
              <FormError message={errors.members?.message ?? errors.members?.root?.message} />
              {users.map((user) => {
                const memberIndex = memberFields.findIndex((m) => m.userId === user.id);
                const isSelected = memberIndex >= 0;
                const memberError = errors.members?.[memberIndex]?.foodPrice;
                return (
                  <Card
                    key={user.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "border-primary ring-1 ring-primary" : ""
                    }`}
                    onClick={() => !isSelected && toggleMember(user.id)}
                  >
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex flex-1 items-center gap-4">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : ""
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span className="flex-1 font-medium">{user.name}</span>
                      </div>
                      {isSelected && (
                        <div className="w-full sm:w-36">
                          <Input
                            type="number"
                            placeholder={t("orders.foodPrice")}
                            className={memberError ? "border-destructive" : ""}
                            {...form.register(`members.${memberIndex}.foodPrice`, {
                              valueAsNumber: true,
                            })}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <FormError message={memberError?.message} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {expenseFields.map((field, index) => {
                const nameError = errors.sharedExpenses?.[index]?.name;
                const amountError = errors.sharedExpenses?.[index]?.amount;
                return (
                  <Card key={field.id}>
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-3">
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder={t("orders.expenseName")}
                          className={nameError ? "border-destructive" : ""}
                          {...form.register(`sharedExpenses.${index}.name`)}
                        />
                        <FormError message={nameError?.message} />
                      </div>
                      <div className="w-full space-y-1 sm:w-32">
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
                        className="self-end sm:self-start"
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

          {step === 4 && calculation && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("orders.restaurant")}</span>
                    <span className="font-medium">
                      {getRestaurantName(watchedValues.restaurantId)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("common.payer")}</span>
                    <span className="font-medium">
                      {getUserName(watchedValues.payerId)}
                    </span>
                  </div>
                  <Separator />
                  {calculation.members.map((m) => (
                    <div key={m.userId} className="flex justify-between text-sm">
                      <span>{getUserName(m.userId)}</span>
                      <div className="text-end">
                        <span className="font-medium">{formatMoney(m.shareAmount)}</span>
                        <span className="ms-2 text-xs text-muted-foreground">
                          ({t("common.fromPocket")}: {formatMoney(m.pocketAmount)})
                        </span>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>{t("common.total")}</span>
                    <span className="text-primary">
                      {formatMoney(calculation.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-success">
                    <span>{t("orders.labShare")}</span>
                    <span>{formatMoney(calculation.labTotalAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
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
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("orders.submitting")
                : mode === "edit"
                  ? t("orders.saveChanges")
                  : t("orders.submit")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
