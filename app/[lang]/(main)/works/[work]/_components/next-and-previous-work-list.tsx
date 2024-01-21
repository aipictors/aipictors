import { SmallSquareThumbnail } from "@/app/[lang]/(main)/works/[work]/_components/small-square-thumbnail"
import { WorkQuery } from "@/graphql/__generated__/graphql"

type Props = {
  work: WorkQuery["work"]
}

export const NextAndPreviousWorkList = (props: Props) => {
  if (props.work === null) return null

  return (
    <div>
      <h2 className="text-md py-2">{"前後の作品"}</h2>
      <div className="flex mb-4">
        <SmallSquareThumbnail work={props.work.nextWork} />
        <SmallSquareThumbnail work={props.work} isFocus={true} />
        <SmallSquareThumbnail work={props.work.previousWork} />
      </div>
    </div>
  )
}
