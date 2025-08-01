import { config } from "~/config"
import { useSuspenseQuery } from "@apollo/client/index"
import { useLocation } from "@remix-run/react"
import { graphql } from "gql.tada"
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
 */
export function GoogleAdsense(props: Props) {
  const { data } = useSuspenseQuery(viewerCurrentPassQuery, {})

  const currentPass = data.viewer?.currentPass

  if (currentPass?.type === "PREMIUM" || currentPass?.type === "STANDARD")
    return null

  const { pathname } = useLocation()

  useEffect(() => {
    try {
      if (typeof document === "undefined") return
      if (window.adsbygoogle === undefined) {
        window.adsbygoogle = []
      }
      window.adsbygoogle.push({})
    } catch (_error) {
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

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
        payment {
          id
          amount
          stripePaymentIntentId
        }
        isDisabled
        periodStart
        periodEnd
        trialPeriodStart
        trialPeriodEnd
        createdAt
        price
      }
    }
  }`,
  [],
)
