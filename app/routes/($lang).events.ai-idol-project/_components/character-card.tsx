import { Button } from "@/_components/ui/button"
import { Card } from "@/_components/ui/card"
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
    toast("プロンプトをコピーしました")
  }

  return (
    <>
      <div className="mt-4 h-auto max-w-80 md:max-w-96">
        <a
          href={
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
        </a>
        <Button
          onClick={onCopyPrompt}
          variant={"outline"}
          className="m-4 ml-0 font-bold text-lg"
        >
          プロンプトをコピー
        </Button>
        <a href={props.xlink} target="_blank" rel="noopener noreferrer">
          <div className="mt-2 mb-2 flex items-center">
            <RiTwitterXFill className="mr-2 h-4 w-4" />
            <p className="text-left">@{props.xlink.split("/").pop()}</p>
          </div>
        </a>
        <p className="text-left opacity-80">{props.profile}</p>
      </div>
    </>
  )
}
