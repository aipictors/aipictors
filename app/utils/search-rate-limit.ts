const SEARCH_RATE_LIMIT_STORAGE_KEY = "aipictors-search-rate-limit"
const SEARCH_RATE_LIMIT_WINDOW_MS = 60 * 1000
const SEARCH_RATE_LIMIT_MAX_COUNT = 3

type SearchRateLimitState = {
  timestamps: number[]
}

export type SearchRateLimitResult = {
  isAllowed: boolean
  remainingCount: number
  retryAfterMs: number
}

function readSearchRateLimitState(): SearchRateLimitState {
  if (typeof window === "undefined") {
    return { timestamps: [] }
  }

  try {
    const stored = window.localStorage.getItem(SEARCH_RATE_LIMIT_STORAGE_KEY)

    if (!stored) {
      return { timestamps: [] }
    }

    const parsed = JSON.parse(stored) as Partial<SearchRateLimitState>

    if (!Array.isArray(parsed.timestamps)) {
      return { timestamps: [] }
    }

    return {
      timestamps: parsed.timestamps.filter((value): value is number =>
        Number.isFinite(value),
      ),
    }
  } catch {
    return { timestamps: [] }
  }
}

function writeSearchRateLimitState(state: SearchRateLimitState) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(
      SEARCH_RATE_LIMIT_STORAGE_KEY,
      JSON.stringify(state),
    )
  } catch {
    // noop
  }
}

export function consumeSearchRateLimitSlot(
  now: number = Date.now(),
): SearchRateLimitResult {
  if (typeof window === "undefined") {
    return {
      isAllowed: true,
      remainingCount: SEARCH_RATE_LIMIT_MAX_COUNT - 1,
      retryAfterMs: 0,
    }
  }

  const state = readSearchRateLimitState()
  const timestamps = state.timestamps.filter(
    (timestamp) => now - timestamp < SEARCH_RATE_LIMIT_WINDOW_MS,
  )

  if (timestamps.length >= SEARCH_RATE_LIMIT_MAX_COUNT) {
    const oldestTimestamp = timestamps[0]
    const retryAfterMs = Math.max(
      0,
      SEARCH_RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp),
    )

    writeSearchRateLimitState({ timestamps })

    return {
      isAllowed: false,
      remainingCount: 0,
      retryAfterMs,
    }
  }

  const nextTimestamps = [...timestamps, now]
  writeSearchRateLimitState({ timestamps: nextTimestamps })

  return {
    isAllowed: true,
    remainingCount: Math.max(
      0,
      SEARCH_RATE_LIMIT_MAX_COUNT - nextTimestamps.length,
    ),
    retryAfterMs: 0,
  }
}
