export const auditActions = ["Created", "Updated", "Deleted", "LoginSucceeded", "LoginFailed", "Logout", "PasswordChanged", "RolesChanged", "UserActivated", "UserDeactivated", "PasswordReset", "SessionRevoked", "TranslationUpdated", "TranslationsImported"] as const;

export const actionVariant = (action: string) =>
  action === "Deleted" || action === "LoginFailed" ? "destructive" : action === "Created" ? "default" : "secondary";
