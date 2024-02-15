import { Button } from "@/components/ui/button"
import * as fflate from "fflate"
import { ArrowDownToLineIcon } from "lucide-react"
import { toast } from "sonner"

interface GenerationHistoryDownloadWithZipProps {
  disabled?: boolean // Make disabled optional
  selectedTaskIds: string[]
}

const GenerationHistoryDownloadWithZip = ({
  disabled = false,
}: GenerationHistoryDownloadWithZipProps) => {
  // ZIPファイルを作成しダウンロードする関数
  const handleDownloadZip = async () => {
    // 例として、ダミーテキストファイルを作成します
    const files = {
      "example.txt": new TextEncoder().encode(
        "これはZIP圧縮されるテキストファイルの内容です。",
      ),
    }

    // fflateを使用してZIP圧縮
    fflate.zip(files, (err, zip) => {
      if (err) {
        toast("Zip圧縮中にエラーが発生しました")
        console.error(err)
        return
      }

      toast("Zip圧縮に成功しました。ダウンロードを開始します。")
      // BlobとしてZIPデータを保存
      const blob = new Blob([zip], { type: "application/zip" })

      // ダウンロードリンクを作成
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "generation_image.zip" // ダウンロードファイル名
      document.body.appendChild(a)
      a.click()

      // 後処理
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <Button
      disabled={disabled}
      variant="ghost"
      size="icon"
      onClick={handleDownloadZip}
    >
      <ArrowDownToLineIcon className="w-4" />
    </Button>
  )
}

export default GenerationHistoryDownloadWithZip
