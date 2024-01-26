import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Props = {
  text: string
  className?: string
}

export const CopyButton = (props: Props) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(props.text)
      .then(() => {
        toast("クリップボードにコピーされました")
      })
      .catch((err) => {
        console.error("クリップボードへのコピーに失敗しました:", err)
      })
  }

  return (
    <Button
      className={`${props.className} whitespace-normal border w-full border-gray dark:border-white bg-transparent text-black dark:text-white p-4 hover:bg-black hover:bg-opacity-50 dark:hover:bg-white dark:hover:bg-opacity-50`}
      onClick={copyToClipboard}
    >
      <p className="ta-l">{props.text}</p>
    </Button>
  )
}
