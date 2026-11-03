import { useMutation } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import { graphql, type ResultOf } from "gql.tada"
import {
  CopyIcon,
  ExternalLinkIcon,
  GlobeIcon,
  Loader2Icon,
  LockIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { StickerPublishFields } from "~/routes/($lang)._main.posts.$post._index/components/sticker-publish-fields"

export type MyStickerTab = "DOWNLOADED" | "PRIVATE_CREATED" | "PUBLIC_CREATED"

type Sticker = ResultOf<typeof MyStickerFragment>

type Props = {
  sticker: Sticker
  tab: MyStickerTab
  onClose(): void
  onChanged(): void
}

/** タイトルのないスタンプは API が "-" を返す */
export const toStickerTitle = (title: string) => (title === "-" ? "" : title)

/**
 * スタンプの詳細: 見え方の確認、公開、タイトル変更、削除
 */
export function MyStickerDialog(props: Props) {
  const t = useTranslation()

  const [view, setView] = useState<"detail" | "publish" | "rename">("detail")

  const currentTitle = toStickerTitle(props.sticker.title)

  const [title, setTitle] = useState(currentTitle)
  const [genre, setGenre] = useState("CHARACTER")
  const [tag, setTag] = useState("")

  const [updateSticker, { loading: isUpdating }] = useMutation(
    updateStickerMutation,
  )
  const [deleteUserSticker, { loading: isDeleting }] = useMutation(
    deleteUserStickerMutation,
  )

  const isCreated = props.tab !== "DOWNLOADED"
  const isPrivate = props.tab === "PRIVATE_CREATED"
  const isBusy = isUpdating || isDeleting

  const update = async (
    input: {
      accessType: IntrospectionEnum<"StickerAccessType">
      title?: string
      genre?: IntrospectionEnum<"StickerGenre">
      categories?: string[]
    },
    message: string,
  ) => {
    try {
      await updateSticker({
        variables: { input: { stickerId: props.sticker.id, ...input } },
      })
      toast(message)
      props.onChanged()
      props.onClose()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("更新できませんでした", "Could not update"),
      )
    }
  }

  const onPublish = async () => {
    if (title.trim() === "") {
      toast(t("タイトルを入力してください", "Please enter a title"))
      return
    }
    if (tag === "") {
      toast(t("タグを選択してください", "Please select a tag"))
      return
    }
    await update(
      {
        accessType: "PUBLIC",
        title: title.trim(),
        genre: genre as IntrospectionEnum<"StickerGenre">,
        categories: [tag],
      },
      t("公開しました", "Published"),
    )
  }

  const onRename = async () => {
    if (title.trim() === "") {
      toast(t("タイトルを入力してください", "Please enter a title"))
      return
    }
    await update(
      {
        accessType: isPrivate ? "PRIVATE" : "PUBLIC",
        title: title.trim(),
      },
      t("タイトルを変更しました", "Title updated"),
    )
  }

  const onDelete = async () => {
    try {
      await deleteUserSticker({
        variables: { input: { stickerId: props.sticker.id } },
      })
      toast(
        isCreated
          ? t("スタンプを削除しました", "Sticker deleted")
          : t("マイスタンプから外しました", "Removed from My Stickers"),
      )
      props.onChanged()
      props.onClose()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("削除できませんでした", "Could not delete"),
      )
    }
  }

  const onCopyUrl = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/stickers/${props.sticker.id}`,
    )
    toast(t("URLをコピーしました", "URL copied"))
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) props.onClose()
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate pr-6 text-left">
            {currentTitle || t("タイトルなし", "Untitled")}
          </DialogTitle>
        </DialogHeader>
        {/* 明るい背景と暗い背景の両方で見え方を確かめられるようにする */}
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border">
          <div className="flex items-center justify-center bg-white p-3">
            <img
              src={props.sticker.imageUrl ?? ""}
              alt={currentTitle}
              className="aspect-square w-full max-w-36 object-contain"
            />
          </div>
          <div className="flex items-center justify-center bg-neutral-900 p-3">
            <img
              src={props.sticker.imageUrl ?? ""}
              alt=""
              className="aspect-square w-full max-w-36 object-contain"
            />
          </div>
        </div>

        {view === "publish" && (
          <div className="space-y-3">
            <StickerPublishFields
              title={title}
              genre={genre}
              tag={tag}
              onChangeTitle={setTitle}
              onChangeGenre={setGenre}
              onChangeTag={setTag}
            />
            <p className="text-muted-foreground text-xs leading-5">
              {t(
                "公開するとスタンプ広場に並び、誰でもマイスタンプに追加して使えるようになります。",
                "Once published, it appears in the Sticker Square and anyone can add and use it.",
              )}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setView("detail")}>
                {t("戻る", "Back")}
              </Button>
              <Button disabled={isBusy} onClick={() => void onPublish()}>
                {isUpdating && (
                  <Loader2Icon className="mr-1.5 size-4 animate-spin" />
                )}
                {t("公開する", "Publish")}
              </Button>
            </div>
          </div>
        )}

        {view === "rename" && (
          <div className="space-y-3">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("タイトル", "Title")}
              aria-label={t("タイトル", "Title")}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setView("detail")}>
                {t("戻る", "Back")}
              </Button>
              <Button disabled={isBusy} onClick={() => void onRename()}>
                {isUpdating && (
                  <Loader2Icon className="mr-1.5 size-4 animate-spin" />
                )}
                {t("保存", "Save")}
              </Button>
            </div>
          </div>
        )}

        {view === "detail" && (
          <div className="flex flex-col gap-2">
            {isPrivate && (
              <Button onClick={() => setView("publish")}>
                <GlobeIcon className="mr-1.5 size-4" />
                {t("公開する", "Publish")}
              </Button>
            )}
            {!isPrivate && (
              <>
                <Button variant="secondary" asChild>
                  <Link to={`/stickers/${props.sticker.id}`}>
                    <ExternalLinkIcon className="mr-1.5 size-4" />
                    {t("スタンプのページを開く", "Open sticker page")}
                  </Link>
                </Button>
                <Button variant="secondary" onClick={() => void onCopyUrl()}>
                  <CopyIcon className="mr-1.5 size-4" />
                  {t("URLをコピー", "Copy URL")}
                </Button>
              </>
            )}
            {isCreated && (
              <Button variant="secondary" onClick={() => setView("rename")}>
                <PencilIcon className="mr-1.5 size-4" />
                {t("タイトルを変更", "Change title")}
              </Button>
            )}
            {props.tab === "PUBLIC_CREATED" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" disabled={isBusy}>
                    <LockIcon className="mr-1.5 size-4" />
                    {t("非公開に戻す", "Make private")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("非公開に戻しますか？", "Make this private?")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t(
                        "広場に出なくなり、追加済みの人もコメントで使えなくなります。あとで公開し直せます。",
                        "It leaves the Square, and people who added it can no longer use it in comments. You can publish it again later.",
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t("キャンセル", "Cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        void update(
                          { accessType: "PRIVATE" },
                          t("非公開にしました", "Made private"),
                        )
                      }
                    >
                      {t("非公開に戻す", "Make private")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={isBusy}
                >
                  <Trash2Icon className="mr-1.5 size-4" />
                  {isCreated
                    ? t("削除", "Delete")
                    : t("マイスタンプから外す", "Remove from My Stickers")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isCreated
                      ? t("スタンプを削除しますか？", "Delete this sticker?")
                      : t(
                          "マイスタンプから外しますか？",
                          "Remove from My Stickers?",
                        )}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {props.tab === "DOWNLOADED" &&
                      t(
                        "作者のスタンプ自体は消えません。広場からまた追加できます。",
                        "The sticker itself stays. You can add it again from the Square.",
                      )}
                    {props.tab === "PRIVATE_CREATED" &&
                      t(
                        "一覧から消え、元に戻せません。",
                        "It disappears from your list and cannot be restored.",
                      )}
                    {props.tab === "PUBLIC_CREATED" &&
                      t(
                        "広場からも消え、ほかの人も新しく追加できなくなります。元に戻せません。",
                        "It also leaves the Square, and nobody can newly add it. This cannot be undone.",
                      )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("キャンセル", "Cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => void onDelete()}>
                    {isCreated ? t("削除", "Delete") : t("外す", "Remove")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export const MyStickerFragment = graphql(
  `fragment MySticker on StickerNode @_unmask {
    id
    title
    imageUrl
    downloadsCount
    usesCount
  }`,
)

const updateStickerMutation = graphql(
  `mutation UpdateMySticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
    }
  }`,
)

const deleteUserStickerMutation = graphql(
  `mutation DeleteMySticker($input: DeleteUserStickerInput!) {
    deleteUserSticker(input: $input) {
      id
    }
  }`,
)
