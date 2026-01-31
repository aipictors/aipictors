import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import {
  ApolloError,
  useMutation,
  useSuspenseQuery,
} from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

/* ────────────────────────────────
 *  ユーザ ID バリデーション
 *    - 半角英字を 1 文字以上含む
 *    - 使用できる文字は a-z / A-Z / 0-9 / _ / -
 *    - WordPress が弾く記号（空白や @!# など）は不可
 * ──────────────────────────────── */
const isValidLogin = (login: string): boolean => {
  const allowedChars = /^[A-Za-z0-9_-]+$/
  const hasAlphabet = /[A-Za-z]/
  return allowedChars.test(login) && hasAlphabet.test(login)
}

export function AccountLoginForm () {
  const appContext = useContext(AuthContext)
  const t = useTranslation()

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip: appContext.isLoading,
  })

  const [userId, setUserId] = useState("")
  const [mutation, { loading }] = useMutation(updateAccountLoginMutation)

  const handleSubmit = async () => {
    if (!isValidLogin(userId)) {
      toast(
        t(
          "ユーザIDは半角英字を含み、英数字・「_」「-」のみ使用可能です",
          "User ID must contain letters and may only use a-z, 0-9, _ or -",
        ),
      )
      return
    }

    try {
      await mutation({
        variables: {
          input: { login: userId },
        },
      })
      setUserId("")
      toast(t("ユーザIDを変更しました", "User ID updated successfully"))
    } catch (error) {
      if (error instanceof ApolloError) {
        toast(t("ユーザIDの変更に失敗しました", "Failed to update User ID"))
      }
    }
  }

  const isIdValid = userId === "" || isValidLogin(userId)

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <p>{t("現在のユーザID", "Current User ID")}</p>
        <Input
          readOnly
          value={data?.viewer?.user?.login}
          placeholder={t("ユーザID", "User ID")}
        />
      </div>

      <div className="space-y-2">
        <p>{t("新しいユーザID", "New User ID")}</p>
        <Input
          value={userId}
          placeholder={t("ユーザID", "User ID")}
          onChange={(e) => setUserId(e.target.value)}
          /* 無効時は枠線を赤くするなど UI で即時フィードバック */
          className={!isIdValid ? "border-red-500 focus:ring-red-500" : ""}
          /* ブラウザ側でも最低限の制約を掛ける */
          pattern="[A-Za-z0-9_-]+"
          title={t(
            "半角英字を含み、英数字・アンダースコア・ハイフンのみ使用可",
            "Must contain letters; only a-z, 0-9, _ or - allowed",
          )}
        />
      </div>

      <Button
        disabled={loading || !isValidLogin(userId)}
        onClick={handleSubmit}
      >
        {t("変更を保存", "Save Changes")}
      </Button>
    </div>
  )
}

const viewerUserQuery = graphql(/* GraphQL */ `
  query ViewerUser {
    viewer {
      id
      user {
        id
        login
      }
    }
  }
`)

const updateAccountLoginMutation = graphql(/* GraphQL */ `
  mutation UpdateAccountLogin($input: UpdateAccountLoginInput!) {
    updateAccountLogin(input: $input) {
      id
      login
    }
  }
`)
