import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import {
  AlbumArticleEditorDialog,
  AlbumArticleEditorDialogFragment,
} from "~/routes/($lang)._main.albums.$album/components/album-article-editor-dialog"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { Pencil } from "lucide-react"
import { Suspense, useContext } from "react"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

type Props = {
  album: FragmentOf<typeof AlbumArticleHeaderFragment>
}

export function AlbumArticleHeader(props: Props) {
  const authContext = useContext(AuthContext)

  return (
    <Card className="relative flex flex-col items-center p-4">
      <div className="relative">
        <div className="m-auto h-40 w-72 overflow-hidden rounded-md">
          <img
            src={props.album.thumbnailImageURL ?? ""}
            alt={props.album.title}
            className="h-full w-full rounded-md object-cover object-center"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <Link to={`/users/${props.album.user.login}`}>
          <div className="flex max-w-32 items-center overflow-hidden">
            <img
              src={ExchangeIconUrl(props.album.user.iconUrl)}
              alt={props.album.user.name}
              className="mr-2 h-8 w-8 rounded-full"
            />
            <p className="font-semibold text-lg">{props.album.user.name}</p>
          </div>
        </Link>
        <p className="mt-2 text-center">{props.album.title}</p>
        <div className="mt-4 flex items-center">
          <XIntent
            text={`${props.album.title}\n`}
            url={`${`https://beta.aipictors.com/${props.album.user.id}/albums/${props.album.slug}`}\n`}
          />
        </div>
      </div>
      <div className="mt-4 text-center">
        <p>{props.album.description}</p>
      </div>
      {authContext.userId === props.album.user.id &&
        props.album.user.nanoid && (
          <div className="absolute right-1 bottom-1">
            <Suspense fallback={<AppLoadingPage />}>
              <AlbumArticleEditorDialog
                album={props.album}
                thumbnail={props.album.thumbnailImageURL ?? ""}
                userNanoid={props.album.user.nanoid}
              >
                <Button
                  className="absolute right-1 bottom-1 h-12 w-12 rounded-full p-0"
                  variant={"secondary"}
                >
                  <Pencil className="h-8 w-8" />
                </Button>
              </AlbumArticleEditorDialog>
            </Suspense>
          </div>
        )}
    </Card>
  )
}

export const AlbumArticleHeaderFragment = graphql(
  `fragment AlbumArticleHeader on AlbumNode @_unmask {
    id
    title
    description
    user {
      id
      login
      name
      iconUrl
    }
    createdAt
    isSensitive
    thumbnailImageURL
    slug
    worksCount
    ...AlbumArticleEditorDialog
  }`,
  [AlbumArticleEditorDialogFragment],
)
