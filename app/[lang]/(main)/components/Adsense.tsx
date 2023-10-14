"use client"
import { Box } from "@chakra-ui/react"
import { captureException } from "@sentry/node"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const PUBLISHER_ID = "2116548824296763"

type GoogleAdsenseProps = {
  slot: string
  style?: React.CSSProperties
  format?: string
  responsive?: string
}

export const GoogleAdsense = ({
  slot,
  style = { display: "block" },
  format,
  responsive = "false",
}: GoogleAdsenseProps): JSX.Element => {
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
        style={style}
        data-adtest={process.env.NODE_ENV === "production" ? "off" : "on"}
        data-ad-client={`ca-pub-${PUBLISHER_ID}`}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </Box>
  )
}
