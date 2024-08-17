import { useNavigate } from "@remix-run/react"
import { Image } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Film, FileText as TextIcon } from "lucide-react" // 仮のアイコン、必要に応じて変更してください
import { cn } from "~/lib/cn"

type Props = {
  type: "image" | "animation" | "text"
}

export function PostFormHeader(props: Props) {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
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
        onClick={() => handleNavigation("/new/image")}
      >
        <Image size={16} />
        <div className="text-center">イラスト</div>
      </Button>
      <Button
        variant="secondary"
        className={cn(
          "flex w-full items-center space-x-4 bg-zinc-700 text-center text-white transition duration-300 hover:bg-zinc-700",
          props.type === "animation" && "bg-zinc-500",
          "rounded-t rounded-r-none rounded-b-none rounded-l-none",
        )}
        disabled={props.type === "animation"}
        onClick={() => handleNavigation("/new/animation")}
      >
        <Film size={16} />
        <div className="text-center">動画</div>
      </Button>
      <Button
        variant="secondary"
        className={cn(
          "flex w-full items-center space-x-4 bg-zinc-700 text-center text-white transition duration-300 hover:bg-zinc-700",
          props.type === "text" && "bg-zinc-500",
          "rounded-t rounded-b-none rounded-l-none",
        )}
        disabled={props.type === "text"}
        onClick={() => handleNavigation("/new/text")}
      >
        <TextIcon size={16} />
        <div className="text-center">小説・コラム</div>
      </Button>
    </div>
  )
}
