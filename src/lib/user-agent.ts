/** Browser and operating system from a User-Agent string, good enough for a list of devices. */
export function describeUserAgent(userAgent: string | null) {
  const ua = userAgent ?? "";
  // Order matters: Edge and Opera also say Chrome, Chrome also says Safari.
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : null;
  const os =
    /Windows/.test(ua) ? "Windows"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : null;
  return { browser, os, mobile: /Android|iPhone|iPad|Mobile/.test(ua) };
}

/** Country name in the given language from an ISO code ("DE" -> "Germany"). Falls back to the code. */
export function countryName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
