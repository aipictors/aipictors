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
 * モデレーター向け作品の年齢種別変更ダイアログ
 */
export function ModerationRatingReportDialog(props: Props) {
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
            rating: rating as IntrospectionEnum<"Rating">,
          },
        },
      }).then(async (_result) => {
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
          {"年齢種別を変更して通知する"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"年齢種別を変更して通知する"}</DialogTitle>
        </DialogHeader>
        <h4 className="text-md">{"報告内容"}</h4>
        <Select onValueChange={(value) => setRating(value)}>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{"選択してください"}</SelectLabel>
              <SelectItem value="G">{"全年齢"}</SelectItem>
              <SelectItem value="R15">{"軽度な性的、流血描写あり"}</SelectItem>
              <SelectItem value="R18">{"R18"}</SelectItem>
              <SelectItem value="R18G">{"R18G"}</SelectItem>
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
