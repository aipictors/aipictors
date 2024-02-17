import { InProgressGenerationCard } from "@/app/[lang]/generation/tasks/_components/in-progress-generation-card"
import { PrivateImage } from "@/app/_components/private-image"
import { Check } from "lucide-react"

type Props = {
  taskId: string
  taskNanoid: string | null
  token: string | null
  isSelected?: boolean
}

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationResultCard = (props: Props) => {
  if (props.token == null || props.taskNanoid == null) {
    return (
      <div className={!props.isSelected ? "" : "opacity-40"}>
        <InProgressGenerationCard />
      </div>
    )
  }

  return (
    <>
      <div className={!props.isSelected ? "" : "opacity-40"}>
        <PrivateImage
          className={`generation-image-${props.taskNanoid}`}
          taskId={props.taskId}
          token={props.token}
          alt={"-"}
        />
      </div>
      {!props.isSelected ? null : (
        <>
          <div className="absolute bg-white rounded-full right-2 bottom-2">
            <Check color="black" />
          </div>
        </>
      )}
    </>
  )
}
