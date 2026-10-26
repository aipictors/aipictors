import { useMutation, useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { ClientOnly } from "remix-utils/client-only"
import { ModelLibrary } from "~/components/model-library/model-library"
import type {
  ModelLibraryItem,
  ModelLibrarySection,
} from "~/components/model-library/model-library-types"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { loaderClient } from "~/lib/loader-client"
import { createMeta } from "~/utils/create-meta"

export async function loader(_props: LoaderFunctionArgs) {
  const resp = await loaderClient.query({ query: libraryModelsQuery })
  return {
    imageModels: resp.data.imageModels,
    imageLoraModels: resp.data.imageLoraModels,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.MODEL_LIBRARY, undefined, props.params.lang)
}

const librarySections: ModelLibrarySection[] = [
  "official",
  "community",
  "mine",
  "favorites",
  "recent",
]

/**
 * 生成画面で使うためのリンク（生成画面側で選択済みにする）
 */
const toGenerationHref = (item: ModelLibraryItem): string => {
  if (item.userModel) return `/generation?userModel=${item.userModel.id}`
  if (item.officialCheckpoint) {
    return `/generation?model=${item.officialCheckpoint.id}`
  }
  if (item.officialLora) {
    return `/generation?lora=${encodeURIComponent(item.officialLora.name)}`
  }
  return "/generation"
}

/**
 * モデルライブラリ（公式・みんなのモデル・自分のモデルの管理）
 */
export default function ModelLibraryPage() {
  const data = useLoaderData<typeof loader>()
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const sectionParam = searchParams.get("section")
  const initialSection = librarySections.find((item) => item === sectionParam)

  const { data: favorites, refetch } = useQuery(viewerFavoritedModelsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [changeRatingModel] = useMutation(updateRatingModelMutation)

  const favoriteIds =
    favorites?.viewer?.favoritedImageGenerationModels.map((model) =>
      Number(model.id),
    ) ?? []

  return (
    <div className="h-[calc(100dvh-88px)] min-h-[560px] w-full overflow-hidden rounded-2xl border md:h-[calc(100dvh-104px)]">
      <ClientOnly fallback={<div className="h-full" />}>
        {() => (
          <ModelLibrary
            variant="page"
            initialSection={initialSection ?? "official"}
            officialCheckpoints={data.imageModels}
            officialLoras={data.imageLoraModels}
            favoriteOfficialIds={favoriteIds}
            onToggleFavorite={
              authContext.isLoggedIn
                ? async (modelId, isFavorite) => {
                    await changeRatingModel({
                      variables: {
                        input: { modelId, rating: isFavorite ? 1 : 0 },
                      },
                    })
                    refetch()
                  }
                : undefined
            }
            onSectionChange={(section) => {
              const next = new URLSearchParams(searchParams)
              if (section === "official") {
                next.delete("section")
              } else {
                next.set("section", section)
              }
              setSearchParams(next, {
                replace: true,
                preventScrollReset: true,
              })
            }}
            onUse={(item) => navigate(toGenerationHref(item))}
          />
        )}
      </ClientOnly>
    </div>
  )
}

const libraryModelsQuery = graphql(
  `query ModelLibraryModels {
    imageModels {
      id
      name
      displayName
      type
      thumbnailImageURL
      prompts
      isNew
      description
    }
    imageLoraModels {
      id
      name
      description
      thumbnailImageURL
      genre
      triggerWord
    }
  }`,
)

const viewerFavoritedModelsQuery = graphql(
  `query ModelLibraryFavoritedModels {
    viewer {
      id
      favoritedImageGenerationModels {
        id
      }
    }
  }`,
)

const updateRatingModelMutation = graphql(
  `mutation ModelLibraryUpdateRatingModel($input: UpdateRatingImageGenerationModelInput!) {
    updateRatingImageGenerationModel(input: $input) {
      id
      favoritedImageGenerationModelIds
    }
  }`,
)
