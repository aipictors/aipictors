import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { ModelList } from "~/routes/($lang)._main.posts._index/components/model-list"

type Props = {
  imageModels: FragmentOf<typeof imageModelCardFragment>[]
}

export function ImageModelList(props: Props) {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-md text-xl">{"モデル一覧"}</h1>
      <h2 className="text-md">{"StableDiffusionなど"}</h2>
      <ModelList />
      <h2 className="text-md">{"Aipictors生成機 - 搭載モデル一覧"}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {props.imageModels.map((imageModel) => (
          <div
            key={imageModel.id}
            className="overflow-hidden rounded-lg border shadow-lg"
          >
            <Link to={`/models/${imageModel.modelName}`}>
              <img
                src={imageModel.thumbnailImageURL ?? ""}
                alt={imageModel.displayName}
                className="h-auto w-full object-cover"
              />
            </Link>
            <p className="p-2 text-center text-sm">{imageModel.displayName}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export const imageModelCardFragment = graphql(
  `fragment ImageModelCard on ImageModelNode @_unmask {
    id
    name
    modelName
    displayName
    category
    description
    license
    prompts
    slug
    style
    thumbnailImageURL
    type
  }`,
)
