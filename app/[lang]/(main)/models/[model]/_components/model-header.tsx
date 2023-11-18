"use client"

import type { ImageModelQuery } from "@/__generated__/apollo"
import { Switch } from "@/components/ui/switch"

type Props = {
  imageModelQuery: ImageModelQuery
}

export const ModelHeader = (props: Props) => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <p className="text-2xl">
          {`モデル「${props.imageModelQuery.imageModel?.name}」で生成された作品一覧`}
        </p>
      </div>
      <div className="flex">
        <p className="text-xs">{"R18作品モザイクあり"}</p>
        <Switch />
      </div>
      <div className="flex flex-col">
        <p className="text-xl">{"新着"}</p>
        <p
          className="text-xs"
          // color={"blue.400"}
        >
          {"もっと見る"}
        </p>
      </div>
    </div>
  )
}
