"use client"
import { SmallSquareThumbnail } from "@/app/[lang]/(main)/works/[work]/_components/small-square-thumbnail"
import { WorkQuery } from "@/graphql/__generated__/graphql"

type Props = {
  work: WorkQuery["work"]
}

export const NextAndPreviousWorkList = (props: Props) => {
  if (props.work === null) return null

  if (typeof document !== "undefined") {
    document.addEventListener("keydown", (e: KeyboardEvent) =>
      keyDownHandler(e, props.work),
    )
  }

  return (
    <div>
      <h2 className="text-md py-2">{"前後の作品"}</h2>
      <div className="flex mb-4">
        <SmallSquareThumbnail work={props.work.nextWork} linkToWork={true} />
        <SmallSquareThumbnail work={props.work} isFocus={true} />
        <SmallSquareThumbnail
          work={props.work.previousWork}
          linkToWork={true}
        />
      </div>
    </div>
  )
}

function keyDownHandler(e: KeyboardEvent, work: WorkQuery["work"]): void {
  if (typeof window !== "undefined" && work !== null) {
    if (e.code === "KeyQ" && work.nextWork) {
      window.location.href = `/works/${work.nextWork.id}`
    }
    if (e.code === "KeyE" && work.previousWork) {
      window.location.href = `/works/${work.previousWork.id}`
    }
  }
}
