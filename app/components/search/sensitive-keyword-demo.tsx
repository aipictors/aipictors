import { useState } from "react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  SensitiveKeywordIndicator,
  CompactSensitiveIndicator,
} from "~/components/search/sensitive-keyword-indicator"
import { SensitiveKeywordWarning } from "~/components/search/sensitive-keyword-warning"
import { SensitiveWarningSettings } from "~/components/search/sensitive-warning-settings"
import {
  analyzeSensitiveSearch,
  generateSensitiveUrl,
} from "~/utils/sensitive-keyword-helpers"

/**
 * センシティブキーワード機能のデモンストレーション用コンポーネント
 */
export function SensitiveKeywordDemo() {
  const [searchText, setSearchText] = useState("")
  const [showWarning, setShowWarning] = useState(false)
  const [pendingData, setPendingData] = useState<{
    sanitizedText: string
    targetUrl: string
  } | null>(null)

  const handleSearch = () => {
    if (!searchText.trim()) return

    const { isSensitive, shouldShowWarning, sanitizedText } =
      analyzeSensitiveSearch(searchText)
    const baseUrl = `/tags/${encodeURIComponent(sanitizedText)}`
    const targetUrl = generateSensitiveUrl(baseUrl, isSensitive)

    if (shouldShowWarning) {
      setPendingData({ sanitizedText, targetUrl })
      setShowWarning(true)
    } else {
      alert(`Navigating to: ${targetUrl}`)
    }
  }

  const handleConfirm = () => {
    if (pendingData) {
      alert(`Navigation confirmed to: ${pendingData.targetUrl}`)
    }
    setShowWarning(false)
    setPendingData(null)
  }

  const handleCancel = () => {
    setShowWarning(false)
    setPendingData(null)
  }

  const testKeywords = [
    "ロリ",
    "エロ",
    "NSFW",
    "r18",
    "おっぱい",
    "イラスト",
    "アニメ",
  ]

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>センシティブキーワード検索デモ</CardTitle>
          <CardDescription>
            センシティブキーワードを入力すると警告システムが動作します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 検索入力 */}
          <div className="relative">
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="検索キーワードを入力..."
              className="pr-20"
            />
            <div className="-translate-y-1/2 absolute top-1/2 right-2 flex items-center gap-1">
              <CompactSensitiveIndicator searchText={searchText} />
              <Button onClick={handleSearch} size="sm">
                検索
              </Button>
            </div>
          </div>

          {/* インジケーター */}
          <SensitiveKeywordIndicator searchText={searchText} />

          {/* テストキーワード */}
          <div className="space-y-2">
            <p className="font-medium text-sm">テストキーワード:</p>
            <div className="flex flex-wrap gap-2">
              {testKeywords.map((keyword) => (
                <Button
                  key={keyword}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchText(keyword)}
                >
                  {keyword}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 設定管理 */}
      <SensitiveWarningSettings />

      {/* 警告ダイアログ */}
      <SensitiveKeywordWarning
        isOpen={showWarning}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        keyword={pendingData?.sanitizedText || ""}
        targetUrl={pendingData?.targetUrl || ""}
      />
    </div>
  )
}
