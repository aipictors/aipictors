// copy-work-url.tsx

import { Button } from "@/components/ui/button"
import { RiFileCopyLine } from "react-icons/ri"
import { toast } from "sonner"

type Props = {
  currentUrl: string
}

const CopyWorkUrlButton = ({ currentUrl }: Props) => {
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast("URLがクリップボードにコピーされました。")
    } catch (err) {
      toast("URLのコピーに失敗しました。")
      console.error(err)
    }
  }

  return (
    <Button
      className="flex items-center gap-2"
      variant="outline"
      onClick={handleCopyUrl}
    >
      <RiFileCopyLine />
      URLをコピー
    </Button>
  )
}

export default CopyWorkUrlButton
