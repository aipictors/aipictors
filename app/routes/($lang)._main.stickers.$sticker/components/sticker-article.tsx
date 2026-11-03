import { Link } from "~/lib/app/locale-router"
import { type FragmentOf, graphql } from "gql.tada"
import { CheckIcon, ChevronRightIcon, DownloadIcon, Loader2Icon, PlusIcon, StampIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { useMutation, useQuery } from "@apollo/client/index"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { AuthContext } from "~/contexts/auth-context"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { toResizedImageSrcSet, toResizedImageUrl } from "~/utils/resized-image-url"

type Props = {
  sticker: FragmentOf<typeof StickerArticleFragment>
}

export function StickerArticle (props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const { data: viewerStickerResp } = useQuery(stickerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      id: props.sticker.id,
    },
  })

  const [isAdded, setIsAdded] = useState(false)

  const [createUserSticker, { loading: isAdding }] = useMutation(
    createUserStickerMutation,
  )

  const isDownloaded =
    isAdded || viewerStickerResp?.sticker?.isDownloaded === true

  const onAdd = async () => {
    try {
      await createUserSticker({
        variables: {
          input: {
            stickerId: props.sticker.id,
          },
        },
      })
      setIsAdded(true)
      toast(t("マイスタンプに追加しました", "Added to My Stickers"))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("追加できませんでした", "Could not add"),
      )
    }
  }

  return (
    <article className="flex flex-col gap-4">
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex items-center gap-1 text-muted-foreground text-xs"
      >
        <Link to="/stickers" className="shrink-0 hover:text-foreground">
          {t("スタンプ広場", "Sticker Square")}
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" />
        <span className="truncate">{props.sticker.title}</span>
      </nav>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-8">
        <div className="mx-auto w-full max-w-72 shrink-0 overflow-hidden rounded-3xl bg-muted/60 p-3 md:mx-0 md:max-w-80">
          <img
            src={
              toResizedImageUrl(props.sticker.imageUrl, 480) ??
              props.sticker.imageUrl ??
              ""
            }
            srcSet={toResizedImageSrcSet(props.sticker.imageUrl, {
              minWidth: 320,
              maxWidth: 800,
            })}
            sizes="(min-width: 768px) 320px, 288px"
            width={480}
            height={480}
            fetchPriority="high"
            alt={props.sticker.title}
            className="aspect-square w-full object-contain"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="space-y-2">
            <h1 className="break-words font-bold text-2xl">
              {props.sticker.title}
            </h1>
            <Link
              to={`/users/${props.sticker.user.login}`}
              className="flex w-fit items-center gap-2 text-sm hover:underline"
            >
              <Avatar className="size-7">
                <AvatarImage
                  className="size-7 rounded-full"
                  src={withIconUrlFallback(props.sticker.user.iconUrl)}
                  alt=""
                />
                <AvatarFallback />
              </Avatar>
              {props.sticker.user.name}
            </Link>
          </div>
          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground text-sm">
            <div className="flex items-center gap-1.5">
              <DownloadIcon className="size-4" />
              <dt>{t("追加", "Added")}</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {props.sticker.downloadsCount}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <StampIcon className="size-4" />
              <dt>{t("使用", "Used")}</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {props.sticker.usesCount}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>{t("作成日", "Created")}</dt>
              <dd>{toDateTimeText(props.sticker.createdAt)}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2 sm:flex-row">
            {authContext.isNotLoggedIn ? (
              <LoginDialogButton
                className="h-11 rounded-full px-6 font-bold"
                label={t("ログインして追加", "Log in to add")}
              />
            ) : (
              <Button
                className="h-11 gap-1.5 rounded-full px-6 font-bold"
                disabled={isDownloaded || isAdding || authContext.isLoading}
                onClick={() => void onAdd()}
              >
                {isAdding ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : isDownloaded ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <PlusIcon className="size-4" />
                )}
                {isDownloaded
                  ? t("マイスタンプに追加済み", "In My Stickers")
                  : t("マイスタンプに追加", "Add to My Stickers")}
              </Button>
            )}
            <XIntent
              text={t(
                `AIピクターズで自作スタンプをダウンロードしてコメントしてみよう♪ タイトル：${props.sticker.title}`,
                `Download and comment on my custom sticker at AIPictors! Title: ${props.sticker.title}`,
              )}
              url={`https://www.aipictors.com/stickers/${props.sticker.id}`}
              hashtags={["スタンプ", "Aipictors", "AIピクターズ"]}
              className="flex h-11 items-center justify-center gap-2 rounded-full px-5"
            >
              <span>{t("Xで共有する", "Share on X")}</span>
            </XIntent>
          </div>
          <p className="text-muted-foreground text-xs leading-5">
            {t(
              "追加すると、作品のコメント欄のスタンプボタンから使えるようになります。",
              "Once added, you can use it from the sticker button in comment boxes.",
            )}
          </p>
        </div>
      </div>
    </article>
  )
}

export const StickerArticleFragment = graphql(
  `fragment StickerArticle on StickerNode @_unmask {
    id
    title
    imageUrl
    userId
    downloadsCount
    usesCount
    likesCount
    accessType
    createdAt
    user {
      login
      name
      iconUrl
    }
  }`,
)

const stickerQuery = graphql(
  `query Sticker($id: ID!) {
    sticker(id: $id) {
      isDownloaded
    }
  }`,
)

const createUserStickerMutation = graphql(
  `mutation CreateUserSticker($input: CreateUserStickerInput!) {
    createUserSticker(input: $input) {
      id
    }
  }`,
)
