import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { IconUrl } from "~/components/icon-url"
import { StickerInfoDialog } from "~/components/sticker-info-dialog"
import { Button } from "~/components/ui/button"
import { XIntent } from "~/routes/($lang)._main.posts.$post/components/work-action-share-x"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"

type Props = {
  sticker: {
    id: string
    title: string
    imageUrl: string
    userId: string
    downloadsCount: number
    usesCount: number
    likesCount: number
    accessType: string
    createdAt: number
    user: {
      login: string
      name: string
      iconUrl: string
    }
  }
}

export const StickerArticle = (props: Props) => {
  const authContext = useContext(AuthContext)

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
          <p>DL回数: {props.sticker.downloadsCount}</p>
          <p>使用回数: {props.sticker.usesCount}</p>
          <p>タグ: その他</p>
          <p>ジャンル: 人物</p>
          <p>作成日: {toDateTimeText(props.sticker.createdAt)}</p>
          <Link to={`/users/${props.sticker.user.login}`}>
            <div className="mt-2 flex items-center space-x-2">
              <img
                src={IconUrl(props.sticker.user.iconUrl)}
                alt={props.sticker.user.name}
                className="h-8 w-8 rounded-full"
              />
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
              ダウンロード済み
            </Button>
          ) : (
            <Button className="rounded px-4 py-2">マイスタンプに追加</Button>
          )}
        </StickerInfoDialog>
        <XIntent
          text={`AIピクターズで自作スタンプをダウンロードしてコメントしてみよう♪ タイトル：${props.sticker.title}`}
          url={`https://www.aipictors.com/stamp/?id=${props.sticker.id}`}
          hashtags={["スタンプ", "Aipictors", "AIピクターズ"]}
          className="flex items-center gap-2"
        >
          <span>{"Xで共有する"}</span>
        </XIntent>
      </div>
      <Button
        onClick={onClickStickerList}
        variant={"secondary"}
        className="m-auto"
      >
        {"一覧にもどる"}
      </Button>
    </div>
  )
}

const stickerQuery = graphql(
  `query Sticker($id: ID!) {
    sticker(id: $id) {
      isDownloaded
    }
  }`,
)
