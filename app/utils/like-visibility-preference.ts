const LIKE_VISIBILITY_PREFERENCE_KEYS = {
  allAgeAnonymousByDefault: "like-visibility:all-age-anonymous-by-default",
  sensitiveAnonymousByDefault:
    "like-visibility:sensitive-anonymous-by-default",
} as const

const readBooleanPreference = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const value = window.localStorage.getItem(key)

    if (value === null) {
      return fallback
    }

    return value === "true"
  } catch {
    return fallback
  }
}

const writeBooleanPreference = (key: string, value: boolean) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // ignore storage write failures
  }
}

export const getLikeVisibilityPreferences = () => {
  const allAgeAnonymousByDefault = readBooleanPreference(
    LIKE_VISIBILITY_PREFERENCE_KEYS.allAgeAnonymousByDefault,
    false,
  )
  const sensitiveAnonymousByDefault = readBooleanPreference(
    LIKE_VISIBILITY_PREFERENCE_KEYS.sensitiveAnonymousByDefault,
    true,
  )

  return {
    allAgeAnonymousByDefault,
    sensitiveAnonymousByDefault,
  }
}

export const getDefaultLikeIsAnonymous = (isSensitive: boolean) => {
  const preferences = getLikeVisibilityPreferences()

  return isSensitive
    ? preferences.sensitiveAnonymousByDefault
    : preferences.allAgeAnonymousByDefault
}

export const saveLikeVisibilityPreferences = (input: {
  allAgeAnonymousByDefault: boolean
  sensitiveAnonymousByDefault: boolean
}) => {
  writeBooleanPreference(
    LIKE_VISIBILITY_PREFERENCE_KEYS.allAgeAnonymousByDefault,
    input.allAgeAnonymousByDefault,
  )
  writeBooleanPreference(
    LIKE_VISIBILITY_PREFERENCE_KEYS.sensitiveAnonymousByDefault,
    input.sensitiveAnonymousByDefault,
  )
}