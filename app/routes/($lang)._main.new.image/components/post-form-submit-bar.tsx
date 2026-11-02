import { CheckIcon, CircleIcon, Loader2Icon } from "lucide-react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  /** 投稿に必要なもの。入力が済んだものにチェックが付く */
  requirements: { label: string; isDone: boolean }[]
  isNotLoggedIn: boolean
  isLoading: boolean
  isDisabled: boolean
  onSubmit: () => void
}

/**
 * 画面の下に固定する投稿ボタン。あと何を入れれば投稿できるかを横に出す
 */
export function PostFormSubmitBar(props: Props) {
  const t = useTranslation()

  return (
    <>
      {/* 固定のバーにフォームの最後が隠れないように */}
      <div className="h-16" />
      <div className="fixed right-0 bottom-0 left-0 z-30 border-t bg-background/95 backdrop-blur md:left-[232px]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <ul className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
            {props.requirements.map((requirement) => (
              <li
                key={requirement.label}
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap",
                  requirement.isDone
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {requirement.isDone ? (
                  <CheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <CircleIcon className="size-3" />
                )}
                {requirement.label}
              </li>
            ))}
          </ul>
          {props.isNotLoggedIn ? (
            <LoginDialogButton
              className="h-11 shrink-0 rounded-full px-6 font-bold"
              label={t("ログインして投稿", "Log in to post")}
            />
          ) : (
            <Button
              type="submit"
              className="h-11 min-w-32 shrink-0 rounded-full px-6 font-bold"
              disabled={props.isDisabled || props.isLoading}
              onClick={props.onSubmit}
            >
              {props.isLoading && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              {t("投稿する", "Post")}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
