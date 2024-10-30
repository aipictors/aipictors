import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { WorkPage } from "~/routes/($lang)._main.posts.$post._index/components/work-container"
import {
  redirect,
  type HeadersFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql, readFragment } from "gql.tada"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeAwardWorksFragment } from "~/routes/($lang)._main._index/components/home-award-works"
import { getJstDate } from "~/utils/jst-date"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  const now = getJstDate(new Date())

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const result = await loaderClient.query({
    query: WorkQuery,
    variables: {
      id: props.params.post,
      workAwardsWhere: {
        isSensitive: false,
        year: yesterday.getFullYear(),
        month: yesterday.getMonth() + 1,
        day: yesterday.getDate(),
      },
    },
  })

  if (result.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  // 非公開の場合はエラー
  if (
    result.data.work.accessType === "PRIVATE" ||
    result.data.work.accessType === "DRAFT"
  ) {
    throw new Response(null, { status: 404 })
  }

  // センシティブな作品の場合は/r/にリダイレクト
  if (result.data.work.rating === "R18" || result.data.work.rating === "R18G") {
    throw redirect(`/r/posts/${props.params.post}`)
  }

  return {
    work: result.data.work,
    newComments: result.data.newComments,
    workAwards: result.data.workAwards,
  }
}

export const meta: MetaFunction<typeof loader> = (props) => {
  if (props.data === undefined) {
    return []
  }

  const work = readFragment(MetaFragment, props.data.work)

  if (work === null) {
    return []
  }

  const subTitle =
    props.params.lang === "en"
      ? work.user
        ? ` - ${work.user?.name}`
        : ""
      : work.user
        ? ` - ${work.user?.name}の作品`
        : ""

  return createMeta(
    META.POSTS,
    {
      title: `${props.params.lang === "en" ? (work.enTitle.length > 0 ? work.enTitle : work.title) : work.title}${subTitle}`,
      enTitle: `${props.params.lang === "en" ? (work.enTitle.length > 0 ? work.enTitle : work.title) : work.title}${subTitle}`,
      description:
        props.params.lang === "en"
          ? work.enDescription || work.description || "Aipictors work page"
          : work.description ||
            "Aipictorsの作品ページです、AIイラストなどの作品を閲覧することができます",
      enDescription:
        props.params.lang === "en"
          ? work.enDescription || work.description || "Aipictors work page"
          : work.description ||
            "Aipictorsの作品ページです、AIイラストなどの作品を閲覧することができます",
      url: work.smallThumbnailImageURL,
    },
    props.params.lang,
  )
}

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": config.cacheControl.oneDay,
  }
}

export default function Route() {
  const params = useParams()

  if (params.post === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <WorkPage
      postId={params.post}
      work={data.work}
      comments={data.work.comments}
      newComments={data.newComments}
      workAwards={data.workAwards}
    />
  )
}

const MetaFragment = graphql(
  `fragment Meta on WorkNode {
    id
    title
    enTitle
    description
    enDescription
    smallThumbnailImageURL
    user {
      id
      name
    }
  }`,
)

const WorkQuery = graphql(
  `query Query($id: ID!, $workAwardsWhere: WorkAwardsWhereInput!) {
    work(id: $id) {
      ...WorkArticle
      comments(offset: 0, limit: 128) {
        ...Comment
      }
    }
    newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: false,
        ratings: [G],
      }
    ) {
      ...HomeNewComments
    }
    workAwards(offset: 0, limit: 4, where: $workAwardsWhere) {
      ...HomeAwardWorks
    }
  }`,
  [
    workArticleFragment,
    CommentListItemFragment,
    HomeNewCommentsFragment,
    HomeAwardWorksFragment,
  ],
)
