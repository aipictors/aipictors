"use client"
import { Box } from "@chakra-ui/react"
import { captureException } from "@sentry/nextjs"
import { usePathname } from "next/navigation"
import React, { useEffect } from "react"

const PUBLISHER_ID = "2116548824296763"

type Props = {
  slot: string
  style?: React.CSSProperties
  format?: string
  responsive?: string
}

export const GoogleAdsense: React.FC<Props> = (props): JSX.Element => {
  const pathname = usePathname()

  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      if (window.adsbygoogle === undefined) {
        window.adsbygoogle = []
      }
      window.adsbygoogle.push({})
    } catch (error) {
      captureException(error)
    }
  }, [pathname])

  return (
    <Box key={pathname}>
      <ins
        className="adsbygoogle"
        style={{
          ...props.style,
          display: "block",
        }}
        data-adtest={process.env.NODE_ENV === "production" ? "off" : "on"}
        data-ad-client={`ca-pub-${PUBLISHER_ID}`}
        data-ad-slot={props.slot}
        data-ad-format={props.format}
        data-full-width-responsive={props.responsive ?? false}
      />
    </Box>
  )
}
