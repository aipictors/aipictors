"use client"
import { useColorMode } from "@chakra-ui/react"
import { useSearchParams } from "next/navigation"
import type { FC} from "react";
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

const EventsLayout: FC<Props> = (props) => {
  const { setColorMode } = useColorMode()

  const searchParams = useSearchParams()

  const colorScheme = searchParams.get("prefers-color-scheme")

  useEffect(() => {
    if (colorScheme === "dark") {
      setColorMode("dark")
    }
    if (colorScheme === "light") {
      setColorMode("light")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{props.children}</>
}

export default EventsLayout
