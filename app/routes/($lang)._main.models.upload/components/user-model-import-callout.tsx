import { LinkIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { ModelLibraryImportDialog } from "~/components/model-library/model-library-import-dialog"
import { ModelLibraryUploadPanel } from "~/components/model-library/model-library-upload-panel"
import { Button } from "~/components/ui/button"
import { useMyUserModels } from "~/components/user-models/use-user-models"
import { AuthContext } from "~/contexts/auth-context"

/**
 * アップロードページの「URL から追加」。取り込みの進み具合は右下のパネルに出す
 */
export function UserModelImportCallout() {
  const authContext = useContext(AuthContext)
  const mine = useMyUserModels()
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = () => {
    if (!authContext.isLoggedIn) {
      toast("URL から追加するにはログインしてください")
      return
    }
    const used = mine.data?.used ?? 0
    const limit = mine.data?.limit ?? 0
    if (mine.data && limit > 0 && used >= limit) {
      toast("登録できるモデル数の上限に達しています")
      return
    }
    setIsOpen(true)
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LinkIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">
            Civitai のモデルは URL から追加できます
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            ファイルをダウンロードしなくても、モデルページの URL
            を貼るだけで取り込めます。ページを閉じても取り込みは続きます
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 rounded-full"
          onClick={onOpen}
        >
          URL から追加
        </Button>
      </div>
      <ModelLibraryImportDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onImported={() => mine.refetch()}
        onStarted={() => mine.refetch()}
      />
      {/* 取り込みの進み具合（完了したらモデルページへのリンクが出る） */}
      <ModelLibraryUploadPanel className="fixed right-4 bottom-4" />
    </>
  )
}
