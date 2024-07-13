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
import { Card } from "@/_components/ui/card"

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
    <>
      <Card className="p-1">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">シリーズ</p>
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
        </div>
      </Card>
    </>
  )
}
