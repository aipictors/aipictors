import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useMutation } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
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
export function StickerChangeAccessTypeActionDialog(props: Props) {
  const authContext = useContext(AuthContext)

  const [updateSticker, { loading: isChangeStickerAccessType }] = useMutation(
    updateStickerMutation,
  )

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

    await updateSticker({
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
        <Link className="m-auto w-24" to={`/stickers/${props.stickerId}`}>
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
              <label htmlFor="person-check">
                {"人物"}
                <RadioGroupItem value="CHARACTER" id="person-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="animal-check">
                {"動物"}
                <RadioGroupItem value="ANIMAL" id="animal-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="machine-check">
                {"機械"}
                <RadioGroupItem value="MACHINE" id="machine-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="background-check">
                {"背景"}
                <RadioGroupItem value="BACKGROUND" id="background-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="object-check">
                {"物"}
                <RadioGroupItem value="OBJECT" id="object-check" />
              </label>
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
              <label htmlFor="happy-check">
                {"楽しい"}
                <RadioGroupItem value="楽しい" id="happy-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="enjoy-check">
                {"嬉しい"}
                <RadioGroupItem value="嬉しい" id="enjoy-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="celebration-check">
                {"お祝い"}
                <RadioGroupItem value="お祝い" id="celebration-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="sad-check">
                {"悲しい"}
                <RadioGroupItem value="悲しい" id="sad-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="other-check">
                {"その他"}
                <RadioGroupItem value="その他" id="other-check" />
              </label>
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

const updateStickerMutation = graphql(
  `mutation updateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
    }
  }`,
)
