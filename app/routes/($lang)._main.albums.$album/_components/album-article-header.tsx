import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { Button } from "@/_components/ui/button"
import { Card } from "@/_components/ui/card"
import { AuthContext } from "@/_contexts/auth-context"
import {
  AlbumArticleEditorDialog,
  type albumArticleFragment,
} from "@/routes/($lang)._main.albums.$album/_components/album-article-editor-dialog"
import { XIntent } from "@/routes/($lang)._main.posts.$post/_components/work-action-share-x"
import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { Pencil } from "lucide-react"
import { Suspense, useContext, useState } from "react"

type Props = {
  album: FragmentOf<typeof albumArticleFragment>
  thumbnail?: string
  userLogin: string
  userId: string
  userName: string
  userProfileImageURL: string
}

export const AlbumArticleHeader = (props: Props) => {
  const workIds = props.album.workIds.map((work) => work.toString())

  const authContext = useContext(AuthContext)

  const [headerImageUrl, setHeaderImageUrl] = useState(props.thumbnail ?? "")

  return (
    <Card className="relative flex flex-col items-center p-4">
      <div className="relative">
        <div className="m-auto h-40 w-72 overflow-hidden rounded-md">
          <img
            src={headerImageUrl}
            alt={props.album.title}
            className="h-full w-full rounded-md object-cover object-center"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <Link to={`/users/${props.userLogin}`}>
          <div className="flex max-w-32 items-center overflow-hidden">
            <img
              src={props.userProfileImageURL}
              alt={props.userName}
              className="mr-2 h-8 w-8 rounded-full"
            />
            <p className="font-semibold text-lg">{props.userName}</p>
          </div>
        </Link>
        <p className="mt-2 text-center">{props.album.title}</p>
        <div className="mt-4 flex items-center">
          <XIntent
            text={`${props.album.title}\n`}
            url={`${`https://beta.aipictors.com/${props.userId}/albums/${props.album.slug}`}\n`}
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
                thumbnail={headerImageUrl}
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
