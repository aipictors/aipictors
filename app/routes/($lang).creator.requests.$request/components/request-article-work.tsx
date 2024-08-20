import { type FragmentOf, graphql, readFragment } from "gql.tada"

type Props = {
  work: FragmentOf<typeof RequestArticleWorkFragment>
}

export function RequestArticleWork(props: Props) {
  const work = readFragment(RequestArticleWorkFragment, props.work)

  return <img className={"rounded"} src={work.file.imageURL} alt={work.id} />
}

export const RequestArticleWorkFragment = graphql(
  `fragment RequestArticleWork on PromptonWorkNode {
    id
    file {
      id
      imageURL
    }
  }`,
)
