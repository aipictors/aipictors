type NavigateOptions = {
  replace?: boolean
  state?: unknown
  preventScrollReset?: boolean
}

type Navigate = (to: string, options?: NavigateOptions) => void

type Options = NavigateOptions & {
  /**
   * When true, keep current scroll position on navigation.
   * Defaults to true because this helper is intended for tab-like navigation.
   */
  preventScrollReset?: boolean
}

export function makeNavigateCallback(navigate: Navigate, options?: Options) {
  const { preventScrollReset = true, replace, state } = options ?? {}

  return (to: string): void => {
    navigate(to, { preventScrollReset, replace, state })
  }
}
