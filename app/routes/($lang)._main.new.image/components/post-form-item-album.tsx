import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import type { Album } from "~/routes/($lang)._main.new.image/types/album"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  album: string | null
  albums: Album[]
  setAlbumId: (value: string) => void
}

/**
 * シリーズ入力
 */
export function PostFormItemAlbum(props: Props) {
  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{t("シリーズ", "Album")}</p>
        <Select
          value={props.album ?? ""}
          onValueChange={(value) => {
            props.setAlbumId(value)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {props.albums.map((album) => (
                <SelectItem key={album.id} value={album.id}>
                  {album.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
