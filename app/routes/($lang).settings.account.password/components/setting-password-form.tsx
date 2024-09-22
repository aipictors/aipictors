import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ApolloError, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { EyeIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

export function AccountPasswordForm() {
  const t = useTranslation()

  const [newPassword, setNewPassword] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [showNewPassword, setShowNewPassword] = useState(false)

  const [mutation, { loading }] = useMutation(updateAccountPasswordMutation)

  const handleSubmit = async () => {
    try {
      await mutation({
        variables: {
          input: {
            currentPassword: currentPassword,
            newPassword: newPassword,
          },
        },
      })
      setCurrentPassword("")
      setNewPassword("")
      toast(t("パスワードを変更しました", "Password changed successfully"))
    } catch (error) {
      if (error instanceof ApolloError) {
        toast(error.message)
      }
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <p>{t("現在のログインパスワード", "Current Login Password")}</p>
        <div className="flex space-x-2">
          <Input
            placeholder={t(
              "現在のログインパスワード",
              "Current Login Password",
            )}
            value={currentPassword}
            type={showPassword ? "text" : "password"}
            onChange={(event) => {
              setCurrentPassword(event.target.value)
            }}
          />
          <Button
            aria-label="-"
            size={"icon"}
            onClick={() => {
              setShowPassword(!showPassword)
            }}
          >
            <EyeIcon />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <p>{t("新しいログインパスワード", "New Login Password")}</p>
        <div className="flex space-x-2">
          <Input
            placeholder={t("新しいログインパスワード", "New Login Password")}
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value)
            }}
          />
          <Button
            aria-label="-"
            size={"icon"}
            onClick={() => {
              setShowNewPassword(!showNewPassword)
            }}
          >
            <EyeIcon />
          </Button>
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        {t("変更を保存", "Save Changes")}
      </Button>
    </div>
  )
}

const updateAccountPasswordMutation = graphql(
  `mutation UpdateAccountPassword($input: UpdateAccountPasswordInput!) {
    updateAccountPassword(input: $input) {
      id
    }
  }`,
)
