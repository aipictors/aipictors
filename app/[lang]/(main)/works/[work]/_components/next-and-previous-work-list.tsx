import { SmallSquareThumbnail } from "@/app/[lang]/(main)/works/[work]/_components/small-square-thumbnail"
import { WorkNode } from "@/graphql/__generated__/graphql"

type Props = {
  work: WorkNode
}

export const NextAndPreviousWorkList = (props: Props) => {
  if (props.work === null) return null

  return (
    <div style={{ lineHeight: 2, fontSize: "17px" }}>
      <h2>{"前後の作品"}</h2>
      <div
        style={{ display: "flex", flexDirection: "row", marginBottom: "16px" }}
      >
        <SmallSquareThumbnail work={props.work.nextWork} />
        <SmallSquareThumbnail work={props.work} isFocus={true} />
        <SmallSquareThumbnail work={props.work.previousWork} />
      </div>
    </div>
  )
}
