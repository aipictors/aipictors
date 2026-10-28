import { useMutation, useQuery } from "@apollo/client/index"
import { useLocation, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useContext, useEffect, useId, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { userBasicSettingQuery } from "~/routes/($lang)._main._index/components/user-navigation-queries"
import {
  buildAllAgesPath,
  buildSensitiveHomePath,
  getLocalePrefix,
} from "~/routes/($lang)._main._index/utils/content-rating-path"

const HIDE_KEY = "hideR18Button"
const AGE_CONFIRMED_KEY = "ageConfirmed"

/**
 * ヘッダーの「全年齢 / R18」の切り替え
 * 今どちらを見ているかが一目で分かるよう、2 つの区切りボタンで出す（色は控えめ）
 * R18 に切り替えるときだけ年齢を確認する（ログイン中で表示設定が R18 でなければ、その場で設定も変える）
 */
export function HomeHeaderContentToggle(props: { className?: string }) {
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const t = useTranslation()
  const rememberId = useId()

  const [isHidden, setIsHidden] = useState(false)
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [remember, setRemember] = useState(true)

  useEffect(() => {
    setIsHidden(localStorage.getItem(HIDE_KEY) === "true")
    setIsAgeConfirmed(localStorage.getItem(AGE_CONFIRMED_KEY) === "true")
  }, [])

  const { data: userSetting } = useQuery(userBasicSettingQuery, {
    skip: !authContext.isLoggedIn,
  })

  const [updateUserSetting, { loading: isUpdating }] = useMutation(
    updateUserPreferenceRatingMutation,
    { refetchQueries: [userBasicSettingQuery] },
  )

  const preferenceRating = userSetting?.userSetting?.preferenceRating ?? null
  const allowsR18 = preferenceRating === "R18" || preferenceRating === "R18G"

  const localePrefix = getLocalePrefix(location.pathname)
  const pathWithoutLocale = location.pathname.slice(localePrefix.length) || "/"
  const isR18 = /^\/r(?:\/|$)/.test(pathWithoutLocale)

  // R18 のページを見ているときは、非表示にしていても戻れるように出す
  if (isHidden && !isR18) {
    return null
  }

  const goR18 = () => {
    navigate(buildSensitiveHomePath(location.pathname, location.search))
  }

  const goAllAges = () => {
    if (!isR18) return
    navigate(buildAllAgesPath(location.pathname, location.search))
  }

  const onClickR18 = () => {
    if (isR18) return
    if (authContext.isLoggedIn) {
      if (allowsR18) {
        goR18()
        return
      }
      setIsDialogOpen(true)
      return
    }
    if (isAgeConfirmed) {
      goR18()
      return
    }
    setIsDialogOpen(true)
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
    if (remember) {
      localStorage.setItem(AGE_CONFIRMED_KEY, "true")
      setIsAgeConfirmed(true)
    }
    setIsDialogOpen(false)
    goR18()
  }

  const onHide = () => {
    localStorage.setItem(HIDE_KEY, "true")
    setIsHidden(true)
    setIsDialogOpen(false)
    toast(
      t(
        "切り替えを非表示にしました（設定 > 表示コンテンツから戻せます）",
        "Hidden. You can show it again from settings.",
      ),
    )
  }

  const segment = (isActive: boolean) =>
    cn(
      "flex h-7 items-center rounded-full px-2 font-medium text-xs transition-colors md:px-3",
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
    )

  return (
    <>
      <fieldset
        aria-label={t("表示する作品の対象年齢", "Content rating")}
        title={t(
          "表示する作品の対象年齢を切り替えます",
          "Switch the content rating",
        )}
        className={cn(
          "m-0 flex shrink-0 items-center rounded-full border-0 bg-muted p-0.5",
          props.className,
        )}
      >
        <button
          type="button"
          aria-pressed={!isR18}
          className={segment(!isR18)}
          onClick={goAllAges}
        >
          {t("全年齢", "All ages")}
        </button>
        <button
          type="button"
          aria-pressed={isR18}
          className={segment(isR18)}
          onClick={onClickR18}
        >
          R18
        </button>
      </fieldset>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("R18作品の表示", "Show R18 works")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  {t(
                    "R18の作品は18歳以上の方のみご覧いただけます。あなたは18歳以上ですか？",
                    "R18 works are only for people aged 18 or older. Are you 18 or older?",
                  )}
                </p>
                {authContext.isLoggedIn && !allowsR18 && (
                  <p className="text-muted-foreground text-xs">
                    {t(
                      "「はい」を選ぶと、アカウントの表示設定でR18作品が見られるようになります（設定 > 表示コンテンツでいつでも戻せます）。",
                      'Choosing "Yes" turns on R18 works in your display settings. You can change it any time.',
                    )}
                  </p>
                )}
                {!authContext.isLoggedIn && (
                  <label
                    htmlFor={rememberId}
                    className="flex items-center gap-2 text-muted-foreground text-xs"
                  >
                    <input
                      id={rememberId}
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="size-4 rounded border-input"
                    />
                    {t("次回から確認しない", "Don't ask again")}
                  </label>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t("いいえ", "No")}</AlertDialogCancel>
            <Button onClick={onConfirm} disabled={isUpdating}>
              {isUpdating && (
                <Loader2Icon className="mr-1 size-4 animate-spin" />
              )}
              {t("はい（18歳以上）", "Yes, I'm 18+")}
            </Button>
          </AlertDialogFooter>
          <button
            type="button"
            onClick={onHide}
            className="justify-self-start text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            {t("この切り替えをヘッダーに表示しない", "Hide this switch")}
          </button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const updateUserPreferenceRatingMutation = graphql(`
  mutation UpdateUserPreferenceRating($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      preferenceRating
    }
  }
`)
