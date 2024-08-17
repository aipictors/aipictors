import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  work: FragmentOf<typeof RequestArticlePostFragment>
}

export function RequestArticlePost(props: Props) {
  return (
    <img
      className={"rounded"}
      src={props.work.file.imageURL}
      alt={props.work.id}
    />
  )
}

export const RequestArticlePostFragment = graphql(
  `fragment RequestArticlePost on PromptonWorkNode @_unmask {
    id
    file {
      id
      imageURL
    }
  }`,
)
