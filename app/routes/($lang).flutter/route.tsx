import { Outlet, useSearchParams } from "@remix-run/react"
import { useEffect } from "react"
import { useTheme } from "~/components/theme-provider"

export default function FlutterLayout () {
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
    <main className="container-shadcn-ui min-h-screen">
      <Outlet />
    </main>
  )
}
