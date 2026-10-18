"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { SessionList } from "@/components/session-list";
import { Button } from "@/components/ui/button";
import { endMyOtherSessions, endMySession, getMySessions } from "@/lib/api/auth";

/** The signed-in user's own devices. Everybody sees this, whatever their role. */
export function MySessions() {
  const t = useTranslations("sessions");
  const queryClient = useQueryClient();
  const { data: sessions, isPending } = useQuery({ queryKey: ["sessions", "mine"], queryFn: getMySessions });

  const done = () => {
    queryClient.invalidateQueries({ queryKey: ["sessions", "mine"] });
    toast.success(t("ended"));
  };
  const endOne = useMutation({ mutationFn: endMySession, onSuccess: done, onError: (error) => toast.error(error.message) });
  const endOthers = useMutation({ mutationFn: endMyOtherSessions, onSuccess: done, onError: (error) => toast.error(error.message) });

  return (
    <div className="space-y-3">
      <SessionList sessions={sessions} isLoading={isPending} disabled={endOne.isPending} onEnd={(session) => endOne.mutate(session.id)} />
      {(sessions?.length ?? 0) > 1 && (
        <Button variant="outline" size="sm" disabled={endOthers.isPending} onClick={() => endOthers.mutate()}>
          {t("endOthers")}
        </Button>
      )}
    </div>
  );
}
