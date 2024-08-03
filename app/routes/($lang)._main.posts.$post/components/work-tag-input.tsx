import { type Tag, TagInput } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

type Props = {
  postId: string
  tags: Tag[]
  isEditable?: boolean
  setIsOpenEdit?: React.Dispatch<React.SetStateAction<boolean>>
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>
  setTagNames: React.Dispatch<React.SetStateAction<string[]>>
}

export const WorkTagInput = (props: Props) => {
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
    toast("タグを保存しました")
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <TagInput
        placeholder="追加するタグを入力"
        tags={props.tags}
        className="sm:min-w-[450px]"
        setTags={props.setTags}
      />
      <Button className="w-full" onClick={handleSave} size={"icon"}>
        {isUpdatingWorkTags ? (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "保存"
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
