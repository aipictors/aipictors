import { type FragmentOf, graphql, readFragment } from "gql.tada"

type Props = {
  work: FragmentOf<typeof RequestArticlePostFragment>
}

export function RequestArticlePost(props: Props) {
  const work = readFragment(RequestArticlePostFragment, props.work)

  return <img className={"rounded"} src={work.file.imageURL} alt={work.id} />
}

export const RequestArticlePostFragment = graphql(
  `fragment RequestArticlePost on PromptonWorkNode {
    id
    file {
      id
      imageURL
    }
  }`,
)
