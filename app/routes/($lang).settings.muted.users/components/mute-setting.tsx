import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { SettingsSaveBar } from "~/routes/($lang).settings/components/settings-save-bar"
import {
  SettingsSection,
  SettingsSwitchRow,
} from "~/routes/($lang).settings/components/settings-section"

export function MuteSetting() {
  const appContext = useContext(AuthContext)

  const { data: settingData } = useSuspenseQuery(userSettingQuery, {
    skip: appContext.isLoading,
  })

  const [form, setForm] = useState({
    works: false,
    comments: false,
  })

  useEffect(() => {
    if (settingData?.userSetting) {
      const { isShowingMutedUsersWorks, isShowingMutedUsersComments } =
        settingData.userSetting
      const works =
        typeof isShowingMutedUsersWorks === "boolean"
          ? isShowingMutedUsersWorks
          : false
      const comments =
        typeof isShowingMutedUsersComments === "boolean"
          ? isShowingMutedUsersComments
          : false

      setForm({
        works,
        comments,
      })
    }
  }, [settingData])

  /** Mutations ***********************************************/
  const [updateSetting, { loading: isUpdating }] = useMutation(
    updateUserSettingMutation,
  )

  /****************************
   * Event Handlers
   ***************************/

  const handleChange = (key: "works" | "comments") => (checked: boolean) => {
    setForm((prev) => ({ ...prev, [key]: checked }))
  }

  const handleUpdate = async () => {
    try {
      await updateSetting({
        variables: {
          input: {
            isShowingMutedUsersComments: form.comments,
            isShowingMutedUsersWorks: form.works,
          },
        },
      })
      // 以前は保存しても何も出なかった
      toast("保存しました")
    } catch (error) {
      toast(
        error instanceof Error && error.message
          ? error.message
          : "保存できませんでした",
      )
    }
  }

  /****************************
   * Render
   ***************************/

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-muted/40 p-4 text-sm leading-6">
        <p className="font-medium">ミュートとブロックの違い</p>
        <p className="mt-1 text-muted-foreground">
          ミュートは自分の画面だけで表示を減らす機能です。検索結果・タグ経由の作品一覧・コメント欄のスタンプやコメント・スタンプ広場などで相手を見えにくくできます。ブロックはそれに加えて、相互の交流自体を強く制限します。
        </p>
      </div>
      <SettingsSection title="ミュートしたユーザの表示">
        <div className="divide-y">
          <SettingsSwitchRow
            htmlFor="mute-show-works"
            title="ミュートしたユーザの作品を表示する"
            description="検索結果、タグ経由の作品一覧、スタンプ広場などでミュートしたユーザの投稿を表示するか切り替えます。"
          >
            <Switch
              id="mute-show-works"
              checked={form.works}
              onCheckedChange={handleChange("works")}
            />
          </SettingsSwitchRow>
          <SettingsSwitchRow
            htmlFor="mute-show-comments"
            title="ミュートしたユーザのコメントを表示する"
            description="コメント欄のコメントやスタンプ付きコメントを表示するか切り替えます。表示する場合は、最初は隠した状態で出ます。非表示にするとミュートしたユーザの反応は一覧に出ません。"
          >
            <Switch
              id="mute-show-comments"
              checked={form.comments}
              onCheckedChange={handleChange("comments")}
            />
          </SettingsSwitchRow>
        </div>
      </SettingsSection>
      <SettingsSaveBar
        isSaving={isUpdating}
        onSave={() => void handleUpdate()}
      />
    </div>
  )
}

const userSettingQuery = graphql(`
  query UserSetting {
    userSetting {
      isShowingMutedUsersComments
      isShowingMutedUsersWorks
    }
  }
`)

const updateUserSettingMutation = graphql(`
  mutation UpdateUserSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      isShowingMutedUsersComments
      isShowingMutedUsersWorks
    }
  }
`)
