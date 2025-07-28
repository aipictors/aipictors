import { AddStickerModal } from "~/routes/($lang)._main.stickers._index/components/add-sticker-modal"
import { useBoolean } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"
import { graphql } from "gql.tada"
import { StickerAccessTypeDialogFragment } from "~/routes/($lang).settings.sticker/components/my-stickers-list"
import { AddStickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/add-sticker-dialog"
import { Button } from "~/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"

type Props = {
  title?: string
}

export function StickerListHeader(props: Props) {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [stickerStatus, _setStickerStatue] = useState<
    "PRIVATE_CREATED" | "DOWNLOADED" | "PUBLIC_CREATED"
  >("DOWNLOADED")

  const { data: stickersCount = null, refetch: reactStickers } =
    useSuspenseQuery(viewerUserStickersCountQuery, {
      skip: authContext.isLoading,
      variables: {
        orderBy: "DATE_CREATED",
        where: {
          savedTypes: [stickerStatus],
        },
      },
    })

  const [createdSortStickerPage, _setCreatedSortStickerPage] = useState(0)

  const maxStickersPage = 120

  const { data: stickers = null, refetch: reactStickersCount } =
    useSuspenseQuery(viewerUserStickersQuery, {
      skip: authContext.isLoading,
      variables: {
        limit: maxStickersPage,
        offset: createdSortStickerPage * maxStickersPage,
        orderBy: "DATE_CREATED",
        where: {
          savedTypes: [stickerStatus],
        },
      },
    })

  return (
    <>
      <section className="flex flex-col gap-y-2">
        <h1 className="font-bold text-2xl">
          {t("AIイラストスタンプ広場", "AI Illustration Stamp Square")}
        </h1>
        <AddStickerDialog
          onAddedSicker={() => {
            reactStickers()
            reactStickersCount()
          }}
        >
          <Button variant={"secondary"}>
            {t("新規スタンプを作成する", "New Sticker")}
            <PlusIcon className="w-8" />
          </Button>
        </AddStickerDialog>
        {props.title && (
          <h2 className="text-bold">
            {t(
              `「${props.title}」のAIイラストのスタンプ一覧`,
              `AI illustration sticker list for "${props.title}"`,
            )}
          </h2>
        )}
        <p className="text-sm">
          {t(
            "作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！",
            "Let's share the stickers you've made, and try downloading and using the stickers made by everyone!",
          )}
        </p>
      </section>
      <AddStickerModal isOpen={isOpen} onClose={onClose} />
    </>
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
        ...StickerAccessTypeDialog
      }
    }
  }`,
  [StickerAccessTypeDialogFragment],
)
