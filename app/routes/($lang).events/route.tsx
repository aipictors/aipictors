import { Outlet, useSearchParams } from "@remix-run/react"
import { useEffect } from "react"
import { useTheme } from "next-themes"

export default function EventsLayout() {
  const { setTheme } = useTheme()

  const [searchParams] = useSearchParams()

  const colorScheme = searchParams.get("prefers-color-scheme")

  useEffect(() => {
    if (colorScheme === "dark") {
      setTheme("dark")
    }
    if (colorScheme === "light") {
      setTheme("light")
    }
  }, [])

  return (
    <main className="container min-h-screen">
      <Outlet />
    </main>
  )
}
