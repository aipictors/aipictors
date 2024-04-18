import { Outlet, useSearchParams } from "@remix-run/react"
import { useEffect } from "react"
import { Theme, useTheme } from "remix-themes"

export default function EventsLayout() {
  const [, setTheme] = useTheme()

  const [searchParams] = useSearchParams()

  const colorScheme = searchParams.get("prefers-color-scheme")

  useEffect(() => {
    if (colorScheme === "dark") {
      setTheme(Theme.DARK)
    }
    if (colorScheme === "light") {
      setTheme(Theme.LIGHT)
    }
  }, [])

  return (
    <main className="container min-h-screen">
      <Outlet />
    </main>
  )
}
