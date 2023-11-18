"use client"

import { Config } from "@/config"
import { captureException } from "@sentry/nextjs"
import { usePathname } from "next/navigation"
import React, { useEffect } from "react"

type Props = {
  slot: string
  style?: React.CSSProperties
  format?: string
  responsive?: string
}

export const GoogleAdsense = (props: Props) => {
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
    <div key={pathname}>
      <ins
        className="adsbygoogle"
        style={{
          ...props.style,
          display: "block",
        }}
        data-adtest={process.env.NODE_ENV === "production" ? "off" : "on"}
        data-ad-client={Config.googleAdsenseClient}
        data-ad-slot={props.slot}
        data-ad-format={props.format}
        data-full-width-responsive={props.responsive ?? false}
      />
    </div>
  )
}
