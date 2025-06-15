const ANCHOR_TTL_MS = 1000 * 60 * 1

export function getAnchorAt(): string {
  if (typeof window === "undefined") return new Date().toISOString()

  const saved = sessionStorage.getItem("home-works-anchorAt")
  const savedAt = sessionStorage.getItem("home-works-anchorAt:ts")
  const now = Date.now()

  if (!saved || !savedAt || now - Number(savedAt) > ANCHOR_TTL_MS) {
    const fresh = new Date().toISOString()
    sessionStorage.setItem("home-works-anchorAt", fresh)
    sessionStorage.setItem("home-works-anchorAt:ts", String(now))
    return fresh
  }
  return saved
}
