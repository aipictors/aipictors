"use client"

import type { ImageModelsQuery } from "@/__generated__/apollo"
import Link from "next/link"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
}

export const ImageModelList = (props: Props) => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <p className="text-2xl">{"モデル"}</p>
        <div className="grid-cols-4 grid-cols-1fr">
          {props.imageModels.map((imageModel) => (
            <div key={imageModel.id} className="overflow-hidden">
              <Link href={`/models/${imageModel.id}`}>
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
