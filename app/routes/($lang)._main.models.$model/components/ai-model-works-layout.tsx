import { SearchXIcon } from "lucide-react"
import type { FragmentOf } from "gql.tada"
import { Link } from "~/lib/app/locale-router"
import { Button } from "~/components/ui/button"
import {
  type PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { useTranslation } from "~/hooks/use-translation"
import type { WorkListItemFragment } from "~/routes/($lang)._main.posts._index/components/work-list"
import {
  type AiModelWorksSearch,
  toAiModelPopularTags,
  toAiModelWorksPageCount,
  toAiModelWorksQuery,
} from "~/routes/($lang)._main.models.$model/ai-model-works-page"
import {
  type AiModelGenerationInfo,
  AiModelHeader,
} from "~/routes/($lang)._main.models.$model/components/ai-model-header"
import {
  type AiModelRelatedModel,
  AiModelRelated,
} from "~/routes/($lang)._main.models.$model/components/ai-model-related"
import { AiModelDetailSection } from "~/routes/($lang)._main.models.$model/components/ai-model-detail-section"
import type { ModelDetail } from "~/lib/model-details/model-detail"
import { AiModelWorksPagination } from "~/routes/($lang)._main.models.$model/components/ai-model-works-pagination"
import { AiModelWorksToolbar } from "~/routes/($lang)._main.models.$model/components/ai-model-works-toolbar"

type Props = {
  name: string
  thumbnailImageURL: string | null
  worksCount: number
  works: FragmentOf<typeof WorkListItemFragment>[]
  search: AiModelWorksSearch
  isSensitive: boolean
  generation: AiModelGenerationInfo | null
  relatedModels: AiModelRelatedModel[]
  promptHubPath: string | null
  /** 生成機のモデルの紹介（Civitai などの情報をもとにした文） */
  detail?: ModelDetail | null
}

/**
 * モデルの作品一覧の画面（全年齢・R18 で共通）
 */
export function AiModelWorksLayout(props: Props) {
  const t = useTranslation()

  const moreRatingsKey = props.isSensitive ? "r18g" : "r15"

  const basePath = `${props.isSensitive ? "/r" : ""}/models/${encodeURIComponent(props.name)}`

  const pageCount = toAiModelWorksPageCount(props.worksCount)

  const isFiltered =
    props.search.hasPrompt ||
    props.search.isMoreRatings ||
    props.search.sort !== "new"

  // 作品がまだ無いモデルは紹介を見出しのすぐ下に、作品があるモデルは一覧の下に出す
  const isDetailFirst = props.worksCount === 0 && !isFiltered

  const detailSection = props.detail ? (
    <AiModelDetailSection
      name={props.generation?.displayName ?? props.name}
      detail={props.detail}
    />
  ) : null

  return (
    <div className="flex flex-col gap-4">
      <AiModelHeader
        name={props.name}
        thumbnailImageURL={
          props.thumbnailImageURL ??
          props.works[0]?.largeThumbnailImageURL ??
          null
        }
        worksCount={props.worksCount}
        isSensitive={props.isSensitive}
        generation={props.generation}
        promptHubPath={props.promptHubPath}
      />
      {isDetailFirst && detailSection}
      <AiModelWorksToolbar
        basePath={basePath}
        moreRatingsKey={moreRatingsKey}
        search={props.search}
        worksCount={props.worksCount}
        isSensitive={props.isSensitive}
        name={props.name}
      />
      {props.works.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
          <SearchXIcon className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            {props.worksCount > 0
              ? t("このページには作品がありません", "No works on this page")
              : isFiltered
                ? t(
                    "条件に合う作品がありません",
                    "No works match these filters",
                  )
                : t("まだ作品がありません", "No works yet")}
          </p>
          {(props.worksCount > 0 || isFiltered) && (
            <Button asChild variant="secondary" className="rounded-full">
              <Link
                to={
                  props.worksCount > 0
                    ? `${basePath}${toAiModelWorksQuery({ ...props.search, page: 0 }, moreRatingsKey)}`
                    : basePath
                }
              >
                {props.worksCount > 0
                  ? t("1ページ目へ", "Go to page 1")
                  : t("条件をリセット", "Reset filters")}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <ResponsivePhotoWorksAlbum
          works={
            props.works as unknown as FragmentOf<
              typeof PhotoAlbumWorkFragment
            >[]
          }
          targetRowHeight={240}
          size="small"
          isShowProfile={true}
          priorityCount={4}
        />
      )}
      <AiModelWorksPagination
        basePath={basePath}
        moreRatingsKey={moreRatingsKey}
        search={props.search}
        pageCount={pageCount}
      />
      {!isDetailFirst && detailSection}
      <AiModelRelated
        name={props.name}
        tags={toAiModelPopularTags(props.works, 16)}
        models={props.relatedModels}
        isSensitive={props.isSensitive}
      />
    </div>
  )
}
