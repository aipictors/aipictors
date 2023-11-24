import { Loader2 } from "lucide-react"

type Props = {
  text?: string
}

/**
 * 読み込み中のページ
 * @returns
 */
export const LoadingPage = (props: Props) => {
  return (
    <div className="w-full p-4 h-main flex justify-center items-center">
      <div className="p-4 flex flex-col gap-y-4 items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        {props.text && <p>{"読み込み中"}</p>}
      </div>
    </div>
  )
}
