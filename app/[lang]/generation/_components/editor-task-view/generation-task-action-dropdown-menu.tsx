import { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon } from "lucide-react"

type Props = {
  thumbnailSize: ThumbnailImageSizeType
  onChange(size: ThumbnailImageSizeType): void
}

/**
 * その他ボタン
 * @param props
 * @returns
 */
export function GenerationTaskActionDropdownMenu(props: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <MoreHorizontalIcon className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{"サイズ"}</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>{"サイズ変更"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={props.thumbnailSize === "small"}
                onCheckedChange={props.onChange.bind(null, "small")}
              >
                小
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={props.thumbnailSize === "middle"}
                onCheckedChange={props.onChange.bind(null, "middle")}
              >
                中
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={props.thumbnailSize === "big"}
                onCheckedChange={props.onChange.bind(null, "big")}
              >
                大
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
