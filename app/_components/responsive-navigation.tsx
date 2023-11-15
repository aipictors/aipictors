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
    <div
      className="sticky top-16 overflow-y-auto pb-4 px-4"
      style={{
        height: "calc(100vh - 72px)",
        width: "12rem",
        minWidth: "12rem",
      }}
    >
      {props.children}
    </div>
  )
}
