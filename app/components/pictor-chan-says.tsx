import { cn } from "~/lib/utils"

const PICTOR_CHAN_ICON_URL = "https://assets.aipictors.com/pictorchanicon.webp"

type Props = Readonly<{
  children: React.ReactNode
  className?: string
}>

/**
 * ぴくたーちゃんの一言（空の一覧やページの片隅に添える吹き出し）
 */
export function PictorChanSays (props: Props): React.ReactNode {
  return (
    <div className={cn("group flex items-start gap-2.5", props.className)}>
      <img
        src={PICTOR_CHAN_ICON_URL}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        className="motion-safe:group-hover:-rotate-6 size-10 shrink-0 rounded-full border bg-white object-cover transition-transform duration-300 motion-safe:group-hover:scale-110"
      />
      <p className="relative min-w-0 rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-left text-sm leading-relaxed">
        {props.children}
      </p>
    </div>
  )
}
