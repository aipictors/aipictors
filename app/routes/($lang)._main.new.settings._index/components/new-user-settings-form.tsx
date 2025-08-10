import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon, Shield, Eye, Heart } from "lucide-react"
import { useContext, useEffect, useState, useId } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { useNavigate } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 新しいユーザー設定フォーム
 */
export function NewUserSettingsForm() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()

  // Dynamic IDs
  const showR15Id = useId()
  const showSensitiveToggleId = useId()
  const showR18GId = useId()
  const notifyCommentId = useId()

  const { data: userSettingData } = useQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading: isUpdatingUserSetting }] = useMutation(
    updateUserSettingMutation,
  )

  const preferenceRating = userSettingData?.userSetting?.preferenceRating

  // 年齢確認状態
  const [isAdult, setIsAdult] = useState<boolean | null>(null)

  // 設定状態
  const [showR15InNormalMode, setShowR15InNormalMode] = useState(false)
  const [showSensitiveModeToggle, setShowSensitiveModeToggle] = useState(false)
  const [showR18GInSensitiveMode, setShowR18GInSensitiveMode] = useState(false)
  const [isNotifyComment, setIsNotifyComment] = useState(
    userSettingData?.userSetting?.isNotifyComment ?? true,
  )

  // 設定の初期化
  useEffect(() => {
    if (preferenceRating) {
      if (preferenceRating === "G") {
        setShowR15InNormalMode(false)
        setShowSensitiveModeToggle(false)
        setShowR18GInSensitiveMode(false)
      } else if (preferenceRating === "R15") {
        setShowR15InNormalMode(true)
        setShowSensitiveModeToggle(false)
        setShowR18GInSensitiveMode(false)
      } else if (preferenceRating === "R18") {
        setShowR15InNormalMode(true)
        setShowSensitiveModeToggle(true)
        setShowR18GInSensitiveMode(false)
      } else if (preferenceRating === "R18G") {
        setShowR15InNormalMode(true)
        setShowSensitiveModeToggle(true)
        setShowR18GInSensitiveMode(true)
      }
    }
  }, [preferenceRating])

  // R15トグルが変更された時の処理
  const handleR15Toggle = (checked: boolean) => {
    setShowR15InNormalMode(checked)
    if (!checked) {
      // R15がオフになったらR18も自動的にオフにする
      setShowSensitiveModeToggle(false)
      setShowR18GInSensitiveMode(false)
    }
  }

  // R18トグルが変更された時の処理
  const handleR18Toggle = (checked: boolean) => {
    setShowSensitiveModeToggle(checked)
    if (!checked) {
      // R18がオフになったらR18Gも自動的にオフにする
      setShowR18GInSensitiveMode(false)
    }
  }

  const onSubmit = async () => {
    if (isUpdatingUserSetting || authContext.userId === null) {
      return
    }

    let rating: "G" | "R15" | "R18" | "R18G" = "G"

    if (showR18GInSensitiveMode) {
      rating = "R18G"
    } else if (showSensitiveModeToggle) {
      rating = "R18"
    } else if (showR15InNormalMode) {
      rating = "R15"
    }

    await updateUserSetting({
      variables: {
        input: {
          preferenceRating: rating,
          isNotifyComment: isNotifyComment,
        },
      },
    })

    toast(t("設定を更新しました。", "Settings updated."))
    navigate("/settings/completed")
  }

  // 年齢確認が完了していない場合
  if (isAdult === null) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        {/* ウェルカムセクション */}
        <div className="rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 p-8 dark:border-gray-700 dark:from-blue-900/30 dark:to-purple-900/30">
          <div className="space-y-4 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-100">
              {t("表示設定", "Display Settings")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t(
                "あなたに適した表示設定を行います",
                "Configure display settings that suit you",
              )}
            </p>
          </div>
        </div>

        {/* 年齢確認セクション */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-6 text-center">
            <Shield className="mx-auto size-16 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {t("年齢確認", "Age Verification")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t(
                "適切なコンテンツを表示するため、年齢をお聞かせください",
                "Please confirm your age for appropriate content display",
              )}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setIsAdult(false)}
                variant="outline"
                className="h-16 flex-1 text-lg"
              >
                {t("18歳未満", "Under 18")}
              </Button>
              <Button
                onClick={() => setIsAdult(true)}
                variant="outline"
                className="h-16 flex-1 text-lg"
              >
                {t("18歳以上", "18 or older")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* ウェルカムセクション */}
      <div className="rounded-xl border border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 p-8 dark:border-gray-700 dark:from-green-900/30 dark:to-blue-900/30">
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {t("表示設定の説明", "Display Settings Explanation")}
          </h1>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/30">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {isAdult ? (
                <span className="flex items-center gap-2">
                  <Eye className="size-4" />
                  {t(
                    "18歳以上の方は、すべてのコンテンツ設定が利用できます",
                    "Users 18 and older can access all content settings",
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="size-4" />
                  {t(
                    "18歳未満の方は、適切なコンテンツのみ表示されます",
                    "Users under 18 will only see appropriate content",
                  )}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* コンテンツレーティング説明 */}
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {t("コンテンツレーティングについて", "About Content Ratings")}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Gレーティング */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-600 dark:bg-green-900/30">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                  G
                </span>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  {t("全年齢対象", "General Audiences")}
                </h3>
              </div>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                {t(
                  "誰でも安心して見ることができる健全なコンテンツ",
                  "Safe content that anyone can view with confidence",
                )}
              </p>
            </div>

            {/* R15レーティング */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/30">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-yellow-500 font-bold text-white">
                  15
                </span>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  {t("15歳以上推奨", "15+ Recommended")}
                </h3>
              </div>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {t(
                  "軽度な暴力表現や扇情的な表現を含む可能性があります",
                  "May contain mild violence or suggestive content",
                )}
              </p>
            </div>

            {/* R18・R18Gレーティング（18歳以上のみ表示） */}
            {isAdult && (
              <>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/30">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                      18
                    </span>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">
                      {t("18歳以上限定", "18+ Only")}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {t(
                      "成人向けコンテンツ（性的表現を含む）",
                      "Adult content (including sexual expressions)",
                    )}
                  </p>
                </div>

                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-600 dark:bg-purple-900/30">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-purple-500 font-bold text-white">
                      G
                    </span>
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                      {t("R18G", "R18G")}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {t(
                      "極めて過激な表現を含む成人向けコンテンツ",
                      "Adult content with extremely explicit expressions",
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 表示設定 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {t("表示するコンテンツを選択", "Select Content to Display")}
        </h2>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={showR15Id}
                checked={showR15InNormalMode}
                onCheckedChange={handleR15Toggle}
                disabled={!isAdult && !showR15InNormalMode}
              />
              <Label htmlFor={showR15Id} className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                  15
                </span>
                {t("R15コンテンツを表示", "Show R15 content")}
              </Label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t(
                "軽度な暴力表現や扇情的な表現を含むコンテンツを表示します",
                "Shows content with mild violence or suggestive expressions",
              )}
            </p>
          </div>

          {isAdult && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={showSensitiveToggleId}
                    checked={showSensitiveModeToggle}
                    onCheckedChange={handleR18Toggle}
                    disabled={!showR15InNormalMode}
                  />
                  <Label
                    htmlFor={showSensitiveToggleId}
                    className="flex items-center gap-2"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      18
                    </span>
                    {t("R18コンテンツを表示", "Show R18 content")}
                  </Label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t(
                    "成人向けコンテンツを表示します（性的表現を含む）",
                    "Shows adult content (including sexual expressions)",
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={showR18GId}
                    checked={showR18GInSensitiveMode}
                    onCheckedChange={setShowR18GInSensitiveMode}
                    disabled={!showSensitiveModeToggle}
                  />
                  <Label
                    htmlFor={showR18GId}
                    className="flex items-center gap-2"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                      G
                    </span>
                    {t("R18Gコンテンツを表示", "Show R18G content")}
                  </Label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t(
                    "極めて過激な表現を含む成人向けコンテンツを表示します",
                    "Shows adult content with extremely explicit expressions",
                  )}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={notifyCommentId}
                checked={isNotifyComment}
                onCheckedChange={setIsNotifyComment}
              />
              <Label
                htmlFor={notifyCommentId}
                className="flex items-center gap-2"
              >
                <Heart className="size-4" />
                {t("コメント通知を受け取る", "Receive comment notifications")}
              </Label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t(
                "作品にコメントがついた時に通知を受け取ります",
                "Receive notifications when your works receive comments",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 完了ボタン */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-600 dark:bg-green-900/30">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            {t("設定完了", "Settings Complete")}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {t(
              "これでAipictorsをお楽しみいただけます",
              "You can now enjoy Aipictors",
            )}
          </p>
          <Button
            disabled={isUpdatingUserSetting}
            onClick={onSubmit}
            className="h-12 w-full rounded-lg bg-green-600 text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {isUpdatingUserSetting ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="size-5 animate-spin" />
                {t("保存中...", "Saving...")}
              </div>
            ) : (
              t("設定を完了する", "Complete Settings")
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const userSettingQuery = graphql(`
  query UserSetting {
    userSetting {
      id
      userId
      preferenceRating
      isNotifyComment
    }
  }
`)

const updateUserSettingMutation = graphql(`
  mutation UpdateUserSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      preferenceRating
    }
  }
`)
