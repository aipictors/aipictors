import { FileText, Film, Image } from "lucide-react"
import { cn } from "~/lib/utils"
import { useTranslation } from "~/hooks/use-translation"
import { useLocation } from "@remix-run/react"

type Props = {
  type: "image" | "animation" | "text" | "media"
}

export function PostFormHeader (props: Props) {
  const t = useTranslation()
  const location = useLocation()

  const sensitivePath = /\/r($|\/)/.test(location.pathname)

  const getSensitiveLink = (path: string) => {
    // Don't add /r prefix if path already starts with /r
    if (/^\/r($|\/)/.test(path)) {
      return path
    }

    if (sensitivePath) {
      return `/r${path}`
    }

    return path
  }

  const isTextSelected = props.type === "text"

  const tabs = [
    {
      href: getSensitiveLink("/new/image"),
      isSelected: !isTextSelected,
      icon: (
        <>
          <Image className="size-4" />
          <Film className="hidden size-4 md:block" />
        </>
      ),
      label: t("イラスト・動画", "Illustration / Video"),
    },
    {
      href: getSensitiveLink("/new/text"),
      isSelected: isTextSelected,
      icon: <FileText className="size-4" />,
      label: t("小説・コラム", "Text / Column"),
    },
  ]

  return (
    <div className="space-y-3">
      <h1 className="font-bold text-xl md:text-2xl">
        {t("作品を投稿", "Post your work")}
      </h1>
      {/* 入力中に別の種類へ移るときは確認を出したいので、普通のリンクで移動する */}
      <nav className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
        {tabs.map((tab) => (
          <a
            key={tab.href}
            href={tab.href}
            aria-current={tab.isSelected ? "page" : undefined}
            className={cn(
              "flex h-10 items-center justify-center gap-2 rounded-full font-medium text-sm transition-colors",
              tab.isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
