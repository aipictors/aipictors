import { Card, CardContent } from "~/components/ui/card"

type Props = Readonly<{
  title: string
  /** ぴくたーちゃんの一言 */
  line: string
  children: React.ReactNode
}>

/**
 * ログインの入口の枠（ログインページと、ログインが必要なページで共通）
 */
export function LoginCard (props: Props): React.ReactNode {
  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardContent className="space-y-4 p-5 md:p-6">
        <div className="group flex items-center gap-3">
          <img
            src="https://assets.aipictors.com/pictorchanicon.webp"
            alt=""
            width={56}
            height={56}
            fetchPriority="high"
            className="motion-safe:group-hover:-rotate-6 size-14 shrink-0 rounded-full border bg-white object-cover transition-transform duration-300"
          />
          <div className="min-w-0 space-y-0.5">
            <h1 className="font-bold text-xl leading-tight">{props.title}</h1>
            <p className="text-muted-foreground text-sm leading-snug">
              {props.line}
            </p>
          </div>
        </div>
        {props.children}
      </CardContent>
    </Card>
  )
}
