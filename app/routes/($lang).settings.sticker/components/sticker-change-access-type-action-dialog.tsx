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
import { useTranslation } from "~/hooks/use-translation"

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
  const t = useTranslation()

  const [updateSticker, { loading: isChangeStickerAccessType }] = useMutation(
    updateStickerMutation,
  )

  const [accessType, setAccessType] = React.useState(props.accessType)

  const [title, setTitle] = useState("")

  const [genre, setGenre] = useState("CHARACTER")

  const [tag, setTag] = useState("")

  const onChangePublic = async () => {
    if (authContext.isLoading || authContext.isNotLoggedIn) {
      toast(t("ログインしてください", "Please log in"))
      return
    }

    if (title === "") {
      toast(t("タイトルを入力してください", "Please enter a title"))
      return
    }

    if (tag === "") {
      toast(t("タグを選択してください", "Please select a tag"))
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
    toast(t("公開しました", "Successfully made public"))
    setAccessType("PUBLIC")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("スタンプを公開する", "Make Sticker Public")}
          </DialogTitle>
        </DialogHeader>
        <Link className="m-auto w-24" to={`/stickers/${props.stickerId}`}>
          <img
            className="m-auto mb-2 w-24 cursor-pointer duration-500 hover:scale-105"
            src={props.imageUrl}
            alt={props.title}
          />
        </Link>
        <div className="space-y-2">
          <p className="mt-2">{t("タイトル", "Title")}</p>
          <Input
            onChange={(event) => {
              setTitle(event.target.value)
            }}
            value={title}
            placeholder={t("タイトル", "Title")}
          />
          <p>{t("ジャンル", "Genre")}</p>
          <RadioGroup
            value={genre}
            onValueChange={(value) => {
              setGenre(value)
            }}
            className="flex items-center space-x-2"
          >
            <div className="items-center space-x-2">
              <label htmlFor="person-check">
                {t("人物", "Character")}
                <RadioGroupItem value="CHARACTER" id="person-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="animal-check">
                {t("動物", "Animal")}
                <RadioGroupItem value="ANIMAL" id="animal-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="machine-check">
                {t("機械", "Machine")}
                <RadioGroupItem value="MACHINE" id="machine-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="background-check">
                {t("背景", "Background")}
                <RadioGroupItem value="BACKGROUND" id="background-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="object-check">
                {t("物", "Object")}
                <RadioGroupItem value="OBJECT" id="object-check" />
              </label>
            </div>
          </RadioGroup>
          <p>{t("タグ", "Tag")}</p>
          <RadioGroup
            value={tag.toString()}
            onValueChange={(value) => {
              setTag(value)
            }}
            className="flex items-center space-x-2"
          >
            <div className="items-center space-x-2">
              <label htmlFor="happy-check">
                {t("楽しい", "Happy")}
                <RadioGroupItem value="楽しい" id="happy-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="enjoy-check">
                {t("嬉しい", "Glad")}
                <RadioGroupItem value="嬉しい" id="enjoy-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="celebration-check">
                {t("お祝い", "Celebration")}
                <RadioGroupItem value="お祝い" id="celebration-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="sad-check">
                {t("悲しい", "Sad")}
                <RadioGroupItem value="悲しい" id="sad-check" />
              </label>
            </div>
            <div className="items-center space-x-2">
              <label htmlFor="other-check">
                {t("その他", "Other")}
                <RadioGroupItem value="その他" id="other-check" />
              </label>
            </div>
          </RadioGroup>
          <DialogFooter>
            {accessType === "PRIVATE" ? (
              <Button className="w-full" onClick={onChangePublic}>
                {isChangeStickerAccessType ? (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                ) : (
                  <span>{t("公開する", "Make Public")}</span>
                )}
              </Button>
            ) : (
              <Button disabled={true} className="w-full">
                {t("公開済み", "Already Public")}
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
