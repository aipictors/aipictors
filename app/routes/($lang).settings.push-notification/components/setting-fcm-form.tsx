import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  BellOffIcon,
  BellRingIcon,
  Loader2Icon,
  MonitorSmartphoneIcon,
  SendIcon,
  ShieldAlertIcon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  isIosBrowserTab,
  LOCAL_TOKEN_KEY,
  type PushStatus,
  shouldRefreshToken,
  toPushStatus,
} from "~/routes/($lang).settings.push-notification/utils/push-status"

const isPushSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window

const readLocalToken = () => {
  try {
    return window.localStorage.getItem(LOCAL_TOKEN_KEY)
  } catch {
    return null
  }
}

const writeLocalToken = (token: string | null) => {
  try {
    if (token === null) window.localStorage.removeItem(LOCAL_TOKEN_KEY)
    else window.localStorage.setItem(LOCAL_TOKEN_KEY, token)
  } catch {}
}

/** このブラウザのトークン。通知が許可されていないと許可のダイアログが出る */
const fetchBrowserToken = async () => {
  const { getMessaging, getToken } = await import("firebase/messaging")
  return getToken(getMessaging(), { vapidKey: config.fcm.vapidKey })
}

/**
 * ブラウザのPush通知をオン・オフする。今の状態（このブラウザに届くか）を大きく見せる
 */
export function SettingFcmForm() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const { data, loading: isLoadingViewer } = useQuery(viewerWebFcmTokenQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "network-only",
  })
  const [mutation] = useMutation(updateAccountWebFcmTokenMutation)

  const [isMounted, setIsMounted] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  )
  const [serverToken, setServerToken] = useState<string | null>(null)
  const [currentToken, setCurrentToken] = useState<string | null | undefined>(
    undefined,
  )
  const [busy, setBusy] = useState<"enable" | "test" | "disable" | null>(null)

  useEffect(() => {
    setIsMounted(true)
    if (isPushSupported()) setPermission(Notification.permission)
  }, [])

  useEffect(() => {
    setServerToken(data?.viewer?.user.webFcmToken ?? null)
  }, [data])

  // 許可済みなら、このブラウザのトークンを取って、届く先がこのブラウザか確かめる
  useEffect(() => {
    if (!isMounted || permission !== "granted" || data === undefined) return
    let isCancelled = false
    fetchBrowserToken()
      .then(async (token) => {
        if (isCancelled) return
        setCurrentToken(token)
        const savedToken = data?.viewer?.user.webFcmToken ?? null
        if (
          shouldRefreshToken({
            serverToken: savedToken,
            currentToken: token,
            localToken: readLocalToken(),
          })
        ) {
          await mutation({ variables: { input: { token } } })
          writeLocalToken(token)
          setServerToken(token)
        }
      })
      .catch(() => {
        if (!isCancelled) setCurrentToken(null)
      })
    return () => {
      isCancelled = true
    }
  }, [isMounted, permission, data, mutation])

  if (!isMounted || authContext.isLoading || isLoadingViewer) {
    return <StatusCard status="checking" />
  }

  if (authContext.isNotLoggedIn) {
    return (
      <p className="text-muted-foreground text-sm">
        {t(
          "Push通知を設定するにはログインしてください。",
          "Please log in to set up push notifications.",
        )}
      </p>
    )
  }

  const status: PushStatus = toPushStatus({
    isSupported: isPushSupported(),
    permission,
    serverToken,
    currentToken,
  })

  const register = async (kind: "enable" | "test") => {
    setBusy(kind)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== "granted") {
        toast(
          t(
            "ブラウザで通知が許可されませんでした。",
            "Notifications were not allowed in the browser.",
          ),
        )
        return
      }
      const token = await fetchBrowserToken()
      // 登録するとサーバーからテスト通知が送られる
      await mutation({ variables: { input: { token } } })
      writeLocalToken(token)
      setCurrentToken(token)
      setServerToken(token)
      toast(
        kind === "enable"
          ? t(
              "このブラウザで通知を受け取る設定をしました。テスト通知が届きます。",
              "This browser will now receive notifications. A test notification is on its way.",
            )
          : t(
              "テスト通知を送りました。数秒たっても届かないときは、下の「通知が届かないとき」をご確認ください。",
              "Test notification sent. If it does not arrive in a few seconds, see “Not receiving notifications?” below.",
            ),
      )
    } catch {
      toast(
        t(
          "設定できませんでした。時間をおいてもう一度お試しください。",
          "Could not set up notifications. Please try again later.",
        ),
      )
    } finally {
      setBusy(null)
    }
  }

  const disable = async () => {
    setBusy("disable")
    try {
      await mutation({ variables: { input: { token: null } } })
      writeLocalToken(null)
      setServerToken(null)
      toast(t("Push通知をオフにしました。", "Push notifications turned off."))
    } catch {
      toast(
        t(
          "オフにできませんでした。時間をおいてもう一度お試しください。",
          "Could not turn off notifications. Please try again later.",
        ),
      )
    } finally {
      setBusy(null)
    }
  }

  const spinner = (kind: typeof busy) =>
    busy === kind ? <Loader2Icon className="size-4 animate-spin" /> : null

  return (
    <StatusCard status={status}>
      {(status === "off" || status === "other-browser") && (
        <Button
          onClick={() => register("enable")}
          disabled={busy !== null}
          className="w-full gap-2 sm:w-auto"
        >
          {spinner("enable") ?? <BellRingIcon className="size-4" />}
          {status === "off"
            ? t("このブラウザで通知を受け取る", "Get notifications here")
            : t("このブラウザに切り替える", "Switch to this browser")}
        </Button>
      )}
      {status === "on" && (
        <Button
          onClick={() => register("test")}
          disabled={busy !== null}
          className="w-full gap-2 sm:w-auto"
        >
          {spinner("test") ?? <SendIcon className="size-4" />}
          {t("テスト通知を送る", "Send a test notification")}
        </Button>
      )}
      {(status === "on" || status === "other-browser") && (
        <Button
          onClick={disable}
          disabled={busy !== null}
          variant="secondary"
          className="w-full gap-2 sm:w-auto"
        >
          {spinner("disable") ?? <BellOffIcon className="size-4" />}
          {t("Push通知をオフにする", "Turn off push notifications")}
        </Button>
      )}
    </StatusCard>
  )
}

