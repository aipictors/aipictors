import { Image, Film, FileText as TextIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
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

  const handleMediaNavigation = () => {
    window.location.href = getSensitiveLink("/new/image")
  }

  const handleTextNavigation = () => {
    window.location.href = getSensitiveLink("/new/text")
  }

  const isMediaSelected =
    props.type === "image" || props.type === "animation" || props.type === "media"
  const isTextSelected = props.type === "text"

  return (
    <div className="flex w-full items-center rounded-t bg-zinc-700 dark:bg-gray-700">
      <Button
        variant="secondary"
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-t rounded-r-none rounded-b-none bg-zinc-700 text-center text-white transition duration-300 hover:bg-zinc-700 dark:bg-gray-700 dark:hover:bg-gray-600",
          isMediaSelected && "bg-zinc-500 dark:bg-gray-600",
        )}
        disabled={isMediaSelected}
        onClick={handleMediaNavigation}
      >
        <Image className="hidden md:block" size={16} />
        <Film className="hidden md:block" size={16} />
        <div className="text-center">{t("イラスト・動画", "Illustration / Video")}</div>
      </Button>
      <Button
        variant="secondary"
        className={cn(
          "flex w-full items-center space-x-4 rounded-t rounded-b-none rounded-l-none bg-zinc-700 text-center text-white transition duration-300 hover:bg-zinc-700 dark:bg-gray-700 dark:hover:bg-gray-600",
          isTextSelected && "bg-zinc-500 dark:bg-gray-600",
        )}
        disabled={isTextSelected}
        onClick={handleTextNavigation}
      >
        <TextIcon className="hidden md:block" size={16} />
        <div className="text-center">{t("小説・コラム", "Text/Column")}</div>
      </Button>
    </div>
  )
}
