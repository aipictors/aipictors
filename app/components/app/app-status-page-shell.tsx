import { useTranslation } from "~/hooks/use-translation"

type Props = Readonly<{
  /** 言語付きのトップのパス */
  homePath: string
  /** root の ErrorBoundary から出すとき（共通レイアウトがないので外枠も出す） */
  standalone?: boolean
  children: React.ReactNode
}>

/**
 * 404・500 の外枠。
 * どこかが壊れていても出せるよう、データの取得も共通レイアウトも使わず、
 * リンクは普通の a（ページごと読み直す）にしている
 */
export function AppStatusPageShell (props: Props): React.ReactNode {
  const t = useTranslation()

  if (props.standalone !== true) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-8 md:py-12">
        {props.children}
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex h-14 items-center border-b px-4">
        <a
          href={props.homePath}
          className="inline-flex min-h-11 items-center gap-2 font-bold text-lg"
        >
          <img
            src="/icon.svg"
            alt=""
            width={28}
            height={28}
            style={{ width: 28, height: 28 }}
          />
          Aipictors
        </a>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 px-4 py-8 md:py-12">
        {props.children}
      </main>
      <footer className="border-t px-4 py-4 text-center text-muted-foreground text-xs">
        {t(
          "Aipictors - AIイラスト・AIフォト投稿サイト",
          "Aipictors - AI illustration and photo community",
        )}
      </footer>
    </div>
  )
}
