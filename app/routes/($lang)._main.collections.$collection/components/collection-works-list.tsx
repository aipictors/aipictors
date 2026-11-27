import { useSearchParams } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { FolderOpenIcon } from "lucide-react"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { COLLECTION_WORKS_PER_PAGE } from "~/routes/($lang)._main.collections.$collection/collection-page-utils"

type Props = {
  works: FragmentOf<typeof CollectionWorkListItemFragment>[]
  /** 0 始まりのページ番号（URL の ?page= と同じ） */
  page: number
  maxCount: number
  isOwner: boolean
}

/**
 * コレクションの作品の一覧
 * ページは URL（?page=）だけで持つ（以前は state と URL を二重に持ち、開くたびに ?page=0 の履歴が増えて戻るボタンが効かなかった）
 */
export function CollectionWorkList(props: Props) {
  const t = useTranslation()
  const [, setSearchParams] = useSearchParams()

  if (props.maxCount === 0 || props.works.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-16 text-center">
        <FolderOpenIcon className="size-8 text-muted-foreground" />
        <p className="font-bold text-sm">
          {props.page > 0
            ? t("このページに作品はありません", "No works on this page")
            : t(
                "このコレクションにはまだ作品がありません",
                "This collection has no works yet",
              )}
        </p>
        {props.page > 0 ? (
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => setSearchParams({})}
          >
            {t("最初のページへ", "Go to the first page")}
          </Button>
        ) : (
          props.isOwner && (
            <p className="text-muted-foreground text-xs">
              {t(
                "作品ページのフォルダのボタンから作品を追加できます",
                "Add works with the folder button on a work page",
              )}
            </p>
          )
        )}
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <ResponsivePhotoWorksAlbum
        works={props.works}
        targetRowHeight={240}
        size="large"
        isShowProfile={true}
      />
      {props.maxCount > COLLECTION_WORKS_PER_PAGE && (
        <div className="flex justify-center">
          <ResponsivePagination
            perPage={COLLECTION_WORKS_PER_PAGE}
            maxCount={props.maxCount}
            currentPage={props.page}
            onPageChange={(page: number) => {
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev)
                  if (page === 0) {
                    next.delete("page")
                  } else {
                    next.set("page", String(page))
                  }
                  return next
                },
                { preventScrollReset: true },
              )
            }}
          />
        </div>
      )}
    </section>
  )
}

export const CollectionWorkListItemFragment = graphql(
  `fragment CollectionWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)
