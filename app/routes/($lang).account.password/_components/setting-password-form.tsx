import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { updateAccountPasswordMutation } from "@/_graphql/mutations/update-account-password"
import { ApolloError, useMutation } from "@apollo/client/index"
import { EyeIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const AccountPasswordForm = () => {
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
      toast("パスワードを変更しました")
    } catch (error) {
      if (error instanceof ApolloError) {
        toast(error.message)
      }
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p>{"現在のログインパスワード"}</p>
        <div className="flex space-x-2">
          <Input
            placeholder="現在のログインパスワード"
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
        <p>{"新しいログインパスワード"}</p>
        <div className="flex space-x-2">
          <Input
            placeholder="新しいログインパスワード"
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
        {/* <Stack spacing={1}>
            <Progress value={80} borderRadius={"full"} />
            <Text fontSize={"xs"}>
              {"パスワード強度スコアが3以上（バーが黄色～緑色）"}
            </Text>
          </Stack> */}
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        {"変更を保存"}
      </Button>
    </div>
  )
}
