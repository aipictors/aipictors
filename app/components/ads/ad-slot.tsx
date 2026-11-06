import { useQuery } from "@apollo/client/index"
import { useLocation } from "@remix-run/react"
import { graphql } from "gql.tada"
import type React from "react"
import { useContext, useEffect, useRef, useState } from "react"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  /**
   * AdSense の広告ユニット ID（config.googleAdsense.slots から渡す）
   */
  slot: string
  /**
   * 広告が出るまで取っておく高さ（px）。広告が後から差し込まれてページがずれないようにする
   */
  minHeight: number
  /**
   * 全年齢の内容のときだけ true にする（R15/R18 の作品や一覧には Google 広告を出せない）
   */
  enabled: boolean
  format?: "auto" | "rectangle" | "horizontal"
  /**
   * 大きさを固定する（PC の右列など、上の方に出る枠はずれないように固定する）
   */
  fixedSize?: { width: number; height: number }
  /**
   * 広告が付かなかったときに同じ場所に出すもの。無ければ枠ごと消す
   * （画面の上の方にある枠は、消すとページがずれるので代わりを出す）
   */
  fallback?: React.ReactNode
  className?: string
}

const SCRIPT_ID = "aipictors-adsbygoogle"

/**
 * 広告のスクリプトを 1 回だけ読む。
 * 最初の表示を遅くしないよう、広告枠が画面に近づいてから読む
 */
function loadAdsenseScript() {
  if (document.getElementById(SCRIPT_ID)) return
  const script = document.createElement("script")
  script.id = SCRIPT_ID
  script.async = true
  script.crossOrigin = "anonymous"
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.googleAdsense.client}`
  document.head.appendChild(script)
}

/**
 * 広告を出すか。サブスク（ライト以上）の人には出さない。
 * ログイン状態やプランを確認中は "unknown"
 */
export function useAdVisibility(): "show" | "hide" | "unknown" {
  const authContext = useContext(AuthContext)

  const { data, loading } = useQuery(viewerAdFreePassQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  if (!config.googleAdsense.enabled) return "hide"
  if (authContext.isLoading) return "unknown"
  if (authContext.isNotLoggedIn) return "show"
  if (loading || data === undefined) return "unknown"

  const type = data.viewer?.currentPass?.type
  const isSubscribed =
    type === "LITE" || type === "STANDARD" || type === "PREMIUM"
  return isSubscribed ? "hide" : "show"
}

/**
 * Google 広告の枠
 * - サブスクの人には出さない
 * - 画面に近づいてから読み込む（スクリプトも初回表示では読まない）
 * - 場所を先に取っておき、広告が出てもページがずれないようにする
 * - 画面を移ると新しい枠に作り直す（ページ全体を読み直さない作りのため）
 */
export function AdSlot(props: Props) {
  const { pathname } = useLocation()

  return <AdSlotInner key={pathname} {...props} />
}

function AdSlotInner(props: Props) {
  const visibility = useAdVisibility()

  const t = useTranslation()

  const ref = useRef<HTMLDivElement>(null)

  const [isNear, setIsNear] = useState(false)

  const [isUnfilled, setIsUnfilled] = useState(false)

  const insRef = useRef<HTMLModElement>(null)

  const isActive = visibility === "show" && props.enabled

  useEffect(() => {
    if (!isActive || isNear) return
    const element = ref.current
    if (element === null) return
    if (!("IntersectionObserver" in window)) {
      setIsNear(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: "400px 0px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [isActive, isNear])

  useEffect(() => {
    if (!isActive || !isNear) return
    try {
      loadAdsenseScript()
      window.adsbygoogle = window.adsbygoogle ?? []
      window.adsbygoogle.push({})
    } catch (_error) {
      // 広告ブロッカーなどで失敗しても画面は壊さない
    }
  }, [isActive, isNear])

  // 広告が付かなかったか（AdSense が data-ad-status="unfilled" を付ける）
  useEffect(() => {
    const ins = insRef.current
    if (!isNear || ins === null) return
    const check = () => {
      if (ins.getAttribute("data-ad-status") === "unfilled") setIsUnfilled(true)
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(ins, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    })
    return () => observer.disconnect()
  }, [isNear])

  // 大きさを固定した枠（画面の上の方）は、確認中も場所を取っておく（出てからずれないように）
  if (visibility === "unknown" && props.enabled && props.fixedSize) {
    return (
      <div
        className={props.className}
        style={{ height: props.fixedSize.height + 20 }}
      />
    )
  }

  if (!isActive) return null

  if (isUnfilled && props.fallback === undefined) return null

  return (
    <aside
      ref={ref}
      aria-label={t("広告", "Advertisement")}
      className={props.className}
    >
      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{t("広告", "Ad")}</span>
        <Link to="/plus" className="hover:underline">
          {t("広告を非表示にする", "Remove ads")}
        </Link>
      </div>
      <div
        className="overflow-hidden rounded-md bg-muted/40"
        style={{ minHeight: props.minHeight }}
      >
        {isUnfilled && props.fallback}
        {isNear && !isUnfilled && (
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={
              props.fixedSize
                ? {
                    display: "block",
                    margin: "0 auto",
                    width: props.fixedSize.width,
                    height: props.fixedSize.height,
                  }
                : { display: "block", minHeight: props.minHeight }
            }
            data-ad-client={config.googleAdsense.client}
            data-ad-slot={props.slot}
            data-ad-format={
              props.fixedSize ? undefined : (props.format ?? "auto")
            }
            data-full-width-responsive={props.fixedSize ? undefined : "true"}
            data-adtest={import.meta.env.PROD ? undefined : "on"}
          />
        )}
      </div>
    </aside>
  )
}

const viewerAdFreePassQuery = graphql(
  `query ViewerAdFreePass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }`,
)
