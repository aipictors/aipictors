import { Button } from "~/components/ui/button"
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
} from "~/components/ui/dropdown-menu"
import { Slider } from "~/components/ui/slider"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { MoreHorizontalIcon } from "lucide-react"

type Props = {
  thumbnailSize: number
  sortType: IntrospectionEnum<"WorkOrderBy">
  onChange(size: number): void
  onChangeSortType(sortType: IntrospectionEnum<"WorkOrderBy">): void
}

/**
 * その他ボタン
 */
export function GenerationWorkActionDropdownMenu(props: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          title="サムネイルサイズ変更など"
        >
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
              <Slider
                className="color-pink w-32 px-2 py-4"
                aria-label="slider-ex-2"
                min={1}
                max={9}
                step={1}
                value={[props.thumbnailSize]}
                onValueChange={(value) => props.onChange(value[0])}
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{"ソート"}</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>{"ソート順変更"}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem
                checked={props.sortType === "DATE_CREATED"}
                onCheckedChange={props.onChangeSortType.bind(
                  null,
                  "DATE_CREATED",
                )}
              >
                {"新着順"}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={props.sortType === "LIKES_COUNT"}
                onCheckedChange={props.onChangeSortType.bind(
                  null,
                  "LIKES_COUNT",
                )}
              >
                {"いいね順"}
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
