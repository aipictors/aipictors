import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Link } from "@remix-run/react"
import { RiTwitterXFill } from "@remixicon/react"
import { toast } from "sonner"

type Props = {
  name: string
  imageURL: string
  prompt: string
  negativePrompts: string
  profile: string
  xlink: string
}

/**
 * 作品の画像
 */
export function CharacterCard(props: Props) {
  if (!props.imageURL) {
    return null
  }

  const onCopyPrompt = () => {
    navigator.clipboard.writeText(props.prompt)
    toast("プロンプトをクリップボードにコピーしました")
  }

  const onMoveToGeneration = () => {
    window.location.href = props.negativePrompts
      ? `/generation?prompts=${props.prompt}&negativeprompts=${props.negativePrompts}`
      : `/generation?prompts=${props.prompt}`
  }

  return (
    <>
      <div className="mt-4 h-auto max-w-80 md:max-w-96">
        <Link
          to={
            props.negativePrompts
              ? `/generation?prompts=${props.prompt}&negativeprompts=${props.negativePrompts}`
              : `/generation?prompts=${props.prompt}`
          }
        >
          <p className="mt-2 mb-2 text-center font-bold">{props.name}</p>
          <Card>
            <img
              className="w-full rounded-lg object-cover transition-transform duration-300 hover:scale-105"
              alt=""
              src={props.imageURL}
            />
          </Card>
        </Link>
        <div className="flex items-center gap-x-2">
          <Button
            onClick={onCopyPrompt}
            variant={"outline"}
            className="m-4 ml-0 font-bold text-lg"
          >
            クリップボードコピー
          </Button>
          <Button
            onClick={onMoveToGeneration}
            variant={"outline"}
            className="m-4 ml-0 font-bold text-lg"
          >
            生成機で生成
          </Button>
        </div>

        <Link to={props.xlink} target="_blank" rel="noopener noreferrer">
          <div className="mt-2 mb-2 flex items-center">
            <RiTwitterXFill className="mr-2 size-4" />
            <p className="text-left">@{props.xlink.split("/").pop()}</p>
          </div>
        </Link>
        <p className="text-left opacity-80">{props.profile}</p>
      </div>
    </>
  )
}
