import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { AiModelHeader } from "~/routes/($lang)._main.models.$model/components/ai-model-header"
import { useContext, useEffect, useState } from "react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { useSearchParams } from "react-router";
import { WorkListItemFragment } from "~/routes/($lang)._main.posts._index/components/work-list"
import { aiModelQuery } from "~/routes/($lang)._main.models.$model/route"

type Props = {
  model: FragmentOf<typeof ModelSensitiveItemFragment>
  isMoreRatings: boolean
  hasPrompt: boolean
  page: number
}

export function AiModelSensitiveArticle(props: Props) {
  const model = readFragment(ModelSensitiveItemFragment, props.model)

  if (
    model.works === undefined ||
    model.works === null ||
    model.worksCount === 0
  ) {
    return (
      <div className="text-center">
        <p>作品がありません</p>
      </div>
    )
  }

  const authContext = useContext(AuthContext)

  const [page, setPage] = useState(props.page)

  const [searchParams, setSearchParams] = useSearchParams()

  const { data } = useQuery(aiModelQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      search: model.name,
      offset: 32 * page,
      limit: 32,
      where: {
        ratings: props.isMoreRatings ? ["R18", "R18G"] : ["R18"],
        isSensitive: false,
        hasPrompt: props.hasPrompt,
        ...(props.hasPrompt && {
          isPromptPublic: true,
        }),
      },
    },
    fetchPolicy: "cache-first",
  })

  const aiModel = readFragment(ModelSensitiveItemFragment, data?.aiModel)

  const works = aiModel?.works ?? model.works

  // URLパラメータの監視と更新
  useEffect(() => {
    setSearchParams({
      page: String(page),
      prompt: props.hasPrompt ? "1" : "0",
      r15: props.isMoreRatings ? "1" : "0",
    })
  }, [page, props.hasPrompt, props.isMoreRatings, setSearchParams])

  return (
    <div className="flex flex-col space-y-4">
      <AiModelHeader
        name={model.name}
        thumbnailImageURL={works[0]?.largeThumbnailImageURL ?? null}
        isMoreRatings={props.isMoreRatings}
        hasPrompt={props.hasPrompt}
        worksCount={model.worksCount}
      />
      <div className="space-y-4">
        <ResponsivePhotoWorksAlbum
          works={works}
          targetRowHeight={240}
          size="small"
          isShowProfile={true}
        />
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <ResponsivePagination
            perPage={16}
            maxCount={model.worksCount}
            currentPage={page}
            onPageChange={(page: number) => setPage(page)}
          />
        </div>
      </div>
    </div>
  )
}

export const ModelSensitiveItemFragment = graphql(
  `fragment ModelItem on AiModelNode {
      id
      name
      type
      worksCount
      generationModelId
      workModelId
      thumbnailImageURL
      works(offset: $offset, limit: $limit, where: $where) {
        ...WorkListItem
      }
  }`,
  [WorkListItemFragment],
)
