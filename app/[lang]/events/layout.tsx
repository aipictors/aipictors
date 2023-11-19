"use client"

import { useTheme } from "next-themes"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

const EventsLayout = (props: Props) => {
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

  return <>{props.children}</>
}

export default EventsLayout
