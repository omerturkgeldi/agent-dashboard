/** { users: { new: "New" } } -> { "users.new": "New" } */
export function flatten(messages: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") result[path] = value;
    else if (value && typeof value === "object") Object.assign(result, flatten(value as Record<string, unknown>, path));
  }
  return result;
}

/** Deep merge: `over` wins, `base` fills what `over` does not have. */
export function merge<T extends Record<string, unknown>>(base: T, over: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const current = result[key];
    result[key] = value && typeof value === "object" && current && typeof current === "object" ? merge(current as Record<string, unknown>, value as Record<string, unknown>) : value;
  }
  return result as T;
}
