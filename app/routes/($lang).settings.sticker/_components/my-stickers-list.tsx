import { AddStickerDialog } from "@/_components/add-sticker-dialog"
import { RoundedLightButton } from "@/_components/button/rounded-light-button"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { StickerChangeAccessTypeDialog } from "@/_components/sticker-change-access-type-dialog"
import { Button } from "@/_components/ui/button"
import { AuthContext } from "@/_contexts/auth-context"
import { deleteUserStickerMutation } from "@/_graphql/mutations/delete-user-sticker"
import { viewerUserStickersQuery } from "@/_graphql/queries/viewer/viewer-user-stickers"
import { viewerUserStickersCountQuery } from "@/_graphql/queries/viewer/viewer-user-stickers-count"
import { StickerButton } from "@/routes/($lang)._main.works.$work/_components/sticker-button"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { useState } from "react"
import { useContext } from "react"
import { toast } from "sonner"

export const MyStickersList = () => {
  const authContext = useContext(AuthContext)

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
      toast("スタンプを削除しました")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message ?? "スタンプの削除に失敗しました")
      } else {
        toast.error("スタンプの削除に失敗しました")
      }
    } finally {
      reactStickers()
      reactStickersCount()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Link to="/stickers">
          <Button variant={"secondary"}>スタンプ広場</Button>
        </Link>
        <AddStickerDialog
          onAddedSicker={() => {
            reactStickers()
            reactStickersCount()
          }}
        >
          <Button variant={"secondary"}>新規スタンプ</Button>
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
          {"ダウンロード"}
        </RoundedLightButton>
        <RoundedLightButton
          onClick={() => {
            setStickerStatue("PRIVATE_CREATED")
            setCreatedSortStickerPage(0)
          }}
          isActive={stickerStatus === "PRIVATE_CREATED"}
        >
          {"作成(非公開)"}
        </RoundedLightButton>
        <RoundedLightButton
          onClick={() => {
            setStickerStatue("PUBLIC_CREATED")
            setCreatedSortStickerPage(0)
          }}
          isActive={stickerStatus === "PUBLIC_CREATED"}
        >
          {"作成(公開)"}
        </RoundedLightButton>
      </div>
      <div className="m-auto flex max-h-[64vh] max-w-[88vw] flex-wrap items-center">
        {stickers?.viewer?.userStickers?.map((sticker) => (
          <StickerChangeAccessTypeDialog
            key={sticker.id}
            title={sticker.title}
            stickerId={sticker.id}
            imageUrl={sticker.imageUrl ?? ""}
            accessType={sticker.accessType === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
            onAccessTypeChange={() => {
              reactStickers()
              reactStickersCount()
            }}
          >
            <StickerButton
              key={sticker.id}
              imageUrl={sticker.imageUrl ?? ""}
              title={sticker.title}
              onClick={() => {}}
              onDelete={() => {
                onDelete(sticker.id)
              }}
            />
          </StickerChangeAccessTypeDialog>
        ))}
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
