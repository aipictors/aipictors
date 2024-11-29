import { Progress } from "~/components/ui/progress"

type Props = {
  per: number
}

/**
 * 読み込み中の履歴の進捗バー
 */
export function InProgressGenerationProgressBar(props: Props) {
  return <Progress className="w-full" value={props.per} />
}
