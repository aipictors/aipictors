import {} from "~/components/ui/accordion"
import {} from "@dnd-kit/core"
import {} from "react"

type Props = {
  imageBase64: string
}

export const ControlThumbnailPosition = (props: Props) => {
  return (
    <>
      <div className="h-16 w-16 overflow-hidden">
        <img src={props.imageBase64} alt="thumbnail" />
      </div>
    </>
  )
}
