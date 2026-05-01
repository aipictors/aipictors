import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  themes?: string[]
  enableSystem?: boolean
  enableColorScheme?: boolean
  disableTransitionOnChange?: boolean
  attribute?: string | string[]
  storageKey?: string
  forcedTheme?: string
  value?: Record<string, string>
  nonce?: string
  scriptProps?: Omit<React.ComponentProps<"script">, "dangerouslySetInnerHTML" | "children">
}

type ThemeContextValue = {
  forcedTheme?: string
  resolvedTheme?: string
  setTheme: (theme: string) => void
  systemTheme?: string
  theme?: string
  themes: string[]
}

const ThemeContext = createContext<ThemeContextValue>({
  setTheme: () => {},
  themes: [],
})

const MEDIA_QUERY = "(prefers-color-scheme: dark)"
const SYSTEM_THEMES = ["light", "dark"]

function getSystemTheme() {
  if (typeof window === "undefined") {
    return undefined
  }

  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light"
}

function getStoredTheme(storageKey: string, defaultTheme: string) {
  if (typeof window === "undefined") {
    return defaultTheme
  }

  try {
    return window.localStorage.getItem(storageKey) ?? defaultTheme
  } catch {
    return defaultTheme
  }
}

function getResolvedTheme(theme: string, enableSystem: boolean, systemTheme?: string) {
  if (theme === "system" && enableSystem) {
    return systemTheme ?? "light"
  }

  return theme
}

function applyThemeToDocument(props: {
  attribute: string | string[]
  disableTransitionOnChange: boolean
  enableColorScheme: boolean
  resolvedTheme: string
  themes: string[]
  value?: Record<string, string>
}) {
  if (typeof document === "undefined") {
    return
  }

  const root = document.documentElement
  const attributes = Array.isArray(props.attribute)
    ? props.attribute
    : [props.attribute]
  const themeValues = props.themes.map((theme) => props.value?.[theme] ?? theme)
  const nextTheme = props.value?.[props.resolvedTheme] ?? props.resolvedTheme

  let restoreTransitions: (() => void) | undefined

  if (props.disableTransitionOnChange) {
    const style = document.createElement("style")
    style.appendChild(
      document.createTextNode(
        "*,*::before,*::after{transition:none!important}",
      ),
    )
    document.head.appendChild(style)

    restoreTransitions = () => {
      window.getComputedStyle(document.body)
      requestAnimationFrame(() => {
        style.remove()
      })
    }
  }

  for (const attribute of attributes) {
    if (attribute === "class") {
      root.classList.remove(...themeValues)
      if (nextTheme) {
        root.classList.add(nextTheme)
      }
      continue
    }

    if (attribute.startsWith("data-")) {
      if (nextTheme) {
        root.setAttribute(attribute, nextTheme)
      } else {
        root.removeAttribute(attribute)
      }
      continue
    }

    root.setAttribute(attribute, nextTheme)
  }

  if (props.enableColorScheme) {
    root.style.colorScheme = SYSTEM_THEMES.includes(props.resolvedTheme)
      ? props.resolvedTheme
      : ""
  }

  restoreTransitions?.()
}

function createThemeScript(props: {
  attribute: string | string[]
  defaultTheme: string
  enableColorScheme: boolean
  enableSystem: boolean
  storageKey: string
  themes: string[]
  value?: Record<string, string>
}) {
  const attributes = JSON.stringify(
    Array.isArray(props.attribute) ? props.attribute : [props.attribute],
  )
  const defaultTheme = JSON.stringify(props.defaultTheme)
  const enableColorScheme = JSON.stringify(props.enableColorScheme)
  const enableSystem = JSON.stringify(props.enableSystem)
  const storageKey = JSON.stringify(props.storageKey)
  const themes = JSON.stringify(props.themes)
  const value = JSON.stringify(props.value ?? {})

  return `(() => {
  const attributes = ${attributes};
  const defaultTheme = ${defaultTheme};
  const enableColorScheme = ${enableColorScheme};
  const enableSystem = ${enableSystem};
  const storageKey = ${storageKey};
  const themes = ${themes};
  const value = ${value};
  const root = document.documentElement;
  const themeValues = themes.map((theme) => value[theme] || theme);
  const getSystemTheme = () =>
    window.matchMedia("${MEDIA_QUERY}").matches ? "dark" : "light";
  const resolveTheme = (theme) =>
    theme === "system" && enableSystem ? getSystemTheme() : theme;
  const applyTheme = (theme) => {
    const resolvedTheme = resolveTheme(theme);
    const nextTheme = value[resolvedTheme] || resolvedTheme;

    for (const attribute of attributes) {
      if (attribute === "class") {
        root.classList.remove(...themeValues);
        if (nextTheme) {
          root.classList.add(nextTheme);
        }
        continue;
      }

      if (attribute.startsWith("data-")) {
        if (nextTheme) {
          root.setAttribute(attribute, nextTheme);
        } else {
          root.removeAttribute(attribute);
        }
        continue;
      }

      root.setAttribute(attribute, nextTheme);
    }

    if (enableColorScheme) {
      root.style.colorScheme = ["light", "dark"].includes(resolvedTheme)
        ? resolvedTheme
        : "";
    }
  };

  let theme = defaultTheme;

  try {
    theme = localStorage.getItem(storageKey) || defaultTheme;
  } catch {}

  applyTheme(theme);
})();`
}

export function ThemeProvider({
  attribute = "data-theme",
  children,
  defaultTheme = "system",
  disableTransitionOnChange = false,
  enableColorScheme = true,
  enableSystem = true,
  forcedTheme,
  nonce,
  scriptProps,
  storageKey = "theme",
  themes = ["light", "dark"],
  value,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() =>
    getStoredTheme(storageKey, defaultTheme),
  )
  const [systemTheme, setSystemTheme] = useState<string | undefined>(() =>
    getSystemTheme(),
  )

  const resolvedTheme = getResolvedTheme(
    forcedTheme ?? theme,
    enableSystem,
    systemTheme,
  )

  useEffect(() => {
    setThemeState(getStoredTheme(storageKey, defaultTheme))
    setSystemTheme(getSystemTheme())
  }, [defaultTheme, storageKey])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQueryList = window.matchMedia(MEDIA_QUERY)
    const onChange = () => {
      setSystemTheme(mediaQueryList.matches ? "dark" : "light")
    }

    onChange()
    mediaQueryList.addEventListener("change", onChange)

    return () => {
      mediaQueryList.removeEventListener("change", onChange)
    }
  }, [])

  useEffect(() => {
    applyThemeToDocument({
      attribute,
      disableTransitionOnChange,
      enableColorScheme,
      resolvedTheme,
      themes,
      value,
    })
  }, [
    attribute,
    disableTransitionOnChange,
    enableColorScheme,
    resolvedTheme,
    themes,
    value,
  ])

  const setTheme = (nextTheme: string) => {
    setThemeState(nextTheme)

    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(storageKey, nextTheme)
    } catch {}
  }

  const contextValue = useMemo(
    () => ({
      forcedTheme,
      resolvedTheme,
      setTheme,
      systemTheme,
      theme,
      themes,
    }),
    [forcedTheme, resolvedTheme, systemTheme, theme, themes],
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <script
        {...scriptProps}
        dangerouslySetInnerHTML={{
          __html: createThemeScript({
            attribute,
            defaultTheme,
            enableColorScheme,
            enableSystem,
            storageKey,
            themes,
            value,
          }),
        }}
        nonce={nonce}
      />
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}