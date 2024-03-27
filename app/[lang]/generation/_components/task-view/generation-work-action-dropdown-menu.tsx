import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import type { TaskListThumbnailType } from "@/app/[lang]/generation/_types/task-list-thumbnail-type"
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
import { deleteReservedImageGenerationTasksMutation } from "@/graphql/mutations/delete-image-generation-reserved-tasks"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useMutation } from "@apollo/client"
import { Loader2, MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  thumbnailSize: number
  onChange(size: number): void
}

/**
 * その他ボタン
 * @param props
 * @returns
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
