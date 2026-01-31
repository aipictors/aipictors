type FetchPublicOptions = Omit<RequestInit, "credentials"> & {
  /**
   * If provided, overrides the default credentials behavior.
   * Defaults to `omit` for cross-origin, `same-origin` for same-origin.
   */
  credentials?: RequestCredentials
}

function isSameOriginUrl(url: string): boolean {
  try {
    const resolved = new URL(url, window.location.href)
    return resolved.origin === window.location.origin
  } catch {
    return false
  }
}

/**
 * Fetch a URL as a public resource.
 *
 * - Cross-origin: `credentials: "omit"` (prevents cookie/credential CORS failures)
 * - Same-origin: `credentials: "same-origin"`
 */
export function fetchPublic(
  url: string,
  options: FetchPublicOptions = {},
): Promise<Response> {
  const credentials =
    options.credentials ?? (isSameOriginUrl(url) ? "same-origin" : "omit")

  return fetch(url, {
    ...options,
    credentials,
  })
}
