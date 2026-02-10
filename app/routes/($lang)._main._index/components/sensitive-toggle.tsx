import { Eye, EyeOff, Shield } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
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
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import { setCookie } from "~/lib/cookie-utils"
import { cn } from "~/lib/utils"

type Props = {
  variant?: "compact" | "full" | "toggle" | "menu"
  className?: string
  showStatus?: boolean
}

export function SensitiveToggle({
  variant = "compact",
  className,
  showStatus = false,
}: Props) {
  const [isR18Mode, setIsR18Mode] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRememberChoice, setIsRememberChoice] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const locale = useLocale()
  const t = useTranslation()
  const checkboxId = useId()
  const toggleId = useId()
  const fullToggleId = useId()
  const cookieKey = "sensitive-content-confirmed"

  useEffect(() => {
    // URLに"/r"が含まれているかチェック
    setIsR18Mode(/\/r($|\/)/.test(location.pathname))
  }, [location.pathname])

  const performR18Toggle = () => {
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

    navigate(newPathname, { replace: true, preventScrollReset: true })
  }

  const handleR18ToggleClick = () => {
    console.log("R18 button clicked, current mode:", isR18Mode)
    if (isR18Mode) {
      // R18モードをOFFにする場合は直接実行
      performR18Toggle()
    } else {
      // R18モードをONにする場合は必ず確認ダイアログを表示
      console.log("Opening dialog...")
      setIsDialogOpen(true)
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

  // コンパクトバリアント - ヘッダー用（超シンプル）
  if (variant === "compact") {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleR18ToggleClick()
          }}
          className={cn(
            "h-7 w-8 rounded-md p-0 transition-all duration-200",
            isR18Mode
              ? "bg-red-500 text-white hover:bg-red-600"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-400",
            className,
          )}
          title={t("年齢制限コンテンツ", "Age-Restricted Content")}
        >
          <span className="font-medium text-xs">
            {isR18Mode ? "18+" : "18"}
          </span>
        </Button>

        {showStatus && isR18Mode && (
          <div className="hidden items-center gap-1 rounded-md bg-red-100 px-2 py-1 sm:flex dark:bg-red-900/50">
            <div className="h-1 w-1 animate-pulse rounded-full bg-red-500" />
            <span className="font-medium text-red-700 text-xs dark:text-red-300">
              R18
            </span>
          </div>
        )}

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

  // トグルバリアント - スイッチ形式（シンプル）
  if (variant === "toggle") {
    return (
      <>
        <div
          className={cn(
            "flex items-center justify-between rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800",
            className,
          )}
        >
          <Label htmlFor={toggleId} className="cursor-pointer font-medium">
            {t("年齢制限コンテンツ", "Age-Restricted Content")}
          </Label>
          <Switch
            id={toggleId}
            checked={isR18Mode}
            onCheckedChange={handleR18ToggleClick}
            className={cn(
              "data-[state=checked]:bg-red-500",
              "transition-all duration-200",
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

  // メニューバリアント - 横幅いっぱいのメニュー項目
  if (variant === "menu") {
    return (
      <>
        <div
          className={cn(
            "flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
            className,
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg p-2 transition-colors",
                isR18Mode
                  ? "bg-red-100 dark:bg-red-900/50"
                  : "bg-gray-100 dark:bg-gray-700",
              )}
            >
              {isR18Mode ? (
                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-medium text-sm">
                {t("年齢制限コンテンツ", "Age-Restricted Content")}
              </div>
              <div className="text-muted-foreground text-xs">
                {isR18Mode
                  ? t("R18コンテンツが表示されます", "R18 content is visible")
                  : t("R18コンテンツは非表示です", "R18 content is hidden")}
              </div>
            </div>
          </div>
          <Switch
            checked={isR18Mode}
            onCheckedChange={handleR18ToggleClick}
            className={cn(
              "data-[state=checked]:bg-red-500",
              "transition-all duration-200",
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

  // フルバリアント - シンプルな設定項目
  return (
    <>
      <div
        className={cn(
          "rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800",
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <Label
              htmlFor={fullToggleId}
              className="cursor-pointer font-medium"
            >
              {t("年齢制限コンテンツ", "Age-Restricted Content")}
            </Label>
            <p className="mt-1 text-muted-foreground text-sm">
              {isR18Mode
                ? t("R18コンテンツが表示されます", "R18 content is visible")
                : t("R18コンテンツは非表示です", "R18 content is hidden")}
            </p>
          </div>
          <Switch
            id={fullToggleId}
            checked={isR18Mode}
            onCheckedChange={handleR18ToggleClick}
            className="data-[state=checked]:bg-red-500"
          />
        </div>
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
  console.log("ConfirmationDialog render, isOpen:", isOpen)

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-lg border-red-200 dark:border-red-800">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                  <div className="mb-2 font-bold text-red-800 dark:text-red-200">
                    {t("重要な警告", "Important Warning")}
                  </div>
                  <p className="text-red-700 text-sm leading-relaxed dark:text-red-300">
                    {t(
                      "これから表示されるコンテンツには、18歳未満の方には不適切な内容が含まれる可能性があります。",
                      "The content you are about to view may contain material inappropriate for viewers under 18 years of age.",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <div className="mb-2 font-medium text-gray-800 dark:text-gray-200">
                  {t("含まれる可能性のある内容", "Content may include")}:
                </div>
                <ul className="space-y-1 text-gray-700 text-sm dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {t("性的な表現や描写", "Sexual content and depictions")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {t("暴力的な表現", "Violent content")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {t(
                      "その他成人向けコンテンツ",
                      "Other adult-oriented content",
                    )}
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-center dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
              <p className="font-bold text-gray-900 text-lg dark:text-gray-100">
                {t("あなたは18歳以上ですか？", "Are you 18 years or older?")}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="w-full border-gray-200 border-t pt-4 dark:border-gray-700">
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
        <AlertDialogFooter className="flex-col space-y-4">
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
