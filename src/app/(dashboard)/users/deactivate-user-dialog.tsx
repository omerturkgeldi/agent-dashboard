"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "@/lib/api/types";
import { setUserActive } from "@/lib/api/users";

/** Asks before deactivating. Activating again needs no question, see `useSetUserActive`. */
export function DeactivateUserDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  const t = useTranslations("users");
  const tc = useTranslations("common");
  const mutation = useSetUserActive(onClose);

  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deactivateTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("deactivateDescription", { email: user?.email ?? "" })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={mutation.isPending} onClick={() => user && mutation.mutate({ id: user.id, isActive: false })}>
            {t("deactivate")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function useSetUserActive(onDone?: () => void) {
  const t = useTranslations("users");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setUserActive(id, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(isActive ? t("activated") : t("deactivated"));
      onDone?.();
    },
    onError: (error) => toast.error(error.message),
  });
}
