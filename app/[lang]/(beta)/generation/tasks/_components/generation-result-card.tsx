import { InProgressGenerationCard } from "@/app/[lang]/(beta)/generation/tasks/_components/in-progress-generation-card"
import { PrivateImage } from "@/app/_components/private-image"

type Props = {
  taskId: string
  token: string | null
  className?: string
}

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationResultCard = (props: Props) => {
  if (props.token == null) {
    return <InProgressGenerationCard />
  }

  return (
    <PrivateImage
      className={props.className}
      taskId={props.taskId}
      token={props.token}
      alt={"-"}
    />
  )
}
