import { useMutation, useQuery } from "@apollo/client/index"
import { useLocation } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
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
import { writeContentMode } from "~/utils/content-mode"
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
    // /r を開いた時点で R18 を覚えているので、戻さないと全年齢のページから /r へ引き戻される
    writeContentMode("all")
  }

  return (
    <>
      <div
        id={GATE_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${GATE_ID}-title`}
        aria-describedby={`${GATE_ID}-desc`}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4"
        suppressHydrationWarning
      >
        <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-lg">
          <p id={`${GATE_ID}-title`} className="font-bold text-lg">
            {t("年齢の確認", "Age confirmation")}
          </p>
          <div id={`${GATE_ID}-desc`} className="space-y-2 text-sm">
            {/* 外から直接来た人は何のサイトか分からないまま確認を求められるので、一言添える */}
            <p className="text-muted-foreground">
              {t(
                "Aipictors は AI で作ったイラストの投稿・生成サイトです。",
                "Aipictors is a site for sharing and generating AI illustrations.",
              )}
            </p>
            <p>
              {t(
                "このページは18歳以上向けの作品を含みます。あなたは18歳以上ですか？",
                "This page contains works for adults (18+). Are you 18 or older?",
              )}
            </p>
          </div>
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
          <div className="flex flex-col items-center gap-3">
            <Button
              type="button"
              data-age-yes=""
              className="h-12 w-full font-bold text-base"
              onClick={onConfirm}
              disabled={isUpdating}
            >
              {isUpdating && (
                <Loader2Icon className="mr-1 size-4 animate-spin" />
              )}
              {t("はい（18歳以上）", "Yes, I'm 18+")}
            </Button>
            {/* リンクなので JavaScript の読み込み前でも全年齢のページへ移れる */}
            <Link
              to={buildAllAgesPath(location.pathname, "")}
              onClick={onDecline}
              className="inline-flex min-h-11 items-center px-3 text-muted-foreground text-sm underline-offset-4 hover:underline"
            >
              {t("いいえ（全年齢のページへ）", "No, go to all-ages pages")}
            </Link>
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
