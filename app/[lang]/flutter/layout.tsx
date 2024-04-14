import { useTheme } from "next-themes"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

const FlutterLayout = (props: Props) => {
  const { setTheme } = useTheme()

  const searchParams = useSearchParams()

  const colorScheme = searchParams.get("prefers-color-scheme")

  useEffect(() => {
    if (colorScheme === "dark") {
      setTheme("dark")
    }
    if (colorScheme === "light") {
      setTheme("light")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <main className="container min-h-screen">{props.children}</main>
}

export default FlutterLayout
