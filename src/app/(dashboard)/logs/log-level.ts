export const levelVariant = (level: string) => (level === "Error" || level === "Critical" ? "destructive" : level === "Warning" ? "secondary" : "outline");
