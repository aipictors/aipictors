import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext, useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  StickerButton,
  StickerButtonFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"

import { ResponsivePagination } from "~/components/responsive-pagination"
import { graphql } from "gql.tada"
import { AddStickerButton } from "~/routes/($lang)._main.posts.$post._index/components/add-sticker-button"
import { useTranslation } from "~/hooks/use-translation"
import { MinusIcon, PlusIcon } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose(): void
  onSend(stickerId: string, stickerImageURL: string): void
}

/**
 * クッキーの値を取得する関数
 */
function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift()
  return undefined
}

/**
 * クッキーに値を設定する関数
 */
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/`
}

/**
 * スタンプ送信ダイアログ
 */
export function StickerDialog(props: Props) {
  const appContext = useContext(AuthContext)

  const [createdSortStickerPage, setCreatedSortStickerPage] = useState(0)

  const [type, setType] = useState("CREATED")

  const maxStickersPage = 120

  const { data: stickers = null, refetch } = useQuery(viewerUserStickersQuery, {
    skip: appContext.isLoading,
    variables: {
      limit: maxStickersPage,
      offset: createdSortStickerPage * maxStickersPage,
      orderBy: "DATE_CREATED",
    },
  })

  const { data: stickersCount = null } = useQuery(
    viewerUserStickersCountQuery,
    {
      skip: appContext.isLoading,
    },
  )

  const maxCount = stickersCount?.viewer?.userStickersCount ?? 0

  const t = useTranslation()

  // サイズ設定
  const sizeOptions: Array<80 | 100 | 120> = [80, 100, 120]
  const [sizeIndex, setSizeIndex] = useState(1)

  // クッキーからサイズ設定を読み込み
  useEffect(() => {
    const savedSizeIndex = getCookie("stickerSizeIndex")
    if (savedSizeIndex !== undefined) {
      setSizeIndex(Number.parseInt(savedSizeIndex, 10))
    }
  }, [])

  // サイズ設定をクッキーに保存
  useEffect(() => {
    setCookie("stickerSizeIndex", sizeIndex.toString(), 365)
  }, [sizeIndex])

  const decreaseSize = () => {
    setSizeIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }

  const increaseSize = () => {
    setSizeIndex((prevIndex) => Math.min(prevIndex + 1, sizeOptions.length - 1))
  }

  const sizeMap = {
    80: "large",
    100: "x-large",
    120: "2x-large",
  } as const
  const stickerSize = sizeMap[sizeOptions[sizeIndex]]

  return (
    <Dialog onOpenChange={props.onClose} open={props.isOpen}>
      <DialogContent className="flex h-[80vh] min-h-[32vw] w-[80vw] min-w-[80vw] flex-col pl-2">
        <div className="flex items-center space-x-2">
          <Tabs value={type} defaultValue={"CREATED"}>
            <TabsList>
              <TabsTrigger
                onClick={() => {
                  setType("CREATED")
                }}
                className="w-full"
                value="CREATED"
              >
                {t("保存日", "Date saved")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setType("RELATED")
                }}
                className="w-full"
                value="RELATED"
              >
                {t("最近の使用", "Recently used")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center space-x-2">
            <Button size="icon" variant={"secondary"} onClick={increaseSize}>
              <PlusIcon className="w-8" />
            </Button>
            <Button size="icon" variant={"secondary"} onClick={decreaseSize}>
              <MinusIcon className="w-8" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex h-[80vh] w-[80vw] flex-wrap overflow-y-auto">
          <div className="flex h-[80vh] w-[80vw] flex-wrap overflow-y-auto">
            <AddStickerButton
              onAddedSicker={() => {
                refetch()
              }}
            />
            {stickers?.viewer?.userStickers?.map((sticker) => (
              <StickerButton
                key={sticker.id}
                imageUrl={sticker.imageUrl ?? ""}
                title={sticker.title}
                onClick={() => {
                  props.onSend(sticker.id, sticker.imageUrl ?? "")
                  props.onClose()
                }}
                size={stickerSize}
              />
            ))}
          </div>
        </ScrollArea>
        {type === "CREATED" && (
          <div className="mt-1 mb-1">
            <ResponsivePagination
              perPage={maxStickersPage}
              maxCount={maxCount}
              currentPage={createdSortStickerPage}
              onPageChange={(page: number) => {
                setCreatedSortStickerPage(page)
              }}
            />
          </div>
        )}
        <DialogFooter>
          <Button
            variant={"secondary"}
            className="m-auto w-full"
            onClick={props.onClose}
          >
            {"キャンセル"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const viewerUserStickersCountQuery = graphql(
  `query ViewerUserStickersCount($where: UserStickersWhereInput) {
    viewer {
      id
      userStickersCount(where: $where)
    }
  }`,
)

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
