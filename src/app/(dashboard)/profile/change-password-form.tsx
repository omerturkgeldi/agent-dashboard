"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/lib/api/auth";

const schema = z
  .object({
    currentPassword: z.string().min(1, "required"),
    newPassword: z.string().min(6, "min6"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "passwordsMismatch" });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const t = useTranslations("profile");
  const tv = useTranslations("validation");
  const tc = useTranslations("common");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      toast.success(t("changed"));
      reset();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      <Field data-invalid={!!errors.currentPassword}>
        <FieldLabel htmlFor="currentPassword">{t("currentPassword")}</FieldLabel>
        <Input id="currentPassword" type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword} {...register("currentPassword")} />
        {errors.currentPassword && <FieldError>{tv(errors.currentPassword.message!)}</FieldError>}
      </Field>
      <Field data-invalid={!!errors.newPassword}>
        <FieldLabel htmlFor="newPassword">{t("newPassword")}</FieldLabel>
        <Input id="newPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
        {errors.newPassword && <FieldError>{tv(errors.newPassword.message!)}</FieldError>}
      </Field>
      <Field data-invalid={!!errors.confirmPassword}>
        <FieldLabel htmlFor="confirmPassword">{t("confirmPassword")}</FieldLabel>
        <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
        {errors.confirmPassword && <FieldError>{tv(errors.confirmPassword.message!)}</FieldError>}
      </Field>
      <Button type="submit" disabled={mutation.isPending} className="self-start">
        {mutation.isPending ? tc("saving") : t("changePassword")}
      </Button>
    </form>
  );
}
