import { Link } from "@remix-run/react"
import { CheckIcon, ImageOffIcon, XIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { UserModelBaseBadge } from "~/components/user-models/user-model-badges"
import type { SelectedUserCheckpoint } from "~/lib/user-models/generation"

type Props = {
  checkpoint: SelectedUserCheckpoint
  onClear(): void
}

/**
 * 選択中のみんなのモデル（チェックポイント）
 */
export function SelectedUserCheckpointCard(props: Props) {
  return (
    <div className="relative flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 p-2 pr-1">
      <Link
        to={`/models/u/${props.checkpoint.id}`}
        target="_blank"
        className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {props.checkpoint.thumbnailUrl ? (
          <img
            src={props.checkpoint.thumbnailUrl}
            alt={props.checkpoint.name}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOffIcon className="size-5" />
          </span>
        )}
        <span className="absolute top-0.5 left-0.5 rounded-full bg-primary p-0.5 text-primary-foreground">
          <CheckIcon className="size-3" />
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[11px] text-primary">みんなのモデル</p>
        <p className="truncate font-semibold text-sm">
          {props.checkpoint.name}
        </p>
        <UserModelBaseBadge
          baseModel={props.checkpoint.baseModel}
          className="mt-0.5 bg-secondary text-secondary-foreground"
        />
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0"
        onClick={props.onClear}
        aria-label="公式モデルに戻す"
        title="公式モデルに戻す"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  )
}
