"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Flag } from "@/components/flag";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { refreshTranslations } from "@/i18n/actions";
import { createLanguage, deleteLanguage, updateLanguage } from "@/lib/api/languages";
import type { ManagedLanguage } from "@/lib/api/types";
import { LanguagePicker } from "./language-picker";

const schema = z.object({
  code: z.string().regex(/^[a-zA-Z]{2,3}(-[A-Za-z0-9]{2,8})*$/, "languageCode"),
  name: z.string().min(1, "required"),
  nativeName: z.string().min(1, "required"),
  flagCode: z.string().max(10),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

/** Adds a language, or edits `language` when given. */
export function LanguageDialog({ open, onOpenChange, language, existing, canDelete, onCreated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: ManagedLanguage | null;
  /** Codes of the languages that already exist. */
  existing: string[];
  canDelete: boolean;
  onCreated: (code: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Mounted only while open, so the form starts fresh every time. */}
        <LanguageForm language={language} existing={existing} canDelete={canDelete} onClose={() => onOpenChange(false)} onCreated={onCreated} />
      </DialogContent>
    </Dialog>
  );
}

function LanguageForm({ language, existing, canDelete, onClose, onCreated }: { language: ManagedLanguage | null; existing: string[]; canDelete: boolean; onClose: () => void; onCreated: (code: string) => void }) {
  const t = useTranslations("translations");
  const tv = useTranslations("validation");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const router = useRouter();
  const isEdit = !!language;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: language?.code ?? "", name: language?.name ?? "", nativeName: language?.nativeName ?? "", flagCode: language?.flagCode ?? "", isActive: language?.isActive ?? true },
  });
  const flagCode = useWatch({ control, name: "flagCode" });
  const isActive = useWatch({ control, name: "isActive" });

  async function done() {
    await queryClient.invalidateQueries({ queryKey: ["languages"] });
    await queryClient.invalidateQueries({ queryKey: ["translations"] });
    await refreshTranslations();
    router.refresh();
    onClose();
  }

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const flag = values.flagCode.trim() || undefined;
      if (language) return updateLanguage(language.code, { name: values.name, nativeName: values.nativeName, flagCode: flag, isActive: values.isActive, sortOrder: language.sortOrder });
      const created = await createLanguage({ code: values.code, name: values.name, nativeName: values.nativeName, flagCode: flag });
      onCreated(created.code);
    },
    onSuccess: async () => {
      toast.success(isEdit ? t("languageUpdated") : t("languageAdded"));
      await done();
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteLanguage(language!.code),
    onSuccess: async () => {
      toast.success(t("languageDeleted"));
      await done();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? t("editLanguage") : t("addLanguage")}</DialogTitle>
        <DialogDescription>{isEdit ? language.code : t("addLanguageHint")}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit((values) => save.mutate(values))} className="flex flex-col gap-4" noValidate>
        {!isEdit && (
          <Field>
            <FieldLabel>{t("chooseCommon")}</FieldLabel>
            <LanguagePicker
              existing={existing}
              onPick={(preset) => {
                setValue("code", preset.code, { shouldValidate: true });
                setValue("name", preset.name, { shouldValidate: true });
                setValue("nativeName", preset.nativeName, { shouldValidate: true });
                setValue("flagCode", preset.flagCode);
              }}
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.code}>
            <FieldLabel htmlFor="code">{t("languageCode")}</FieldLabel>
            <Input id="code" placeholder="fr, pt-BR" disabled={isEdit} aria-invalid={!!errors.code} {...register("code")} />
            {errors.code && <FieldError>{tv(errors.code.message!)}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="flagCode">{t("flag")}</FieldLabel>
            <div className="flex items-center gap-2">
              <Input id="flagCode" placeholder="fr" {...register("flagCode")} />
              <Flag code={flagCode} className="text-2xl" />
            </div>
          </Field>
        </div>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">{t("languageName")}</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <FieldError>{tv(errors.name.message!)}</FieldError>}
        </Field>
        <Field data-invalid={!!errors.nativeName}>
          <FieldLabel htmlFor="nativeName">{t("languageNativeName")}</FieldLabel>
          <Input id="nativeName" aria-invalid={!!errors.nativeName} {...register("nativeName")} />
          {errors.nativeName && <FieldError>{tv(errors.nativeName.message!)}</FieldError>}
        </Field>
        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isActive} disabled={language.isSystem} onCheckedChange={(value) => setValue("isActive", !!value)} />
            {t("active")}
          </label>
        )}
        <DialogFooter className="sm:justify-between">
          {isEdit && canDelete && !language.isSystem ? (
            <AlertDialog>
              <AlertDialogTrigger render={<Button type="button" variant="ghost" className="text-destructive" />}>{tc("delete")}</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteTitle", { name: language.name })}</AlertDialogTitle>
                  <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
                  <AlertDialogAction disabled={remove.isPending} onClick={() => remove.mutate()}>
                    {tc("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? tc("saving") : tc("save")}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </>
  );
}
