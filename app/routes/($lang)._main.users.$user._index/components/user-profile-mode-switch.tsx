import { ChevronRightIcon, SparklesIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"

type Props = {
  login: string
  /** 今見ているページ（全年齢 /users/:id か R18 /r/users/:id か） */
  mode: "all" | "r18"
  r18WorksCount: number
  /** R18 のページだけに出すヘッダー・紹介・リンクを登録しているか */
  hasSensitiveProfile: boolean
  isMyPage: boolean
}

/** 案内カードを閉じたことを覚えるキー */
const PROMPT_DISMISSED_KEY = "user-r18-profile-prompt-dismissed"

/**
 * プロフィールの「全年齢 / R18」の切り替え
 * R18 の作品や R18 用のプロフィールがあることが一目でわかるように、タブのような大きさで出す
 * （以前は統計の下の小さな「R18（99+）」だけで、気づかれにくかった）
 */
export function UserProfileModeSwitch(props: Props) {
  const t = useTranslation()
  const isR18 = props.mode === "r18"
  const countText =
    props.r18WorksCount >= 100 ? "99+" : String(props.r18WorksCount)

  // R18 の作品がなく R18 のページでもなければ出さない
  if (props.r18WorksCount === 0 && !isR18) return null

  const caption = isR18
    ? props.hasSensitiveProfile
      ? t("R18 専用のプロフィールを表示中", "Showing the R18 profile")
      : t("R18 の作品を表示中", "Showing R18 works")
    : props.hasSensitiveProfile
      ? t(
          "R18 専用のプロフィール（紹介・リンク）があります",
          "Has an R18-only profile (bio and links)",
        )
      : t(
          `R18 の作品 ${countText} 件は R18 のページで見られます`,
          `${countText} R18 works on the R18 page`,
        )

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <SensitiveToggle
          targetUrl={
            isR18 ? `/users/${props.login}` : `/r/users/${props.login}`
          }
          renderTrigger={({ onToggle }) => (
            <div
              role="tablist"
              aria-label={t("プロフィールの切り替え", "Profile mode")}
              className="grid h-12 w-full grid-cols-2 gap-1 rounded-full bg-muted p-1 md:w-[380px]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isR18}
                onClick={isR18 ? onToggle : undefined}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-full font-bold text-sm transition-all",
                  isR18
                    ? "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    : "bg-background text-foreground shadow-sm",
                )}
              >
                {t("全年齢", "All ages")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isR18}
                onClick={isR18 ? undefined : onToggle}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 rounded-full font-bold text-sm transition-all",
                  isR18
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30"
                    : "text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
                )}
              >
                {props.hasSensitiveProfile && (
                  <SparklesIcon className="size-3.5" />
                )}
                R18
                {props.r18WorksCount > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 font-bold text-[11px] tabular-nums leading-none",
                      isR18
                        ? "bg-white/25 text-white"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-300",
                    )}
                  >
                    {countText}
                  </span>
                )}
              </button>
            </div>
          )}
        />
        <p
          className={cn(
            "flex items-center gap-1.5 px-2 text-xs md:px-0",
            props.hasSensitiveProfile
              ? "font-medium text-rose-600 dark:text-rose-400"
              : "text-muted-foreground",
          )}
        >
          {props.hasSensitiveProfile && (
            <SparklesIcon className="size-3.5 shrink-0" />
          )}
          <span>{caption}</span>
          {props.isMyPage && props.hasSensitiveProfile && (
            <Link
              to="/settings/profile#r18-profile"
              className="ml-1 shrink-0 text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {t("編集", "Edit")}
            </Link>
          )}
        </p>
      </div>
      {props.isMyPage &&
        !props.hasSensitiveProfile &&
        props.r18WorksCount > 0 && <SensitiveProfilePrompt />}
    </div>
  )
}

/**
 * 投稿者本人に、R18 のページだけのプロフィールを作れることを伝える
 */
function SensitiveProfilePrompt() {
  const t = useTranslation()
  // 閉じたかどうかは端末に覚える（サーバーでは出さず、読んでから出す）
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      setIsVisible(localStorage.getItem(PROMPT_DISMISSED_KEY) === null)
    } catch {
      setIsVisible(true)
    }
  }, [])

  if (!isVisible) return null

  const onDismiss = () => {
    setIsVisible(false)
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, "1")
    } catch {
      // 保存できなくても閉じるだけ
    }
  }

  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 pr-10 md:flex-row md:items-center md:gap-4 dark:border-rose-900/60 dark:from-rose-950/40 dark:to-pink-950/30">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm">
          <SparklesIcon className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="font-bold text-sm">
            {t(
              "R18 専用のプロフィールを作れます",
              "Create an R18-only profile",
            )}
          </p>
          <p className="text-muted-foreground text-xs leading-5">
            {t(
              "R18 のページだけに、別のヘッダー画像・紹介文・Fantia / FANBOX / FANZA などのリンクを出せます。全年齢のページには出ません。",
              "Show a different header, bio and links (Fantia, FANBOX, FANZA...) only on your R18 page. They never appear on the all-ages page.",
            )}
          </p>
        </div>
      </div>
      <Button
        asChild
        className="h-10 shrink-0 gap-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 font-bold text-white hover:from-rose-600 hover:to-pink-600"
      >
        <Link to="/settings/profile#r18-profile">
          {t("R18 のプロフィールを作る", "Set up R18 profile")}
          <ChevronRightIcon className="size-4" />
        </Link>
      </Button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("閉じる", "Close")}
        className="absolute top-2 right-2 rounded-full p-1.5 text-muted-foreground hover:bg-background/60 hover:text-foreground"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}
