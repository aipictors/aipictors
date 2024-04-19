import { Outlet, useSearchParams } from "@remix-run/react"
import { useTheme } from "next-themes"
import { useEffect } from "react"

export default function FlutterLayout() {
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
