import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"
import { Input } from "@/_components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/_components/ui/radio-group"
import { AuthContext } from "@/_contexts/auth-context"
import { changeUserStickerAccessTypeMutation } from "@/_graphql/mutations/change-user-sticker-access-type"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { useMutation } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { Loader2Icon } from "lucide-react"
import React, { useContext, useState } from "react"
import { toast } from "sonner"
type Props = {
  title: string
  stickerId: string
  imageUrl: string
  children: React.ReactNode
  accessType: "PUBLIC" | "PRIVATE"
  onAccessTypeChange(): void
}

/**
 * スタンプ公開状態変更ダイアログ
 */
export const StickerChangeAccessTypeActionDialog = (props: Props) => {
  const authContext = useContext(AuthContext)

  const [changeUserStickerAccessType, { loading: isChangeStickerAccessType }] =
    useMutation(changeUserStickerAccessTypeMutation)

  const [accessType, setAccessType] = React.useState(props.accessType)

  const [title, setTitle] = useState("")

  const [genre, setGenre] = useState("CHARACTER")

  const [tag, setTag] = useState("")

  const onChangePublic = async () => {
    if (authContext.isLoading || authContext.isNotLoggedIn) {
      toast("ログインしてください")
      return
    }

    if (title === "") {
      toast("タイトルを入力してください")
      return
    }

    if (tag === "") {
      toast("タグを選択してください")
      return
    }

    await changeUserStickerAccessType({
      variables: {
        input: {
          stickerId: props.stickerId,
          accessType: "PUBLIC",
          title: title,
          genre: genre as IntrospectionEnum<"StickerGenre">,
          categories: [tag],
        },
      },
    })
    toast("公開しました")
    setAccessType("PUBLIC")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>スタンプを公開する</DialogTitle>
        </DialogHeader>
        <Link
          className="m-auto w-24"
          to={`https://www.aipictors.com/stamp/?id=${props.stickerId}`}
        >
          <img
            className="m-auto mb-2 w-24 cursor-pointer duration-500 hover:scale-105"
            src={props.imageUrl}
            alt={props.title}
          />
        </Link>
        <div className="space-y-2">
          <p className="mt-2">タイトル</p>
          <Input
            onChange={(event) => {
              setTitle(event.target.value)
            }}
            value={title}
            placeholder="タイトル"
          />
          <p>ジャンル</p>
          <RadioGroup
            value={genre}
            onValueChange={(value) => {
              setGenre(value)
            }}
            className="flex items-center space-x-2"
          >
            <div className="items-center space-x-2">
              <RadioGroupItem value="CHARACTER" id="person-check" />
              <label htmlFor="person-check">{"人物"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="ANIMAL" id="animal-check" />
              <label htmlFor="animal-check">{"動物"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="MACHINE" id="machine-check" />
              <label htmlFor="machine-check">{"機械"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="BACKGROUND" id="background-check" />
              <label htmlFor="background-check">{"背景"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="OBJECT" id="object-check" />
              <label htmlFor="object-check">{"物"}</label>
            </div>
          </RadioGroup>
          <p>タグ</p>
          <RadioGroup
            value={tag.toString()}
            onValueChange={(value) => {
              setTag(value)
            }}
            className="flex items-center space-x-2"
          >
            <div className="items-center space-x-2">
              <RadioGroupItem value="楽しい" id="happy-check" />
              <label htmlFor="happy-check">{"楽しい"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="嬉しい" id="enjoy-check" />
              <label htmlFor="enjoy-check">{"嬉しい"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="お祝い" id="celebration-check" />
              <label htmlFor="celebration-check">{"お祝い"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="悲しい" id="sad-check" />
              <label htmlFor="sad-check">{"悲しい"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="その他" id="other-check" />
              <label htmlFor="other-check">{"その他"}</label>
            </div>
          </RadioGroup>
          <DialogFooter>
            {accessType === "PRIVATE" ? (
              <Button className="w-full" onClick={onChangePublic}>
                {isChangeStickerAccessType ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span>{"公開する"}</span>
                )}
              </Button>
            ) : (
              <Button disabled={true} className="w-full">
                {"公開済み"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
