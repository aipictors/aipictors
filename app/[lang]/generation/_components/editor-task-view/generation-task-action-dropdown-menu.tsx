import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
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
import { Slider } from "@/components/ui/slider"
import { config } from "@/config"
import { MoreHorizontalIcon } from "lucide-react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  thumbnailSize: number
  taskContentPositionType: TaskContentPositionType
  onChangeTaskContentPositionType(type: TaskContentPositionType): void
  onChange(size: number): void
}

/**
 * その他ボタン
 * @param props
 * @returns
 */
export function GenerationTaskActionDropdownMenu(props: Props) {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

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
        {isDesktop && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {"履歴詳細の表示場所"}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>{"場所変更"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={props.taskContentPositionType === "left"}
                  onCheckedChange={props.onChangeTaskContentPositionType.bind(
                    null,
                    "left",
                  )}
                >
                  左
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={props.taskContentPositionType === "right"}
                  onCheckedChange={props.onChangeTaskContentPositionType.bind(
                    null,
                    "right",
                  )}
                >
                  右
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
