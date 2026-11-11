import { CrownIcon } from "lucide-react"
import { Link } from "~/lib/app/locale-router"

type Props = {
  modelId: string
  isPickup: boolean
  pickupEventSlug: string | null
  pickupEventTag: string | null
}

/**
 * モデル詳細の「このモデルで生成 → そのまま投稿」の手順。
 * 生成結果の「投稿」から投稿画面に進める（ピックアップの週はその週のお題が自動で選ばれる）
 */
export function UserModelGenerateFlow(props: Props) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3 text-xs leading-relaxed">
      <ol className="flex flex-col gap-1.5">
        <li className="flex gap-2">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-[11px] text-primary-foreground">
            1
          </span>
          <span>「このモデルで生成」を押すと、モデルを選んだ状態で生成画面が開きます</span>
        </li>
        <li className="flex gap-2">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-[11px] text-primary-foreground">
            2
          </span>
          <span>気に入った画像の「投稿」を押すと、生成情報つきでそのまま投稿できます</span>
        </li>
        {props.isPickup && props.pickupEventTag && (
          <li className="flex gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
              <CrownIcon className="size-3" />
            </span>
            <span>
              今週のピックアップモデルです。投稿するとお題「{props.pickupEventTag}
              」に自動で参加し、いいねの数で今週のランキングに入ります
              {props.pickupEventSlug && (
                <>
                  {"（"}
                  <Link
                    to={`/events/${props.pickupEventSlug}`}
                    className="text-primary hover:underline"
                  >
                    参加作品とランキング
                  </Link>
                  {"）"}
                </>
              )}
            </span>
          </li>
        )}
      </ol>
      <p className="mt-2 text-muted-foreground">
        みんなのモデルは無料プランでも生成に使えます（1 日の生成枚数の範囲内）。
        <Link to="/plus" className="text-primary hover:underline">
          プランを見る
        </Link>
      </p>
    </div>
  )
}
