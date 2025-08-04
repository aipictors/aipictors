import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  StickerButton,
  StickerButtonFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext, useState, useEffect } from "react"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { ChevronDownIcon, ChevronUpIcon, StampIcon } from "lucide-react"
import { cn } from "~/lib/utils"

type Props = {
  onStickerClick?: (stickerId: string, stickerImageURL: string) => void
  className?: string
}

/**
 * 常に表示されるスタンプパネル
 * アイコンメニューを押さなくてもスタンプ一覧が見えるコンポーネント
 */
export function PersistentStickerPanel(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const [isExpanded, setIsExpanded] = useState(false)
  const [stickerPage, setStickerPage] = useState(0)

  const maxStickersPage = 20 // 一度に表示するスタンプ数を制限

  const { data: stickers, refetch } = useQuery(viewerUserStickersQuery, {
    skip: authContext.isNotLoggedIn, // ログインしていない場合のみスキップ
    variables: {
      limit: maxStickersPage,
      offset: stickerPage * maxStickersPage,
      orderBy: "DATE_CREATED",
    },
  })

  // ログイン状態が変わったらリフェッチ
  useEffect(() => {
    if (authContext.login && !authContext.isLoading) {
      refetch()
    }
  }, [authContext.login, authContext.isLoading, refetch])

  // ログインしていない場合は表示しない
  if (authContext.isNotLoggedIn) {
    return null
  }

  // データがない場合は表示しない
  const userStickers = stickers?.viewer?.userStickers ?? []
  if (userStickers.length === 0) {
    return null
  }

  const handleStickerClick = (stickerId: string, imageUrl: string) => {
    if (props.onStickerClick) {
      props.onStickerClick(stickerId, imageUrl)
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-30 w-80 rounded-lg border bg-background/95 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/60",
        props.className,
      )}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center space-x-2">
          <StampIcon className="h-5 w-5" />
          <span className="font-medium text-sm">
            {t("マイスタンプ", "My Stickers")}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronUpIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* スタンプ一覧 */}
      {isExpanded && (
        <div className="p-3">
          <ScrollArea className="h-48">
            <div className="grid grid-cols-4 gap-2">
              {userStickers.map((sticker) => (
                <StickerButton
                  key={sticker.id}
                  imageUrl={sticker.imageUrl ?? ""}
                  title={sticker.title}
                  onClick={() =>
                    handleStickerClick(sticker.id, sticker.imageUrl ?? "")
                  }
                  size="small"
                />
              ))}
            </div>
          </ScrollArea>

          {/* ページネーション */}
          {userStickers.length === maxStickersPage && (
            <div className="mt-2 flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStickerPage(Math.max(0, stickerPage - 1))}
                disabled={stickerPage === 0}
              >
                {t("前", "Previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStickerPage(stickerPage + 1)}
              >
                {t("次", "Next")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 折りたたみ時の簡易表示 */}
      {!isExpanded && userStickers.length > 0 && (
        <div className="flex items-center justify-center p-2">
          <div className="flex space-x-1">
            {userStickers.slice(0, 3).map((sticker) => (
              <img
                key={sticker.id}
                src={sticker.imageUrl ?? ""}
                alt={sticker.title}
                className="h-8 w-8 cursor-pointer rounded border transition-transform hover:scale-110"
                onClick={() =>
                  handleStickerClick(sticker.id, sticker.imageUrl ?? "")
                }
              />
            ))}
            {userStickers.length > 3 && (
              <div className="flex h-8 w-8 items-center justify-center rounded border bg-muted text-xs">
                +{userStickers.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const viewerUserStickersQuery = graphql(
  `query ViewerUserStickers($offset: Int!, $limit: Int!, $orderBy: StickerOrderBy, $where: UserStickersWhereInput) {
    viewer {
      id
      userStickers(offset: $offset, limit: $limit, orderBy: $orderBy, where: $where) {
        ...StickerButton
      }
    }
  }`,
  [StickerButtonFragment],
)
