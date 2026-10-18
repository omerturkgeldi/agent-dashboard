"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Copy, Dices } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/api/types";
import { resetUserPassword } from "@/lib/api/users";

const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Random password with a letter case, a digit and a symbol, so it passes the backend's rules. */
function generatePassword() {
  const pick = (chars: string) => chars[crypto.getRandomValues(new Uint32Array(1))[0] % chars.length];
  const letters = Array.from({ length: 12 }, () => pick(alphabet)).join("");
  return `${letters}${pick("ABCDEFGHJKLMNPQRSTUVWXYZ")}${pick("23456789")}${pick("!@#$%*?")}`;
}

/** An admin sets a new password and passes it on. There is no e-mail, so the dialog can show it and copy it. */
export function ResetPasswordDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {/* Mounted only while open, so the field starts empty every time. */}
        {user && <ResetPasswordForm user={user} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordForm({ user, onClose }: { user: User; onClose: () => void }) {
  const t = useTranslations("users");
  const tv = useTranslations("validation");
  const tc = useTranslations("common");
  const [password, setPassword] = useState("");
  const [tooShort, setTooShort] = useState(false);

  const mutation = useMutation({
    mutationFn: () => resetUserPassword(user.id, password),
    onSuccess: () => {
      toast.success(t("passwordReset"));
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  function submit() {
    if (password.length < 6) return setTooShort(true);
    mutation.mutate();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("resetPasswordTitle")}</DialogTitle>
        <DialogDescription>{t("resetPasswordDescription", { email: user.email })}</DialogDescription>
      </DialogHeader>
      <Field data-invalid={tooShort}>
        <FieldLabel htmlFor="newPassword">{t("newPassword")}</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="newPassword"
            value={password}
            autoComplete="off"
            aria-invalid={tooShort}
            onChange={(e) => {
              setPassword(e.target.value);
              setTooShort(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button type="button" variant="outline" size="icon" aria-label={t("generatePassword")} title={t("generatePassword")} onClick={() => { setPassword(generatePassword()); setTooShort(false); }}>
            <Dices />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("copyPassword")}
            title={t("copyPassword")}
            disabled={!password}
            onClick={() => navigator.clipboard.writeText(password).then(() => toast.success(t("copied")))}
          >
            <Copy />
          </Button>
        </div>
        {tooShort && <FieldError>{tv("min6")}</FieldError>}
      </Field>
      <p className="text-sm text-muted-foreground">{t("resetPasswordNote")}</p>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {tc("cancel")}
        </Button>
        <Button type="button" disabled={mutation.isPending} onClick={submit}>
          {t("resetPassword")}
        </Button>
      </DialogFooter>
    </>
  );
}
