const SUPPORT_SUCCESS_DIALOG_SHOWN_USERS_KEY =
  "aipictors-support-success-dialog-shown-users"

const readShownUserIds = () => {
  if (typeof window === "undefined") {
    return [] as string[]
  }

  try {
    const raw = window.localStorage.getItem(
      SUPPORT_SUCCESS_DIALOG_SHOWN_USERS_KEY,
    )

    if (raw === null) {
      return []
    }

    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((value): value is string => typeof value === "string")
  } catch {
    return []
  }
}

export const consumeSupportSuccessDialogOpportunity = (
  targetUserId?: string | null,
) => {
  if (!targetUserId || typeof window === "undefined") {
    return true
  }

  const shownUserIds = readShownUserIds()

  if (shownUserIds.includes(targetUserId)) {
    return false
  }

  try {
    window.localStorage.setItem(
      SUPPORT_SUCCESS_DIALOG_SHOWN_USERS_KEY,
      JSON.stringify([targetUserId, ...shownUserIds].slice(0, 200)),
    )
  } catch {
    return true
  }

  return true
}