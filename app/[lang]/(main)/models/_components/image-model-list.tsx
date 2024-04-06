"use client"

import type { ImageModelsQuery } from "@/_graphql/__generated__/graphql"
import { Link } from "@remix-run/react"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
}

export const ImageModelList = (props: Props) => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <p className="text-2xl">{"モデル"}</p>
        <div className="grid-cols-1fr grid-cols-4">
          {props.imageModels.map((imageModel) => (
            <div key={imageModel.id} className="overflow-hidden">
              <Link to={`/models/${imageModel.id}`}>
                <img
                  src={imageModel.thumbnailImageURL ?? ""}
                  alt={imageModel.displayName}
                  width={"100%"}
                />
              </Link>
              <p className="text-sm">{imageModel.displayName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
