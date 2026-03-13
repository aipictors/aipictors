type SearchPathOptions = {
  basePath?: string
}

export function buildSearchPath(
  searchTerm?: string | null,
  searchParams?: URLSearchParams,
  options?: SearchPathOptions,
): string {
  const basePath = options?.basePath ?? "/search"
  const trimmed = searchTerm?.trim() ?? ""
  const pathname = trimmed
    ? `${basePath}/${encodeURIComponent(trimmed)}`
    : basePath

  if (!searchParams) {
    return pathname
  }

  const query = searchParams.toString()
  return query ? `${pathname}?${query}` : pathname
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
