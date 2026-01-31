import { AlertTriangle, Shield, X } from "lucide-react"
import { useState, useId } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  keyword: string
  targetUrl: string
}

/**
 * センシティブキーワード検索時の警告ダイアログ
 */
export function SensitiveKeywordWarning ({
  isOpen,
  onConfirm,
  onCancel,
  keyword,
  targetUrl,
}: Props): React.ReactNode {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const checkboxId = useId()
  const t = useTranslation()

  const handleConfirm = () => {
    if (dontShowAgain) {
      // Save user preference to localStorage
      localStorage.setItem("skipSensitiveKeywordWarning", "true")
    }
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {t("センシティブコンテンツ検索", "Sensitive Content Search")}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              {/* 警告メッセージ */}
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
                <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  {t(
                    `「${keyword}」はセンシティブなキーワードとして検出されました。`,
                    `"${keyword}" has been detected as a sensitive keyword.`,
                  )}
                </AlertDescription>
              </Alert>

              {/* R18ページ遷移の説明 */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
                <p className="font-medium text-red-800 text-sm dark:text-red-200">
                  📄 {t("R18ページに移動します", "Moving to R18 page")}
                </p>
                <p className="mt-1 text-red-700 text-xs dark:text-red-300">
                  {t(
                    "18歳未満の方は閲覧できません",
                    "Not accessible for users under 18",
                  )}
                </p>
              </div>

              {/* 移動先URL */}
              <div className="rounded border bg-gray-50 p-3 dark:bg-gray-900">
                <p className="font-medium text-gray-900 text-sm dark:text-gray-100">
                  {t("移動先", "Destination")}:
                </p>
                <p className="mt-1 font-mono text-gray-600 text-xs dark:text-gray-400">
                  {targetUrl}
                </p>
              </div>

              {/* 今後表示しないオプション */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={checkboxId}
                  checked={dontShowAgain}
                  onCheckedChange={(checked) =>
                    setDontShowAgain(checked === true)
                  }
                />
                <label
                  htmlFor={checkboxId}
                  className="cursor-pointer text-sm leading-none"
                >
                  {t(
                    "今後この警告を表示しない",
                    "Don't show this warning again",
                  )}
                </label>
              </div>

              <p className="text-muted-foreground text-xs">
                {t(
                  "設定はブラウザのローカルストレージに保存されます",
                  "Settings will be saved in browser's local storage",
                )}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            {t("キャンセル", "Cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {t("R18ページに移動", "Go to R18 Page")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
