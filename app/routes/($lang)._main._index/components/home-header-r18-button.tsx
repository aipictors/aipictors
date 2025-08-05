import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
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
import { useNavigate, useLocation } from "@remix-run/react"
import { useQuery } from "@apollo/client/index"
import { ChevronDown, Settings, AlertTriangle, X, Check } from "lucide-react"
import { useState, useContext, useEffect, useId } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { userBasicSettingQuery } from "~/routes/($lang)._main._index/components/user-navigation-queries"

export function HomeHeaderR18Button() {
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const rememberChoiceId = useId()

  // ユーザー設定を取得
  const { data: userSetting, loading } = useQuery(userBasicSettingQuery, {
    skip: authContext.isNotLoggedIn,
  })

  // 年齢確認ダイアログの状態
  const [showAgeConfirmDialog, setShowAgeConfirmDialog] = useState(false)
  // R18ボタン非表示確認ダイアログの状態
  const [showHideButtonDialog, setShowHideButtonDialog] = useState(false)
  // 年齢確認で「選択を記憶する」のチェックボックス状態
  const [rememberChoice, setRememberChoice] = useState(false)

  // ローカルストレージからの初期設定を読み込み
  const [isR18Hidden, setIsR18Hidden] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isHidden = localStorage.getItem("hideR18Button") === "true"
      setIsR18Hidden(isHidden)
    }
  }, [])

  // R18ボタンを表示するかどうかを判定
  const shouldShowR18Button = () => {
    // 未ログイン時のみローカルストレージの設定をチェック
    if (authContext.isNotLoggedIn) {
      // ローカルストレージでボタンが非表示に設定されているかチェック
      if (isR18Hidden) {
        return false
      }
      // 未ログイン時は常に表示（ローカルストレージで非表示でない限り）
      return true
    }

    // ログイン済みの場合はローカルストレージを無視し、ユーザー設定のみを使用
    // ユーザー設定が読み込み中は表示しない（ダミー状態は親で処理）
    if (loading || !userSetting?.userSetting) {
      return false
    }

    // preferenceRatingがR18またはR18Gの場合のみ表示
    const preferenceRating = userSetting.userSetting.preferenceRating
    return preferenceRating === "R18" || preferenceRating === "R18G"
  }

  // 現在のURLがR18ページかどうかを判定
  const isCurrentlyR18 = location.pathname.startsWith("/r")

  // R18ボタンクリック処理
  const handleR18ButtonClick = () => {
    if (isCurrentlyR18) {
      // 現在R18ページ → 全年齢ページに遷移（/rを削除）
      // R18から全年齢への切り替えは年齢確認不要
      const currentPath = location.pathname
      if (currentPath === "/r") {
        navigate("/")
      } else {
        const pathWithoutR = currentPath.replace(/^\/r/, "")
        navigate(pathWithoutR || "/")
      }
    } else {
      // 現在全年齢ページ → R18ページに遷移（/rを追加）
      if (authContext.isNotLoggedIn) {
        // 未ログイン時は年齢確認ダイアログを表示
        setShowAgeConfirmDialog(true)
      } else {
        // ログイン済みの場合は直接R18ページに遷移
        const currentPath = location.pathname
        navigate(currentPath === "/" ? "/r" : `/r${currentPath}`)
      }
    }
  }

  // 年齢確認ダイアログの確認処理
  const handleAgeConfirm = () => {
    // 選択を記憶する場合はローカルストレージに保存（30日間）
    if (rememberChoice && typeof window !== "undefined") {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)
      localStorage.setItem("ageConfirmed", "true")
      localStorage.setItem("ageConfirmedExpiry", expiryDate.toISOString())
    }

    setShowAgeConfirmDialog(false)
    setRememberChoice(false)

    // 年齢確認後は必ずR18ページに遷移（全年齢→R18のみ）
    const currentPath = location.pathname
    navigate(currentPath === "/" ? "/r" : `/r${currentPath}`)
  }

  // 年齢確認ダイアログのキャンセル処理
  const handleAgeCancel = () => {
    setShowAgeConfirmDialog(false)
    setRememberChoice(false)
  }

  // R18ボタンを非表示にするメニュー項目のクリック処理
  const handleHideButtonClick = () => {
    if (authContext.isNotLoggedIn) {
      // 未ログイン時は確認ダイアログを表示
      setShowHideButtonDialog(true)
    } else {
      // ログイン済みは設定画面へ
      navigate("/settings/restriction")
    }
  }

  // R18ボタンを非表示にする確認処理
  const handleConfirmHideButton = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hideR18Button", "true")
    }
    setIsR18Hidden(true)
    setShowHideButtonDialog(false)
  }

  // R18ボタン非表示ダイアログのキャンセル処理
  const handleCancelHideButton = () => {
    setShowHideButtonDialog(false)
  }

  // R18ボタンを表示するかどうかを判定
  if (!shouldShowR18Button()) {
    return null
  }

  return (
    <>
      <div className="flex">
        {/* R18ボタン本体 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleR18ButtonClick}
          className="rounded-r-none border border-gray-300"
        >
          {isCurrentlyR18 ? "全年齢" : "R18"}
        </Button>

        {/* ドロップダウンメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-l-none border border-gray-300 border-l-0 px-2"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <button
                type="button"
                onClick={handleHideButtonClick}
                className="flex w-full items-center gap-2 text-left"
              >
                <Settings className="h-4 w-4" />
                {authContext.isNotLoggedIn
                  ? "R18ボタンを非表示にする"
                  : "表示設定"}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 年齢確認ダイアログ */}
      <AlertDialog
        open={showAgeConfirmDialog}
        onOpenChange={setShowAgeConfirmDialog}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              年齢確認
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="rounded border border-red-200 bg-red-50 p-3">
                  <p className="font-medium text-red-800 text-sm">
                    ⚠️ 18歳未満の方は閲覧できません
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    以下の内容が含まれる可能性があります：
                  </p>
                  <ul className="ml-4 space-y-1 text-gray-600 text-sm">
                    <li>• 性的な表現を含む内容</li>
                    <li>• 暴力的な表現を含む内容</li>
                    <li>• その他成人向けの内容</li>
                  </ul>
                </div>

                <div className="rounded border bg-gray-50 p-3">
                  <p className="mb-2 font-medium text-gray-900 text-sm">
                    あなたは18歳以上ですか？
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      id={rememberChoiceId}
                      type="checkbox"
                      checked={rememberChoice}
                      onChange={(e) => setRememberChoice(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={rememberChoiceId}
                      className="text-gray-600 text-sm"
                    >
                      この選択を30日間記憶する
                    </label>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={handleAgeCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              いいえ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAgeConfirm}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <Check className="h-4 w-4" />
              はい（18歳以上）
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* R18ボタン非表示確認ダイアログ */}
      <AlertDialog
        open={showHideButtonDialog}
        onOpenChange={setShowHideButtonDialog}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              R18ボタンを非表示にしますか？
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="rounded border border-orange-200 bg-orange-50 p-3">
                  <p className="text-orange-800 text-sm">
                    R18ボタンが一時的に非表示になります
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">
                    この設定はブラウザの一時的な記憶領域に保存されます。
                    ブラウザのデータを削除すると、この設定もリセットされます。
                  </p>
                  <p className="text-gray-600 text-sm">
                    完全な設定管理にはアカウント登録・ログインをお勧めします。
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={handleCancelHideButton}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmHideButton}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Check className="h-4 w-4" />
              非表示にする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
