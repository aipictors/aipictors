import { CropImageField } from "@/_components/crop-image-field"
import { Button } from "@/_components/ui/button"
import { Card } from "@/_components/ui/card"
import type { albumQuery } from "@/_graphql/queries/album/album"
import { XIntent } from "@/routes/($lang)._main.works.$work/_components/work-action-share-x"
import { SelectCreatedWorksDialogWithIds } from "@/routes/($lang).dashboard._index/_components/select-created-works-dialog-with-ids"
import { Link } from "@remix-run/react"
import type { ResultOf } from "gql.tada"
import { Pencil, PlusIcon } from "lucide-react"
import { useState } from "react"

type Props = {
  album: NonNullable<ResultOf<typeof albumQuery>["album"]>
  thumbnail?: string
  userLogin: string
  userId: string
  userName: string
  userProfileImageURL: string
}

export const AlbumArticleHeader = (props: Props) => {
  const workIds = props.album.workIds.map((work) => work.toString())

  const [selectedWorks, setSelectedWorks] = useState<string[]>(workIds)

  const [headerImageUrl, setHeaderImageUrl] = useState(props.thumbnail ?? "")

  return (
    <Card className="flex flex-col items-center p-4">
      <div className="relative">
        <img
          src={headerImageUrl}
          alt={props.album.title}
          className="w-full rounded-md object-cover"
        />
        {props.userId === props.album.user.id && (
          <>
            <p className="font-bold text-sm">
              ※ センシティブなカバー画像は設定しないようにお願い致します。
            </p>
            <CropImageField
              isHidePreviewImage={false}
              cropWidth={455}
              cropHeight={237}
              onDeleteImage={() => {
                setHeaderImageUrl("")
              }}
              onCropToBase64={setHeaderImageUrl}
              fileExtension={"webp"}
            >
              <Button
                className="absolute right-1 bottom-1 h-12 w-12 rounded-full p-0"
                variant={"secondary"}
              >
                <Pencil className="h-8 w-8" />
              </Button>
            </CropImageField>
          </>
        )}
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
      {props.userId === props.album.user.id && (
        <SelectCreatedWorksDialogWithIds
          selectedWorkIds={selectedWorks}
          setSelectedWorkIds={setSelectedWorks}
        >
          <div className="border-2 border-transparent p-1">
            <Button className="h-16 w-16" size={"icon"} variant={"secondary"}>
              <PlusIcon />
            </Button>
          </div>
        </SelectCreatedWorksDialogWithIds>
      )}
    </Card>
  )
}
