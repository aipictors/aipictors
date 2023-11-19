"use client"

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

  return (
    <nav
      className="sticky overflow-y-auto pb-4 pl-4"
      style={{
        top: "72px",
        height: "calc(100svh - 72px)",
        width: "12rem",
        minWidth: "12rem",
      }}
    >
      {props.children}
    </nav>
  )
}
