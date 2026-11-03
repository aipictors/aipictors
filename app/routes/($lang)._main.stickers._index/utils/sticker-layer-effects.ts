import type { LayerEffects } from "~/routes/($lang)._main.stickers._index/types/sticker-layer"

export const clampNumber = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export const normalizeLayerEffects = (effects?: LayerEffects) => {
  const blur = clampNumber(effects?.blur ?? 0, 0, 20)
  const invert = effects?.invert ?? false
  const sparkleEnabled = effects?.sparkle?.enabled ?? false
  const sparkleIntensity = clampNumber(effects?.sparkle?.intensity ?? 0.6, 0, 1)
  return {
    blur,
    invert,
    sparkle: {
      enabled: sparkleEnabled,
      intensity: sparkleIntensity,
    },
  }
}

export const buildCssFilter = (effects?: LayerEffects) => {
  const e = normalizeLayerEffects(effects)
  const parts: string[] = []
  if (e.blur > 0) parts.push(`blur(${e.blur}px)`)
  if (e.invert) parts.push("invert(1)")
  return parts.length === 0 ? undefined : parts.join(" ")
}

export const hashStringToUint32 = (value: string) => {
  // FNV-1a
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export const mulberry32 = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
