import { type Tag, TagInput } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  postId: string
  tags: Tag[]
  isEditable?: boolean
  setIsOpenEdit?: React.Dispatch<React.SetStateAction<boolean>>
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>
  setTagNames: React.Dispatch<React.SetStateAction<string[]>>
}

export function WorkTagInput (props: Props) {
  const t = useTranslation()

  const [updateWorkTags, { loading: isUpdatingWorkTags }] = useMutation(
    updateWorkTagsMutation,
  )

  const handleSave = async () => {
    const tags = props.tags.map((tag) => tag.text)
    await updateWorkTags({
      variables: {
        input: {
          id: props.postId,
          tags: tags,
        },
      },
    })
    props.setTagNames(tags)
    if (props.setIsOpenEdit) {
      props.setIsOpenEdit(false)
    }
    toast(t("タグを保存しました", "Tags saved successfully"))
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <TagInput
        placeholder={t("追加するタグを入力", "Enter tags to add")}
        tags={props.tags}
        className="sm:min-w-[450px]"
        setTags={props.setTags}
      />
      <Button className="w-full" onClick={handleSave} size={"icon"}>
        {isUpdatingWorkTags ? (
          <Loader2Icon className="mr-2 size-4 animate-spin" />
        ) : (
          t("保存", "Save")
        )}
      </Button>
    </div>
  )
}

const updateWorkTagsMutation = graphql(
  `mutation UpdateWorkTags($input: UpdateWorkTagsInput!) {
    updateWorkTags(input: $input) {
      id
    }
  }`,
)
