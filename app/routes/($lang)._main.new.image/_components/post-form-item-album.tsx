import {} from "@/_components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select"
import type { Album } from "@/routes/($lang)._main.new.image/_types/album"
import { Card, CardContent } from "@/_components/ui/card"

type Props = {
  album: string | null
  albums: Album[]
  setAlbumId: (value: string) => void
}

/**
 * シリーズ入力
 */
export const PostFormItemAlbum = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{"シリーズ"}</p>
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
