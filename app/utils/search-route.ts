type SearchPathOptions = {
  basePath?: string
}

export function buildSearchPath(
  searchTerm?: string | null,
  searchParams?: URLSearchParams,
  options?: SearchPathOptions,
): string {
  const rawBasePath = options?.basePath ?? "/search"
  const basePath = rawBasePath.endsWith("/")
    ? rawBasePath.slice(0, -1)
    : rawBasePath
  const trimmed = searchTerm?.trim() ?? ""
  const params = new URLSearchParams(searchParams?.toString() ?? "")

  params.delete("q")

  if (params.has("rating") && !params.has("age_limit")) {
    params.set("age_limit", params.get("rating") ?? "")
  }
  params.delete("rating")

  if (trimmed) {
    params.set("tag", trimmed)
  } else {
    params.delete("tag")
  }

  if ((trimmed || params.toString()) && !params.has("age_limit")) {
    params.set("age_limit", "")
  }

  const query = params.toString()
  return query ? `${basePath}/?${query}` : basePath
}

export function getSearchTermFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/(?:r\/)?search\/([^/?#]+)/)

  if (!match) {
    return null
  }

  return decodeURIComponent(match[1])
}

export function isSearchPathname(pathname: string): boolean {
  return /^\/(?:r\/)?search(?:\/|$)/.test(pathname)
}
