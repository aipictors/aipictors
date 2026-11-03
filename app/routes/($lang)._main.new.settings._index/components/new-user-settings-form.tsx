import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon, Shield, Eye } from "lucide-react"
import { useContext, useEffect, useState, useId } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { OnboardingSteps } from "~/components/onboarding-steps"
import { cn } from "~/lib/utils"
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

  // 年齢は本人に選んでもらう（選ぶまで次へ進めない。最初から 18 歳以上にはしない）
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

  // 年齢設定が変更された時の処理
  const handleAgeChange = (adult: boolean) => {
    setIsAdult(adult)

    // 18歳未満に変更された場合、すべての制限付きコンテンツをオフにする
    if (!adult) {
      setShowR15InNormalMode(false)
      setShowSensitiveModeToggle(false)
      setShowR18GInSensitiveMode(false)
    }
  }

  const onSubmit = async () => {
    if (isUpdatingUserSetting || authContext.userId === null) {
      return
    }

    let rating: "G" | "R15" | "R18" | "R18G" = "G"

    if (isAdult !== true) {
      rating = "G"
    } else if (showR18GInSensitiveMode) {
      rating = "R18G"
    } else if (showSensitiveModeToggle) {
      rating = "R18"
    } else if (showR15InNormalMode) {
      rating = "R15"
    }

    try {
      await updateUserSetting({
        variables: {
          input: {
            preferenceRating: rating,
            isNotifyComment: isNotifyComment,
          },
        },
      })

      navigate("/settings/completed")
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : t("保存できませんでした。", "Could not save."),
      )
    }
  }

  const toggles = [
    {
      id: showR15Id,
      label: "R-15",
      text: t(
        "軽い暴力表現や扇情的な表現を含む作品",
        "Works with mild violence or suggestive content",
      ),
      checked: showR15InNormalMode,
      onChange: handleR15Toggle,
      disabled: false,
    },
    {
      id: showSensitiveToggleId,
      label: "R-18",
      text: t(
        "成人向けの作品（性的な表現を含む）",
        "Adult works, including sexual content",
      ),
      checked: showSensitiveModeToggle,
      onChange: handleR18Toggle,
      disabled: !showR15InNormalMode,
    },
    {
      id: showR18GId,
      label: "R-18G",
      text: t(
        "極めて過激な表現を含む成人向けの作品",
        "Adult works with extreme content",
      ),
      checked: showR18GInSensitiveMode,
      onChange: setShowR18GInSensitiveMode,
      disabled: !showSensitiveModeToggle,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 px-3 pt-4 pb-28 md:pt-8">
      <OnboardingSteps current={2} />

      <div className="space-y-1">
        <h1 className="font-bold text-2xl">
          {t("表示する作品を選びましょう", "Choose what you see")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t(
            "いつでも設定画面から変えられます。",
            "You can change this anytime in settings.",
          )}
        </p>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-sm">{t("あなたの年齢", "Your age")}</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              [false, t("18歳未満", "Under 18"), Shield],
              [true, t("18歳以上", "18 or older"), Eye],
            ] as const
          ).map(([value, label, Icon]) => (
            <Button
              key={label}
              type="button"
              aria-pressed={isAdult === value}
              variant={isAdult === value ? "default" : "outline"}
              onClick={() => handleAgeChange(value)}
              className="h-12 rounded-xl font-semibold"
            >
              <Icon className="mr-2 size-4" />
              {label}
            </Button>
          ))}
        </div>
        {isAdult === false && (
          <p className="text-muted-foreground text-xs">
            {t(
              "全年齢の作品だけを表示します。",
              "Only all-ages works will be shown.",
            )}
          </p>
        )}
      </div>

      {isAdult && (
        <div className="divide-y rounded-xl border">
          <div className="px-4 py-3">
            <p className="font-medium text-sm">
              {t("全年齢の作品に加えて表示するもの", "Also show")}
            </p>
          </div>
          {toggles.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <Label
                htmlFor={item.id}
                className={cn(
                  "min-w-0 cursor-pointer space-y-0.5",
                  item.disabled && "opacity-50",
                )}
              >
                <span className="block font-semibold">{item.label}</span>
                <span className="block font-normal text-muted-foreground text-xs">
                  {item.text}
                </span>
              </Label>
              <Switch
                id={item.id}
                checked={item.checked}
                disabled={item.disabled}
                onCheckedChange={item.onChange}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <Label
          htmlFor={notifyCommentId}
          className="min-w-0 cursor-pointer space-y-0.5"
        >
          <span className="block font-semibold">
            {t("コメントの通知", "Comment notifications")}
          </span>
          <span className="block font-normal text-muted-foreground text-xs">
            {t(
              "作品にコメントがついたら知らせます",
              "Get notified when someone comments on your work",
            )}
          </span>
        </Label>
        <Switch
          id={notifyCommentId}
          checked={isNotifyComment}
          onCheckedChange={setIsNotifyComment}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-lg">
          <Button
            type="button"
            disabled={isUpdatingUserSetting || isAdult === null}
            onClick={onSubmit}
            className="h-12 w-full rounded-xl font-semibold"
          >
            {isUpdatingUserSetting ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : isAdult === null ? (
              t("年齢を選んでください", "Select your age")
            ) : (
              t("はじめる", "Get started")
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
      id
      preferenceRating
    }
  }
`)
