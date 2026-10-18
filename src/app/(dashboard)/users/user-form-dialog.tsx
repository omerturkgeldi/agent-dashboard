"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getRoles } from "@/lib/api/roles";
import { grantableRoles } from "@/lib/users/permissions";
import type { User } from "@/lib/api/types";
import { createUser, updateUser, updateUserRoles } from "@/lib/api/users";

const schema = z.object({
  userName: z.string(),
  email: z.string().email("invalidEmail"),
  password: z.string(),
  name: z.string().min(1, "required"),
  surname: z.string().min(1, "required"),
  displayName: z.string(),
  roles: z.array(z.string()),
});
type FormValues = z.infer<typeof schema>;

/** Creates a user, or edits `user` when given. */
export function UserFormDialog({ open, onOpenChange, user, currentUser }: { open: boolean; onOpenChange: (open: boolean) => void; user: User | null; currentUser: Pick<User, "roles"> }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Mounted only while open, so the form starts fresh every time. */}
        <UserForm user={user} currentUser={currentUser} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function UserForm({ user, currentUser, onClose }: { user: User | null; currentUser: Pick<User, "roles">; onClose: () => void }) {
  const t = useTranslations("users");
  const tv = useTranslations("validation");
  const tc = useTranslations("common");
  const isEdit = !!user;
  const queryClient = useQueryClient();
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userName: "",
      email: user?.email ?? "",
      password: "",
      name: user?.name ?? "",
      surname: user?.surname ?? "",
      displayName: user?.displayName ?? "",
      roles: user?.roles ?? [],
    },
  });
  const selectedRoles = useWatch({ control, name: "roles" });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // The backend column is required even though the DTO says optional.
      const displayName = values.displayName || `${values.name} ${values.surname}`;
      let id = user?.id;
      if (user) {
        await updateUser(user.id, { email: values.email, name: values.name, surname: values.surname, displayName, isDeleted: false });
      } else {
        id = (await createUser({ ...values, displayName })).id;
      }
      await updateUserRoles(id!, values.roles);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(isEdit ? t("updated") : t("created"));
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  function onSubmit(values: FormValues) {
    // Fields that only exist when creating.
    if (!isEdit && values.userName.length < 3) return setError("userName", { message: "min3" });
    if (!isEdit && values.password.length < 6) return setError("password", { message: "min6" });
    mutation.mutate(values);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? t("editTitle") : t("newTitle")}</DialogTitle>
        <DialogDescription>{isEdit ? user.email : t("newDescription")}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {!isEdit && (
          <Field data-invalid={!!errors.userName}>
            <FieldLabel htmlFor="userName">{t("userName")}</FieldLabel>
            <Input id="userName" autoComplete="off" aria-invalid={!!errors.userName} {...register("userName")} />
            {errors.userName && <FieldError>{tv(errors.userName.message!)}</FieldError>}
          </Field>
        )}
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <FieldError>{tv(errors.email.message!)}</FieldError>}
        </Field>
        {!isEdit && (
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
            <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
            {errors.password && <FieldError>{tv(errors.password.message!)}</FieldError>}
          </Field>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">{t("firstName")}</FieldLabel>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <FieldError>{tv(errors.name.message!)}</FieldError>}
          </Field>
          <Field data-invalid={!!errors.surname}>
            <FieldLabel htmlFor="surname">{t("lastName")}</FieldLabel>
            <Input id="surname" aria-invalid={!!errors.surname} {...register("surname")} />
            {errors.surname && <FieldError>{tv(errors.surname.message!)}</FieldError>}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="displayName">{t("displayName")}</FieldLabel>
          <Input id="displayName" {...register("displayName")} />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t("roles")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {grantableRoles(currentUser, (roles ?? []).map((role) => role.name)).map((name) => (
              // Admins are only offered roles they may give; only a SuperAdmin can create Admins.
              <label key={name} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedRoles.includes(name)}
                  onCheckedChange={(checked) =>
                    setValue("roles", checked ? [...selectedRoles, name] : selectedRoles.filter((r) => r !== name))
                  }
                />
                {name}
              </label>
            ))}
          </div>
        </fieldset>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {tc("cancel")}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? tc("saving") : tc("save")}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
