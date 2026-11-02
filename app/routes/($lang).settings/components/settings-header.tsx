import { Link } from "@remix-run/react"
import { ChevronLeftIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  title: string
}

/**
 * スマホの設定画面の見出し（PC は左のメニューと見出しがあるので、各ページで隠している）
 */
export function SettingsHeader(props: Props) {
  const t = useTranslation()

  return (
    <div className="relative flex h-12 items-center border-b">
      <Link
        to="/settings"
        aria-label={t("設定へ戻る", "Back to settings")}
        className="-ml-1 flex size-11 items-center justify-center rounded-full hover:bg-muted"
      >
        <ChevronLeftIcon className="size-5" />
      </Link>
      <h1 className="pointer-events-none absolute inset-x-12 truncate text-center font-bold">
        {props.title}
      </h1>
    </div>
  )
}
