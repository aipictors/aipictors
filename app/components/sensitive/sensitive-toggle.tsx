import { useEffect, useState, useId } from "react"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale"
import { cn } from "~/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Checkbox } from "~/components/ui/checkbox"
import { setCookie, hasCookie } from "~/lib/cookie-utils"
import { Shield, Eye, EyeOff, AlertTriangle } from "lucide-react"

type Props = {
  variant?: "compact" | "full" | "toggle" | "card"
  className?: string
  showStatus?: boolean
  targetUrl?: string
}

export function SensitiveToggle ({
  variant = "compact",
  className,
  showStatus = false,
  targetUrl,
}: Props): React.ReactNode {
  const [isR18Mode, setIsR18Mode] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [shouldSkipDialog, setShouldSkipDialog] = useState(false)
  const [isRememberChoice, setIsRememberChoice] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const locale = useLocale()
  const t = useTranslation()
  const checkboxId = useId()
  const cookieKey = "sensitive-content-confirmed"

  useEffect(() => {
    // URLに"/r"が含まれているかチェック
    setIsR18Mode(/\/r($|\/)/.test(location.pathname))
    // Cookieが存在するかチェック
    setShouldSkipDialog(hasCookie(cookieKey))
  }, [location.pathname, cookieKey])

  const performR18Toggle = () => {
    if (targetUrl) {
      // targetUrlが指定されている場合はそのURLに直接ナビゲート
      navigate(targetUrl, { replace: true })
      return
    }

    const isEnglish = locale === "en"
    let newPathname = location.pathname

    if (isR18Mode) {
      // R18モードをOFFにする（"/r"を削除）
      newPathname = location.pathname.replace(/\/r/, "")
      if (newPathname === "") newPathname = "/"
    } else {
      // R18モードをONにする
      if (isEnglish) {
        newPathname = location.pathname.startsWith("/en")
          ? location.pathname.replace("/en", "/en/r")
          : `/en/r${location.pathname}`
      } else {
        newPathname = `/r${location.pathname}`
      }
    }

    navigate(newPathname, { replace: true })
  }

  const handleR18ToggleClick = () => {
    if (isR18Mode) {
      // R18モードをOFFにする場合は直接実行
      performR18Toggle()
    } else {
      // R18モードをONにする場合は必ず確認ダイアログを表示
      if (shouldSkipDialog) {
        performR18Toggle()
      } else {
        setIsDialogOpen(true)
      }
    }
  }

  const handleConfirm = () => {
    // Cookieを設定（30日間）
    if (isRememberChoice) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)
      setCookie(cookieKey, "true", {
        expires: expiryDate,
        path: "/",
        secure: true,
        sameSite: "strict",
      })
    }

    // R18モードに切り替え
    performR18Toggle()
    setIsDialogOpen(false)
    setIsRememberChoice(false)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setIsRememberChoice(false)
  }

  // コンパクトバリアント - ヘッダー/ナビゲーション用
  if (variant === "compact") {
    return (
      <>
        <Button
          variant={isR18Mode ? "default" : "outline"}
          size="sm"
          onClick={handleR18ToggleClick}
          className={cn(
            "group relative overflow-hidden transition-all duration-300 ease-in-out",
            isR18Mode
              ? "border-0 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white shadow-lg hover:scale-105 hover:shadow-xl"
              : "border-2 border-red-200/60 bg-white/80 text-red-600 backdrop-blur-sm hover:border-red-300 hover:bg-red-50 dark:border-red-700/60 dark:bg-gray-800/80 dark:text-red-400 dark:hover:bg-red-950/50",
            className,
          )}
        >
          <span className="relative z-10 flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">R18</span>
            {showStatus && isR18Mode && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-white/80" />
            )}
          </span>
          {isR18Mode && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-red-600/20 via-pink-600/20 to-rose-600/20" />
          )}
        </Button>

        <ConfirmationDialog
          isOpen={isDialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isRememberChoice={isRememberChoice}
          onRememberChoiceChange={setIsRememberChoice}
          checkboxId={checkboxId}
          t={t}
        />
      </>
    )
  }

  // カードバリアント - ページヘッダー用
  if (variant === "card") {
    return (
      <>
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border bg-gradient-to-r p-4 shadow-sm transition-all duration-300",
            isR18Mode
              ? "border-red-200 from-red-50 to-pink-50 dark:border-red-800 dark:from-red-950/20 dark:to-pink-950/20"
              : "border-gray-200 from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900",
            className,
          )}
        >
          <div className="flex items-center space-x-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                isR18Mode
                  ? "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900"
                  : "bg-gray-200 dark:bg-gray-700",
              )}
            >
              {isR18Mode ? (
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              ) : (
                <Shield className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {t("年齢制限コンテンツ", "Age-Restricted Content")}
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-400">
                {isR18Mode
                  ? t(
                      "R18コンテンツが表示されています",
                      "R18 content is visible",
                    )
                  : t("R18コンテンツは非表示です", "R18 content is hidden")}
              </p>
            </div>
          </div>
          <Button
            variant={isR18Mode ? "destructive" : "outline"}
            onClick={handleR18ToggleClick}
            className={cn(
              "transition-all duration-300",
              isR18Mode
                ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950",
            )}
          >
            <span className="flex items-center gap-2">
              {isR18Mode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isR18Mode ? t("非表示にする", "Hide") : t("表示する", "Show")}
              </span>
            </span>
          </Button>
        </div>

        <ConfirmationDialog
          isOpen={isDialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isRememberChoice={isRememberChoice}
          onRememberChoiceChange={setIsRememberChoice}
          checkboxId={checkboxId}
          t={t}
        />
      </>
    )
  }

  // トグルバリアント - 設定画面用
  if (variant === "toggle") {
    return (
      <>
        <div
          className={cn(
            "flex items-center justify-between space-x-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-4 dark:from-gray-800 dark:to-gray-900",
            className,
          )}
        >
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "rounded-lg p-2 transition-colors",
                isR18Mode
                  ? "bg-red-100 dark:bg-red-900"
                  : "bg-gray-200 dark:bg-gray-700",
              )}
            >
              {isR18Mode ? (
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            <div>
              <Label
                htmlFor="sensitive-toggle"
                className="cursor-pointer font-semibold text-sm"
              >
                {t("年齢制限コンテンツ", "Age-Restricted Content")}
              </Label>
              <p className="text-muted-foreground text-xs">
                {isR18Mode
                  ? t("R18コンテンツが表示されます", "R18 content is visible")
                  : t("R18コンテンツは非表示です", "R18 content is hidden")}
              </p>
            </div>
          </div>
          <Switch
            id="sensitive-toggle"
            checked={isR18Mode}
            onCheckedChange={handleR18ToggleClick}
            className={cn(
              "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-pink-500",
              "transition-all duration-300",
            )}
          />
        </div>

        <ConfirmationDialog
          isOpen={isDialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isRememberChoice={isRememberChoice}
          onRememberChoiceChange={setIsRememberChoice}
          checkboxId={checkboxId}
          t={t}
        />
      </>
    )
  }

  // フルバリアント - 詳細設定ページ用
  return (
    <>
      <div className={cn("space-y-6 ", className)}>
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="full-sensitive-toggle">
              {t("R18コンテンツを表示", "Show R18 Content")}
            </Label>
          </div>
          <Switch
            id="full-sensitive-toggle"
            checked={isR18Mode}
            onCheckedChange={handleR18ToggleClick}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-pink-500"
          />
        </div>

        {/* {isR18Mode && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 dark:border-red-800 dark:from-red-950/50 dark:to-pink-950/50">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div>
              <h4 className=" text-red-800 dark:text-red-200">
                {t("R18モード有効", "R18 Mode Active")}
              </h4>
              <p className="text-red-700 text-sm dark:text-red-300">
                {t(
                  "年齢制限のあるコンテンツが表示されています",
                  "Age-restricted content is now visible",
                )}
              </p>
            </div>
          </div>
        )} */}
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isRememberChoice={isRememberChoice}
        onRememberChoiceChange={setIsRememberChoice}
        checkboxId={checkboxId}
        t={t}
      />
    </>
  )
}

// 確認ダイアログコンポーネント
function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  isRememberChoice,
  onRememberChoiceChange,
  checkboxId,
  t,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isRememberChoice: boolean
  onRememberChoiceChange: (checked: boolean) => void
  checkboxId: string
  t: (ja: string, en: string) => string
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-lg border-red-200 dark:border-red-800">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="font-bold text-red-700 text-xl dark:text-red-300">
              {t("年齢確認が必要です", "Age Verification Required")}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 p-4 dark:border-red-800 dark:from-red-950/30 dark:via-pink-950/30 dark:to-rose-950/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="mb-2 font-bold text-red-800 dark:text-red-200">
                    {t("重要な警告", "Important Warning")}
                  </h4>
                  <p className="text-red-700 text-sm leading-relaxed dark:text-red-300">
                    {t(
                      "これから表示されるコンテンツには、18歳未満の方には不適切な内容が含まれる可能性があります。",
                      "The content you are about to view may contain material inappropriate for viewers under 18 years of age.",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                <h5 className="mb-3 font-semibold text-gray-800 dark:text-gray-200">
                  {t("含まれる可能性のある内容", "Content may include")}
                </h5>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-gray-700 text-sm dark:text-gray-300">
                      {t("性的な表現や描写", "Sexual content and depictions")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-gray-700 text-sm dark:text-gray-300">
                      {t("暴力的な表現", "Violent content")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-gray-700 text-sm dark:text-gray-300">
                      {t(
                        "その他成人向けコンテンツ",
                        "Other adult-oriented content",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-center dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
              <p className="font-bold text-gray-900 text-lg dark:text-gray-100">
                {t("あなたは18歳以上ですか？", "Are you 18 years or older?")}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="border-gray-200 border-t pt-4 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <Checkbox
              id={checkboxId}
              checked={isRememberChoice}
              onCheckedChange={(checked) =>
                onRememberChoiceChange(checked === true)
              }
              className="mt-0.5 border-red-300 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
            />
            <label
              htmlFor={checkboxId}
              className="cursor-pointer font-medium text-gray-700 text-sm leading-relaxed dark:text-gray-300"
            >
              {t(
                "この選択を記憶する（30日間、次回から確認をスキップ）",
                "Remember this choice (30 days, skip confirmation next time)",
              )}
            </label>
          </div>
        </div>

        <AlertDialogFooter className="flex-col space-y-4 pt-4">
          <div className="flex w-full gap-3">
            <AlertDialogCancel
              onClick={onCancel}
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
            >
              <span className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                {t("いいえ（18歳未満）", "No (Under 18)")}
              </span>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:from-red-700 hover:to-pink-700"
            >
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {t("はい（18歳以上）", "Yes (18 or older)")}
              </span>
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
