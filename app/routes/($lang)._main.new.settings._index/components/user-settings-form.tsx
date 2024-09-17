import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { useNavigate } from "@remix-run/react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

/**
 * プロフィール設定フォーム
 */
export function UserSettingsForm() {
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()

  const { data: userSettingData } = useQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading: isUpdatingUserSetting }] = useMutation(
    updateUserSettingMutation,
  )

  // コンテンツ年齢設定用の状態変数
  const [showR15InNormalMode, setShowR15InNormalMode] = useState(false)
  const [showSensitiveModeToggle, setShowSensitiveModeToggle] = useState(false)
  const [showR18GInSensitiveMode, setShowR18GInSensitiveMode] = useState(false)

  // 18歳以上かどうかの確認用状態変数
  const [isAdult, setIsAdult] = useState<string | null>(null)

  // その他の設定用の状態変数
  const [isAnonymousLike, setIsAnonymousLike] = useState(false)
  const [isAnonymousSensitiveLike, setIsAnonymousSensitiveLike] =
    useState(false)
  const [isNotifyComment, setIsNotifyComment] = useState(false)

  useEffect(() => {
    const userSetting = userSettingData?.userSetting

    if (userSetting) {
      // preferenceRating に基づいて初期値を設定
      const preferenceRating = userSetting.preferenceRating

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

      // 18歳以上かどうかの確認
      setIsAdult(
        userSetting.preferenceRating === "G" ||
          userSetting.preferenceRating === "R15"
          ? "YES"
          : "NO",
      )

      // その他の設定を初期化
      setIsAnonymousLike(userSetting.isAnonymousLike ?? false)
      setIsAnonymousSensitiveLike(userSetting.isAnonymousSensitiveLike ?? false)
      setIsNotifyComment(userSetting.isNotifyComment ?? false)
    }
  }, [userSettingData])

  const onSave = async () => {
    if (!isAdult) {
      toast("18歳以上かどうかを選択してください")
      return
    }

    // チェックボックスの選択状態に基づいて preferenceRating を決定
    let preferenceRating: IntrospectionEnum<"PreferenceRating"> = "G"

    if (showSensitiveModeToggle) {
      if (showR18GInSensitiveMode) {
        preferenceRating = "R18G"
      } else {
        preferenceRating = "R18"
      }
    } else {
      if (showR15InNormalMode) {
        preferenceRating = "R15"
      } else {
        preferenceRating = "G"
      }
    }

    await updateUserSetting({
      variables: {
        input: {
          isAnonymousLike,
          isAnonymousSensitiveLike,
          isNotifyComment,
          preferenceRating,
        },
      },
    })

    toast("保存しました")
    navigate("/settings/completed")
  }

  return (
    <div className="container m-auto space-y-4">
      <p className="font-bold">{"あなたは18歳以上ですか？"}</p>
      <div className="flex space-x-2">
        <Button
          variant={isAdult === "YES" ? "default" : "secondary"}
          onClick={() => setIsAdult("YES")}
        >
          YES
        </Button>
        <Button
          variant={isAdult === "NO" ? "default" : "secondary"}
          onClick={() => {
            setIsAdult("NO")
            // 18歳未満の場合、R18やR18Gの設定を無効化
            setShowSensitiveModeToggle(false)
            setShowR18GInSensitiveMode(false)
          }}
        >
          NO
        </Button>
      </div>
      {isAdult && (
        <>
          {/* コンテンツ年齢設定 */}
          <div className="space-y-4">
            <p className="font-bold">{"表示するコンテンツの年齢設定"}</p>
            <p className="text-sm">
              {
                "表示するコンテンツの年齢制限を設定できます。一部ページでは反映されないのでご注意ください。"
              }
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex w-full items-center justify-between">
                <Label htmlFor="show-r15">
                  {"(通常モード時)R15作品を表示する"}
                </Label>
                <Switch
                  onCheckedChange={setShowR15InNormalMode}
                  checked={showR15InNormalMode}
                  id="show-r15"
                  disabled={showSensitiveModeToggle} // センシティブモードが有効な場合は無効化
                />
              </div>
              <div className="flex w-full items-center justify-between">
                <Label htmlFor="show-sensitive-toggle">
                  {"センシティブモード切り替えボタンをメニューに表示する"}
                </Label>
                <Switch
                  onCheckedChange={(checked) => {
                    setShowSensitiveModeToggle(checked)
                    if (checked) {
                      // センシティブモードを有効にしたら R15 を表示
                      setShowR15InNormalMode(true)
                    } else {
                      // センシティブモードを無効にしたら R18G の表示を無効化
                      setShowR18GInSensitiveMode(false)
                    }
                  }}
                  checked={showSensitiveModeToggle}
                  id="show-sensitive-toggle"
                  disabled={isAdult !== "YES"} // 18歳未満はセンシティブモードを有効にできない
                />
              </div>
              <div className="flex w-full items-center justify-between">
                <Label htmlFor="show-r18g">
                  {"(センシティブモード時)R18G作品を表示する"}
                </Label>
                <Switch
                  onCheckedChange={setShowR18GInSensitiveMode}
                  checked={showR18GInSensitiveMode}
                  id="show-r18g"
                  disabled={!showSensitiveModeToggle} // センシティブモードが無効な場合は無効化
                />
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* 匿名いいね設定 */}
      <p className="font-bold">{"匿名いいね"}</p>
      <p className="text-sm">
        {
          "いいねしたときに、投稿者へ自身がいいねしたことを通知するかどうか変更できます"
        }
      </p>
      <p className="text-sm">
        {
          "匿名いいねに関わらず、いいねした作品は投稿者以外、閲覧することはできません"
        }
      </p>
      <div className="flex justify-between">
        <label
          htmlFor="anonymous-like"
          className="font-medium text-sm leading-none"
        >
          {"全年齢作品を匿名でいいねする"}
        </label>
        <Switch
          onCheckedChange={setIsAnonymousLike}
          checked={isAnonymousLike}
          id="anonymous-like"
        />
      </div>
      <div className="flex justify-between">
        <label
          htmlFor="anonymous-sensitive-like"
          className="font-medium text-sm leading-none"
        >
          {"センシティブ作品を匿名でいいねする"}
        </label>
        <Switch
          onCheckedChange={setIsAnonymousSensitiveLike}
          checked={isAnonymousSensitiveLike}
          id="anonymous-sensitive-like"
        />
      </div>
      <Separator />

      {/* 保存ボタン */}
      <Button
        onClick={onSave}
        disabled={isUpdatingUserSetting}
        className="ml-auto block w-full text-center"
      >
        {isUpdatingUserSetting ? (
          <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
        ) : (
          "完了"
        )}
      </Button>
    </div>
  )
}

const userSettingQuery = graphql(`
  query UserSetting {
    userSetting {
      id
      userId
      preferenceRating
      isAnonymousLike
      isAnonymousSensitiveLike
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