/**
 * 今の状態を色とアイコンで見せるカード
 */
function StatusCard(props: { status: PushStatus; children?: React.ReactNode }) {
  const t = useTranslation()

  const isIosTab =
    typeof navigator !== "undefined" &&
    isIosBrowserTab(
      navigator.userAgent,
      typeof window !== "undefined" &&
        window.matchMedia?.("(display-mode: standalone)").matches === true,
    )

  const view = (() => {
    switch (props.status) {
      case "checking":
        return {
          icon: <Loader2Icon className="size-6 animate-spin" />,
          tone: "border-border bg-muted/40 text-muted-foreground",
          title: t("確認しています…", "Checking…"),
          description: null,
        }
      case "on":
        return {
          icon: <BellRingIcon className="size-6" />,
          tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          title: t(
            "このブラウザに通知が届きます",
            "Notifications are delivered to this browser",
          ),
          description: t(
            "サイトを開いていないときや、別のタブを見ているときも届きます。",
            "You will get them even when the site is closed or in another tab.",
          ),
        }
      case "other-browser":
        return {
          icon: <MonitorSmartphoneIcon className="size-6" />,
          tone: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
          title: t(
            "別のブラウザに通知が届く設定です",
            "Notifications go to another browser",
          ),
          description: t(
            "通知が届くのは最後に設定したブラウザ1つだけです。このブラウザで受け取るには切り替えてください。",
            "Only the browser you set up last receives notifications. Switch to receive them here.",
          ),
        }
      case "off":
        return {
          icon: <BellOffIcon className="size-6" />,
          tone: "border-border bg-muted/40 text-muted-foreground",
          title: t("Push通知はオフです", "Push notifications are off"),
          description: t(
            "ボタンを押してブラウザの確認で「許可」を選ぶと、すぐにテスト通知が届きます。",
            "Press the button and choose “Allow” in the browser prompt. A test notification will arrive right away.",
          ),
        }
      case "denied":
        return {
          icon: <ShieldAlertIcon className="size-6" />,
          tone: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
          title: t(
            "ブラウザで通知がブロックされています",
            "Notifications are blocked in this browser",
          ),
          description: t(
            "アドレスバーの左にある鍵（またはサイト情報）のアイコンから「通知」を「許可」に変えて、ページを再読み込みしてください。",
            "Click the lock (site info) icon on the left of the address bar, set Notifications to Allow, then reload the page.",
          ),
        }
      case "unsupported":
        return {
          icon: <BellOffIcon className="size-6" />,
          tone: "border-border bg-muted/40 text-muted-foreground",
          title: t(
            "このブラウザではPush通知を使えません",
            "Push notifications are not available in this browser",
          ),
          description: isIosTab
            ? t(
                "iPhone・iPadのブラウザには対応していません。",
                "Browsers on iPhone and iPad are not supported.",
              )
            : t(
                "パソコンのChrome・Edge・Firefox・Safari、AndroidのChromeなどでお使いください。",
                "Please use Chrome, Edge, Firefox or Safari on a computer, or Chrome on Android.",
              ),
        }
    }
  })()

  return (
    <div className={cn("space-y-4 rounded-xl border p-4", view.tone)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{view.icon}</div>
        <div className="min-w-0 space-y-1">
          <p className="font-bold text-base text-foreground">{view.title}</p>
          {view.description && (
            <p className="text-muted-foreground text-sm leading-6">
              {view.description}
            </p>
          )}
        </div>
      </div>
      {props.children && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {props.children}
        </div>
      )}
    </div>
  )
}

const viewerWebFcmTokenQuery = graphql(
  `query ViewerWebFcmToken {
    viewer {
      id
      user {
        id
        webFcmToken
      }
    }
  }`,
)

const updateAccountWebFcmTokenMutation = graphql(
  `mutation UpdateAccountWebFcmToken($input: UpdateAccountWebFcmTokenInput!) {
    updateAccountWebFcmToken(input: $input) {
      id
    }
  }`,
)
