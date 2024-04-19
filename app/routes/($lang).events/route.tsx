import { Outlet, useSearchParams } from "@remix-run/react"
import { useEffect } from "react"
import { Theme, useTheme } from "remix-themes"

export default function EventsLayout() {
  const [theme, setTheme] = useTheme()

  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (theme === "dark") {
      setTheme(Theme.DARK)
    }
    if (theme === "light") {
      setTheme(Theme.LIGHT)
    }
  }, [])

  return (
    <main className="container min-h-screen">
      <Outlet />
    </main>
  )
}
