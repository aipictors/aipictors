"use client"

import { StaticNavigation } from "@/app/_components/static-navigation"
import { useBreakpointValue } from "@chakra-ui/react"

type Props = {
  children: React.ReactNode
}

export const ResponsiveNavigation = (props: Props) => {
  const hasNavigation = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
  })

  if (!hasNavigation) {
    return null
  }

  return <StaticNavigation>{props.children}</StaticNavigation>
}
