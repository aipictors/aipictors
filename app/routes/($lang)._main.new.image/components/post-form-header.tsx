import { Image, Film, FileText as TextIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  type: "image" | "animation" | "text"
}

export function PostFormHeader(props: Props) {
  const t = useTranslation()

  const handleImageNavigation = () => {
    window.location.href = "/new/image"
  }

  const handleAnimationNavigation = () => {
    window.location.href = "/new/animation"
  }

  const handleTextNavigation = () => {
    window.location.href = "/new/text"
  }

  return (
    <div className="flex w-full items-center rounded-t bg-zinc-700">
      <Button
        variant="secondary"
        className={cn(
          "flex w-full items-center space-x-4 rounded-t bg-zinc-700 text-center text-white transition duration-300 hover:bg-zinc-700",
          props.type === "image" && "bg-zinc-500",
          "rounded-t rounded-r-none rounded-b-none",
        )}
        disabled={props.type === "image"}
        onClick={handleImageNavigation}
      >
        <Image className="hidden md:block" size={16} />
        <div className="text-center">{t("イラスト", "Illustration")}</div>
      </Button>
      <Button
        variant="secondary"
        className={cn(
          "flex w-full items-center space-x-4 bg-zinc-700 text-center text-white transition duration-300 hover:bg-zinc-700",
          props.type === "animation" && "bg-zinc-500",
          "rounded-t rounded-r-none rounded-b-none rounded-l-none",
        )}
        disabled={props.type === "animation"}
        onClick={handleAnimationNavigation}
      >
        <Film className="hidden md:block" size={16} />
        <div className="text-center">{t("動画", "Animation")}</div>
      </Button>
      <Button
        variant="secondary"
        className={cn(
          "flex w-full items-center space-x-4 bg-zinc-700 text-center text-white transition duration-300 hover:bg-zinc-700",
          props.type === "text" && "bg-zinc-500",
          "rounded-t rounded-b-none rounded-l-none",
        )}
        disabled={props.type === "text"}
        onClick={handleTextNavigation}
      >
        <TextIcon className="hidden md:block" size={16} />
        <div className="text-center">{t("小説・コラム", "Text/Column")}</div>
      </Button>
    </div>
  )
}
