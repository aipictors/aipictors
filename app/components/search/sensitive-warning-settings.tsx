import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { AlertTriangle, RefreshCw, Shield } from "lucide-react"
import { useState, useEffect, useId } from "react"
import { useTranslation } from "~/hooks/use-translation"
import {
  shouldSkipSensitiveWarning,
  resetSensitiveWarningPreference,
} from "~/utils/sensitive-keyword-helpers"

/**
 * センシティブキーワード警告の設定管理コンポーネント
 */
export function SensitiveWarningSettings() {
  const [skipWarning, setSkipWarning] = useState(false)
  const skipWarningId = useId()
  const t = useTranslation()

  useEffect(() => {
    setSkipWarning(shouldSkipSensitiveWarning())
  }, [])

  const handleToggleSkip = (checked: boolean) => {
    setSkipWarning(checked)
    if (checked) {
      localStorage.setItem("skipSensitiveKeywordWarning", "true")
    } else {
      localStorage.removeItem("skipSensitiveKeywordWarning")
    }
  }

  const handleReset = () => {
    resetSensitiveWarningPreference()
    setSkipWarning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          {t("センシティブコンテンツ警告", "Sensitive Content Warning")}
        </CardTitle>
        <CardDescription>
          {t(
            "センシティブキーワード検索時の警告表示を管理します",
            "Manage warning display for sensitive keyword searches",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor={skipWarningId}>
              {t("警告をスキップ", "Skip Warnings")}
            </Label>
            <p className="text-muted-foreground text-sm">
              {t(
                "センシティブキーワード検索時に確認ダイアログを表示しません",
                "Skip confirmation dialog when searching sensitive keywords",
              )}
            </p>
          </div>
          <Switch
            id={skipWarningId}
            checked={skipWarning}
            onCheckedChange={handleToggleSkip}
          />
        </div>

        <div className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("設定をリセット", "Reset Settings")}
          </Button>
          <p className="mt-2 text-muted-foreground text-xs">
            {t(
              "設定はブラウザのローカルストレージに保存されます",
              "Settings are saved in browser's local storage",
            )}
          </p>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600 dark:text-orange-400" />
            <div className="space-y-1">
              <p className="font-medium text-orange-800 text-sm dark:text-orange-200">
                {t("センシティブコンテンツについて", "About Sensitive Content")}
              </p>
              <p className="text-orange-700 text-xs dark:text-orange-300">
                {t(
                  "センシティブなキーワードでの検索は自動的にR18ページに移動します。18歳未満の方は閲覧できません。",
                  "Searches with sensitive keywords will automatically redirect to R18 pages. Not accessible for users under 18.",
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
