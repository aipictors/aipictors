import { Link } from "react-router";
import { type FragmentOf, graphql } from "gql.tada"
import { Button } from "~/components/ui/button"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"
import { StickerInfoDialog } from "~/routes/($lang)._main.users.$user._index/components/sticker-info-dialog"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"

type Props = {
  sticker: FragmentOf<typeof StickerArticleFragment>
}

export function StickerArticle(props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const { data: recommendedWorksResp } = useQuery(stickerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      id: props.sticker.id,
    },
  })

  const onClickStickerList = () => {
    window.location.href = "/stickers"
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-4 p-4">
      <div className="text-center">
        <h1 className="font-bold text-2xl">{props.sticker.title}</h1>
      </div>
      <div className="flex flex-col items-start space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="space-y-2 md:w-1/2">
          <img
            src={props.sticker.imageUrl ?? ""}
            alt={props.sticker.title}
            className="h-auto max-w-full"
          />
        </div>
        <div className="space-y-2 md:w-1/2">
          <h2 className="font-semibold text-xl">{props.sticker.title}</h2>
          <p>
            {t("DL回数", "Downloads")}: {props.sticker.downloadsCount}
          </p>
          <p>
            {t("使用回数", "Uses")}: {props.sticker.usesCount}
          </p>
          <p>
            {t("タグ", "Tags")}: {t("その他", "Others")}
          </p>
          <p>
            {t("ジャンル", "Genre")}: {t("人物", "Person")}
          </p>
          <p>
            {t("作成日", "Created at")}:{" "}
            {toDateTimeText(props.sticker.createdAt)}
          </p>
          <Link to={`/users/${props.sticker.user.login}`}>
            <div className="mt-2 flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  className="h-8 w-8 rounded-full"
                  src={withIconUrlFallback(props.sticker.user.iconUrl)}
                  alt=""
                />
                <AvatarFallback />
              </Avatar>
              <span className="text-nowrap text-md">
                {props.sticker.user.name}
              </span>
            </div>
          </Link>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <StickerInfoDialog
          isDownloaded={recommendedWorksResp?.sticker?.isDownloaded ?? false}
          stickerId={props.sticker.id}
          title={props.sticker.title}
          imageUrl={props.sticker.imageUrl}
        >
          {recommendedWorksResp?.sticker?.isDownloaded ? (
            <Button className="rounded px-4 py-2" disabled={true}>
              {t("ダウンロード済み", "Downloaded")}
            </Button>
          ) : (
            <Button className="rounded px-4 py-2">
              {t("マイスタンプに追加", "Add to My Stickers")}
            </Button>
          )}
        </StickerInfoDialog>
        <XIntent
          text={t(
            `AIピクターズで自作スタンプをダウンロードしてコメントしてみよう♪ タイトル：${props.sticker.title}`,
            `Download and comment on my custom sticker at AIPictors! Title: ${props.sticker.title}`,
          )}
          url={`https://www.aipictors.com/stamp/?id=${props.sticker.id}`}
          hashtags={["スタンプ", "Aipictors", "AIピクターズ"]}
          className="flex items-center gap-2"
        >
          <span>{t("Xで共有する", "Share on X")}</span>
        </XIntent>
      </div>
      <Button
        onClick={onClickStickerList}
        variant={"secondary"}
        className="m-auto"
      >
        {t("スタンプ一覧にもどる", "Back to Sticker List")}
      </Button>
    </div>
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
