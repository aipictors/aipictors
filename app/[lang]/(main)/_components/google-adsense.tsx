"use client"

import { viewerCurrentPassQuery } from "@/_graphql/queries/viewer/viewer-current-pass"
import { config } from "@/config"
import { useSuspenseQuery } from "@apollo/client/index.js"
import { usePathname } from "next/navigation"
import type React from "react"
import { useEffect } from "react"

type Props = {
  slot: string
  style?: React.CSSProperties
  format?: string
  responsive?: string
}

/**
 * Google広告
 * @param props
 * @returns
 */
export const GoogleAdsense = (props: Props) => {
  const { data } = useSuspenseQuery(viewerCurrentPassQuery, {})

  const currentPass = data.viewer?.currentPass

  if (currentPass?.type === "PREMIUM" || currentPass?.type === "STANDARD")
    return null

  const pathname = usePathname()

  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      if (window.adsbygoogle === undefined) {
        window.adsbygoogle = []
      }
      window.adsbygoogle.push({})
    } catch (error) {
      // captureException(error)
    }
  }, [pathname])

  return (
    <div key={pathname}>
      <ins
        className="adsbygoogle"
        style={{
          ...props.style,
          display: "block",
        }}
        data-adtest={import.meta.env.NODE_ENV === "production" ? "off" : "on"}
        data-ad-client={config.googleAdsense.client}
        data-ad-slot={props.slot}
        data-ad-format={props.format}
        data-full-width-responsive={props.responsive ?? false}
      />
    </div>
  )
}
