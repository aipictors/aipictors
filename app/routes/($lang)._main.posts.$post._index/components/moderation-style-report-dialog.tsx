import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { FlagIcon } from "lucide-react"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { useMutation } from "@apollo/client/index"
import { useContext, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  postId: string
}

/**
 * モデレーター向け作品のテイスト変更ダイアログ
 */
export function ModerationStyleReportDialog(props: Props) {
  const [rating, setRating] = useState("")

  const [mutation, { loading: isLoading }] = useMutation(
    ChangeWorkSettingsWithAdminMutation,
  )

  const authContext = useContext(AuthContext)

  const onReport = async () => {
    try {
      if (authContext.isNotLoggedIn) {
        toast("ログインしてください")
        return
      }

      if (rating === "") {
        toast("報告内容を選択してください")
        return
      }

      await mutation({
        variables: {
          input: {
            workId: props.postId,
            imageStyle: rating as IntrospectionEnum<"ImageStyle">,
          },
        },
      }).then(async (result) => {
        toast("報告いたしました、ご協力ありがとうございます。")
      })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" variant="outline">
          <FlagIcon />
          {"年齢種別を変更して報告する"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"年齢種別を変更して報告する"}</DialogTitle>
        </DialogHeader>
        <h4 className="text-md">{"報告内容"}</h4>
        <Select onValueChange={(value) => setRating(value)}>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{"選択してください"}</SelectLabel>
              <SelectItem value="ILLUSTRATION">{"イラスト"}</SelectItem>
              <SelectItem value="SEMI_REAL">{"セミリアル"}</SelectItem>
              <SelectItem value="REAL">{"リアル"}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onReport} disabled={isLoading}>
              {"送信"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ChangeWorkSettingsWithAdminMutation = graphql(
  `mutation ChangeWorkSettingsWithAdmin($input: WorkSettingsWithAdminInput!) {
    changeWorkSettingsWithAdmin(input: $input)
  }`,
)
