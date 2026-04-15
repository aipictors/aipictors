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
export function PostFormItemAlbum (props: Props) {
  const t = useTranslation()
  const hasAlbums = props.albums.length > 0

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{t("シリーズ", "Album")}</p>
        <Select
          disabled={!hasAlbums}
          value={props.album ?? ""}
          onValueChange={(value) => {
            props.setAlbumId(value)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={hasAlbums
                ? t("シリーズを選択", "Select a series")
                : t(
                    "利用可能なシリーズがありません",
                    "No series available",
                  )}
            />
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
        {!hasAlbums && (
          <p className="text-muted-foreground text-xs">
            {t(
              "シリーズがまだない場合は、マイページのシリーズ管理から追加できます。",
              "If you do not have any series yet, create one from your series management page.",
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
