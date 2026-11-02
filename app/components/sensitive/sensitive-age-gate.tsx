import { useMutation, useQuery } from "@apollo/client/index"
import { useLocation, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import {
  useContext,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { userBasicSettingQuery } from "~/routes/($lang)._main._index/components/user-navigation-queries"
import { buildAllAgesPath } from "~/routes/($lang)._main._index/utils/content-rating-path"

/** ヘッダーの切り替えと同じキー（「次回から確認しない」） */
const AGE_CONFIRMED_KEY = "ageConfirmed"
/** 「次回から確認しない」を外して「はい」を選んだときの、このタブの間だけの記憶 */
const AGE_CONFIRMED_SESSION_KEY = "ageConfirmedSession"
const AGE_CONFIRMED_EVENT = "aipictors:age-confirmed"
const GATE_ID = "r18-age-gate"

const readIsAgeConfirmed = () => {
  try {
    return (
      localStorage.getItem(AGE_CONFIRMED_KEY) === "true" ||
      sessionStorage.getItem(AGE_CONFIRMED_SESSION_KEY) === "true"
    )
  } catch {
    return false
  }
}

const subscribeAgeConfirmed = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  window.addEventListener(AGE_CONFIRMED_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(AGE_CONFIRMED_EVENT, onChange)
  }
}

/**
 * 確認済みの人に一瞬も画面を見せないよう、描画の前に隠す。
 * JavaScript の読み込みが終わる前に「はい」を押しても通れるようにする
 */
const gateScript = `(function(){var g=document.getElementById("${GATE_ID}");if(!g)return;var h=function(){g.style.display="none"};try{if(localStorage.getItem("${AGE_CONFIRMED_KEY}")==="true"||sessionStorage.getItem("${AGE_CONFIRMED_SESSION_KEY}")==="true")h()}catch(_){}var y=g.querySelector("[data-age-yes]");if(y)y.addEventListener("click",function(){try{var r=g.querySelector("[data-age-remember]");if(!r||r.checked)localStorage.setItem("${AGE_CONFIRMED_KEY}","true");else sessionStorage.setItem("${AGE_CONFIRMED_SESSION_KEY}","true");}catch(_){}h()})})()`

/**
 * R18 のページを直接開いた人への年齢確認
 *
 * サーバーの HTML に最初から入っているので、JavaScript が動く前でも作品は見えない。
 * 本文は HTML に残るので、検索エンジンは年齢確認と同じものを読める（クローラーで出し分けはしない）。
 * 未ログインは localStorage の ageConfirmed、ログイン中は表示設定（preferenceRating）で判断する
 */
export function SensitiveAgeGate(): React.ReactNode {
  const authContext = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const t = useTranslation()
  const rememberId = useId()
  const [remember, setRemember] = useState(true)

  const isAgeConfirmed = useSyncExternalStore(
    subscribeAgeConfirmed,
    readIsAgeConfirmed,
    () => false,
  )

  const { data: userSetting, error: userSettingError } = useQuery(
    userBasicSettingQuery,
    { skip: !authContext.isLoggedIn },
  )

  const [updateUserSetting, { loading: isUpdating }] = useMutation(
    updateUserPreferenceRatingMutation,
    { refetchQueries: [userBasicSettingQuery] },
  )

  const isSettingLoaded = userSetting?.userSetting != null
  const preferenceRating = userSetting?.userSetting?.preferenceRating ?? null
  const allowsR18 = preferenceRating === "R18" || preferenceRating === "R18G"

  const isConfirmed =
    authContext.isLoggedIn && isSettingLoaded && !userSettingError
      ? allowsR18
      : isAgeConfirmed

  // 表示設定で許可している人には、次からこの画面を一瞬も出さない
  useEffect(() => {
    if (authContext.isLoggedIn && allowsR18 && !isAgeConfirmed) {
      try {
        localStorage.setItem(AGE_CONFIRMED_KEY, "true")
        window.dispatchEvent(new Event(AGE_CONFIRMED_EVENT))
      } catch {
        // 保存できなくても、表示設定で判断するので問題ない
      }
    }
  }, [authContext.isLoggedIn, allowsR18, isAgeConfirmed])

  useEffect(() => {
    if (isConfirmed) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [isConfirmed])

  if (isConfirmed) {
    return null
  }

  const onConfirm = async () => {
    if (authContext.isLoggedIn && !allowsR18) {
      try {
        await updateUserSetting({
          variables: { input: { preferenceRating: "R18" } },
        })
      } catch {
        toast(t("設定を変更できませんでした", "Could not update the setting"))
        return
      }
    }
    try {
      if (remember) {
        localStorage.setItem(AGE_CONFIRMED_KEY, "true")
      } else {
        sessionStorage.setItem(AGE_CONFIRMED_SESSION_KEY, "true")
      }
    } catch {
      // 保存できない環境では、次のページでもう一度確認する
    }
    window.dispatchEvent(new Event(AGE_CONFIRMED_EVENT))
  }

  const onDecline = () => {
    navigate(buildAllAgesPath(location.pathname, ""))
  }

  return (
    <>
      <div
        id={GATE_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${GATE_ID}-title`}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4"
        suppressHydrationWarning
      >
        <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-lg">
          <p id={`${GATE_ID}-title`} className="font-bold text-lg">
            {t("年齢の確認", "Age confirmation")}
          </p>
          <p className="text-sm">
            {t(
              "このページには成人向けのAIイラストが含まれ、18歳以上の方のみご覧いただけます。あなたは18歳以上ですか？",
              "This page contains adult AI illustrations and is only for people aged 18 or older. Are you 18 or older?",
            )}
          </p>
          {authContext.isLoggedIn && !allowsR18 ? (
            <p className="text-muted-foreground text-xs">
              {t(
                "「はい」を選ぶと、アカウントの表示設定でR18作品が見られるようになります（設定 > 表示コンテンツでいつでも戻せます）。",
                'Choosing "Yes" turns on R18 works in your display settings. You can change it any time.',
              )}
            </p>
          ) : (
            <label
              htmlFor={rememberId}
              className="flex items-center gap-2 text-muted-foreground text-xs"
            >
              <input
                id={rememberId}
                type="checkbox"
                data-age-remember=""
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="size-4 rounded border-input"
              />
              {t("次回から確認しない", "Don't ask again")}
            </label>
          )}
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="button"
              data-age-yes=""
              className="w-full sm:flex-1"
              onClick={onConfirm}
              disabled={isUpdating}
            >
              {isUpdating && (
                <Loader2Icon className="mr-1 size-4 animate-spin" />
              )}
              {t("はい（18歳以上）", "Yes, I'm 18+")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:flex-1"
              onClick={onDecline}
            >
              {t("いいえ（全年齢へ）", "No, go to all ages")}
            </Button>
          </div>
        </div>
      </div>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: 固定の短いスクリプト
        dangerouslySetInnerHTML={{ __html: gateScript }}
      />
    </>
  )
}

const updateUserPreferenceRatingMutation = graphql(`
  mutation UpdateUserPreferenceRatingFromAgeGate($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      preferenceRating
    }
  }
`)
