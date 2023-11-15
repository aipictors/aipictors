import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Props = {
  imageURL: string
  onClick(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationHistoryCard = (props: Props) => {
  return (
    <Card>
      <Button
        className="p-0 h-auto overflow-hidden border-2 border-blue-500 outline-none"
        onClick={props.onClick}
      >
        <img
          // src={props.imageURL}
          src="https://source.unsplash.com/random/800x600"
          alt=""
          draggable={false}
        />
      </Button>
    </Card>
  )
}
