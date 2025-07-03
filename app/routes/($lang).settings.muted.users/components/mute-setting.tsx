import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Loader2Icon } from "lucide-react"

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

  const handleChange =
    (key: "works" | "comments") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.checked }))
    }

  const handleUpdate = async () => {
    await updateSetting({
      variables: {
        input: {
          isShowingMutedUsersComments: form.comments,
          isShowingMutedUsersWorks: form.works,
        },
      },
    })
  }

  /****************************
   * Render
   ***************************/

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded border p-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={form.works}
            onChange={handleChange("works")}
          />
          <span>ミュートしたユーザの作品を表示する</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={form.comments}
            onChange={handleChange("comments")}
          />
          <span>ミュートしたユーザのコメントを表示する</span>
          <span>
            ※ 表示する場合はデフォルトは隠しが入った状態で表示されます
          </span>
        </label>

        <Button
          className="mt-2 w-24"
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2Icon className="m-auto size-4 animate-spin" />
          ) : (
            "設定を更新"
          )}
        </Button>
      </div>
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
