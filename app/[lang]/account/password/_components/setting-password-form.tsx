"use client"

import type {
  UpdateAccountPasswordMutation,
  UpdateAccountPasswordMutationVariables,
} from "@/__generated__/apollo"
import { UpdateAccountPasswordDocument } from "@/__generated__/apollo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ApolloError, useMutation } from "@apollo/client"
import { Eye } from "lucide-react"
import { useState } from "react"

export const AccountPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [showNewPassword, setShowNewPassword] = useState(false)

  const { toast } = useToast()

  const [mutation, { loading }] = useMutation<
    UpdateAccountPasswordMutation,
    UpdateAccountPasswordMutationVariables
  >(UpdateAccountPasswordDocument)

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
      toast({ title: "パスワードを変更しました" })
    } catch (error) {
      if (error instanceof ApolloError) {
        toast({ title: error.message })
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
            <Eye />
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
            <Eye />
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
