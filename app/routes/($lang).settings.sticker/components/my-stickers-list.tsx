import { RoundedLightButton } from "~/components/button/rounded-light-button"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { StickerButton } from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useState, useContext } from "react"
import { toast } from "sonner"
import { AddStickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/add-sticker-dialog"
import { useTranslation } from "~/hooks/use-translation" // 翻訳フックをインポート
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog"
import { StickerChangeAccessTypeActionDialog } from "~/routes/($lang).settings.sticker/components/sticker-change-access-type-action-dialog"
import { PlusIcon } from "lucide-react"

export function MyStickersList() {
  const authContext = useContext(AuthContext)
  const t = useTranslation() // 翻訳フックの使用

  const [createdSortStickerPage, setCreatedSortStickerPage] = useState(0)

  const [stickerStatus, setStickerStatue] = useState<
    "PRIVATE_CREATED" | "DOWNLOADED" | "PUBLIC_CREATED"
  >("DOWNLOADED")

  const maxStickersPage = 120

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

  const maxCount = stickersCount?.viewer?.userStickersCount ?? 0

  const [deleteUserSticker, { loading: isDeletingUserSticker }] = useMutation(
    deleteUserStickerMutation,
  )

  const onDelete = async (stickerId: string) => {
    if (isDeletingUserSticker) {
      return
    }

    try {
      await deleteUserSticker({
        variables: {
          input: {
            stickerId,
          },
        },
      })
      toast(t("スタンプを削除しました", "Sticker deleted"))
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          error.message ??
            t("スタンプの削除に失敗しました", "Failed to delete sticker"),
        )
      } else {
        toast.error(
          t("スタンプの削除に失敗しました", "Failed to delete sticker"),
        )
      }
    } finally {
      reactStickers()
      reactStickersCount()
    }
  }

  const onAccessTypeChange = () => {
    reactStickers()
    reactStickersCount()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Link to="/stickers">
          <Button variant={"secondary"}>
            {t("スタンプ広場", "Sticker Plaza")}
          </Button>
        </Link>
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
      </div>
      <div className="flex space-x-2">
        <RoundedLightButton
          onClick={() => {
            setStickerStatue("DOWNLOADED")
            setCreatedSortStickerPage(0)
          }}
          isActive={stickerStatus === "DOWNLOADED"}
        >
          {t("マイスタンプ", "My Stickers")}
        </RoundedLightButton>
        <RoundedLightButton
          onClick={() => {
            setStickerStatue("PRIVATE_CREATED")
            setCreatedSortStickerPage(0)
          }}
          isActive={stickerStatus === "PRIVATE_CREATED"}
        >
          {t("作成(非公開)", "Created (Private)")}
        </RoundedLightButton>
        <RoundedLightButton
          onClick={() => {
            setStickerStatue("PUBLIC_CREATED")
            setCreatedSortStickerPage(0)
          }}
          isActive={stickerStatus === "PUBLIC_CREATED"}
        >
          {t("作成(公開)", "Created (Public)")}
        </RoundedLightButton>
      </div>
      <div className="m-auto flex max-h-[64vh] max-w-[88vw] flex-wrap items-center">
        {stickers?.viewer?.userStickers?.map((sticker) =>
          stickerStatus !== "DOWNLOADED" ? (
            <Dialog key={sticker.id}>
              <DialogTrigger asChild>
                <StickerButton
                  key={sticker.id}
                  imageUrl={sticker.imageUrl ?? ""}
                  title={sticker.title}
                  onClick={() => {}}
                  onDelete={() => {
                    onDelete(sticker.id)
                  }}
                />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t("タイトル：", "Title:")}
                    {sticker.title}
                  </DialogTitle>
                </DialogHeader>
                {sticker.accessType === "PRIVATE" ? (
                  <img
                    className="m-auto mb-2 w-24 duration-500"
                    src={sticker.imageUrl ?? ""}
                    alt={sticker.title}
                  />
                ) : (
                  <Link className="m-auto w-24" to={`/stickers/${sticker.id}`}>
                    <img
                      className="m-auto mb-2 w-24 cursor-pointer duration-500 hover:scale-105"
                      src={sticker.imageUrl ?? ""}
                      alt={sticker.title}
                    />
                  </Link>
                )}
                <DialogFooter>
                  {sticker.accessType === "PRIVATE" ? (
                    <StickerChangeAccessTypeActionDialog
                      title={sticker.title}
                      stickerId={sticker.id}
                      imageUrl={sticker.imageUrl ?? ""}
                      accessType={sticker.accessType}
                      onAccessTypeChange={onAccessTypeChange}
                    >
                      <Button className="w-full">
                        {t("公開する", "Make Public")}
                      </Button>
                    </StickerChangeAccessTypeActionDialog>
                  ) : (
                    <Button disabled={true} className="w-full">
                      {t("公開済み", "Already Public")}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <StickerButton
              key={sticker.id}
              imageUrl={sticker.imageUrl ?? ""}
              title={sticker.title}
              onClick={() => {}}
              onDelete={() => {
                onDelete(sticker.id)
              }}
            />
          ),
        )}
      </div>
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
    </div>
  )
}

const deleteUserStickerMutation = graphql(
  `mutation DeleteUserSticker($input: DeleteUserStickerInput!) {
    deleteUserSticker(input: $input) {
      id
    }
  }`,
)

export const StickerAccessTypeDialogFragment = graphql(
  `fragment StickerAccessTypeDialog on StickerNode @_unmask {
    id
    title
    imageUrl
    accessType
  }`,
)

const _updateStickerMutation = graphql(
  `mutation updateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
    }
  }`,
)

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
