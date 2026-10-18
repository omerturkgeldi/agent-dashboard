"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { KeyRound, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SessionList } from "@/components/session-list";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { User } from "@/lib/api/types";
import { endAllUserSessions, endUserSession, getUserSessions } from "@/lib/api/users";

export interface UserDetailActions {
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
  onActivate: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
}

/**
 * Opens when a row is clicked: the user, every action as a visible button, and their open sessions.
 * The dialogs the buttons lead to belong to the table; the sheet closes first so they do not stack.
 */
export function UserDetailSheet({ user, onClose, actions }: { user: User | null; onClose: () => void; actions: UserDetailActions }) {
  const t = useTranslations("users");
  const tc = useTranslations("common");
  const ts = useTranslations("sessions");
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { data: sessions, isPending } = useQuery({ queryKey: ["sessions", user?.id], queryFn: () => getUserSessions(user!.id), enabled: !!user });

  const done = () => {
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    toast.success(ts("ended"));
  };
  const endOne = useMutation({ mutationFn: (sessionId: string) => endUserSession(user!.id, sessionId), onSuccess: done, onError: (e) => toast.error(e.message) });
  const endAll = useMutation({ mutationFn: () => endAllUserSessions(user!.id), onSuccess: done, onError: (e) => toast.error(e.message) });

  // Runs an action after closing the sheet.
  const then = (action: (user: User) => void) => () => {
    if (!user) return;
    onClose();
    action(user);
  };

  return (
    <Sheet open={!!user} onOpenChange={(open) => !open && onClose()}>
      {/* A drawer from the bottom on phones, a panel from the right elsewhere. */}
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "max-h-[85vh] overflow-y-auto rounded-t-2xl" : "w-full overflow-y-auto sm:max-w-md"}
      >
        {isMobile && <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-muted" aria-hidden />}
        {user && (
          <>
            <SheetHeader>
              <SheetTitle>{user.displayName || `${user.name} ${user.surname}`}</SheetTitle>
              <SheetDescription>{user.email}</SheetDescription>
              <div className="flex flex-wrap gap-1 pt-1">
                {user.isActive ? <Badge variant="outline">{t("active")}</Badge> : <Badge variant="destructive">{t("inactive")}</Badge>}
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary">{role}</Badge>
                ))}
              </div>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={then(actions.onEdit)}>
                  <Pencil /> {tc("edit")}
                </Button>
                <Button variant="outline" onClick={then(actions.onResetPassword)}>
                  <KeyRound /> {t("resetPassword")}
                </Button>
                {user.isActive ? (
                  <Button variant="outline" onClick={then(actions.onDeactivate)}>
                    <PowerOff /> {t("deactivate")}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={then(actions.onActivate)}>
                    <Power /> {t("activate")}
                  </Button>
                )}
                <Button variant="outline" className="text-destructive" onClick={then(actions.onDelete)}>
                  <Trash2 /> {tc("delete")}
                </Button>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-medium">{ts("title")}</h3>
                <SessionList sessions={sessions} isLoading={isPending} disabled={endOne.isPending} onEnd={(session) => endOne.mutate(session.id)} />
                {(sessions?.length ?? 0) > 0 && (
                  <Button variant="outline" size="sm" disabled={endAll.isPending} onClick={() => endAll.mutate()}>
                    {ts("endAll")}
                  </Button>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
