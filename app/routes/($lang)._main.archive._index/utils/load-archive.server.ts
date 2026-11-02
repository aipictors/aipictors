import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { loaderClient } from "~/lib/loader-client"
import {
  limitWorksPerUser,
  parseArchivePeriod,
  toArchiveDateRanges,
  toArchiveYears,
  toJstDateText,
} from "~/routes/($lang)._main.archive._index/utils/archive-picks"
import { isFeaturableSensitiveWork } from "~/utils/sensitive-tag-filter"

/** いいねの多い順に、1 つの期間から読む数（この中から毎日選び直す） */
const PAGE_SIZE = 64

/**
 * 過去の名作のデータ（R18 では R18G を含めず、ガイドラインに触れそうなタグの作品も選ばない）
 */
export async function loadArchive(
  request: Request,
  options: { isSensitive?: boolean } = {},
) {
  const isSensitive = options.isSensitive === true
  const now = new Date()
  const period = parseArchivePeriod(new URL(request.url).searchParams, now)

  const ranges = toArchiveDateRanges(period, now)
  // 1 つの期間だけのときは 2 ページ分読む（人気の作者に偏っても数が残るように）
  const offsets = ranges.length === 1 ? [0, PAGE_SIZE] : [0]
  const results = await Promise.all(
    ranges.flatMap((range) =>
      offsets.map((offset) =>
        loaderClient.query({
          query: archiveWorksQuery,
          variables: {
            offset,
            limit: PAGE_SIZE,
            where: {
              ratings: isSensitive ? ["R18"] : ["G", "R15"],
              orderBy: "LIKES_COUNT",
              sort: "DESC",
              workType: "WORK",
              beforeCreatedAt: range.before,
              ...(range.after ? { createdAtAfter: range.after } : {}),
            },
          },
        }),
      ),
    ),
  )

  const works = limitWorksPerUser(
    results
      .flatMap((result) => result.data.works)
      .filter((work) => !isSensitive || isFeaturableSensitiveWork(work))
      .sort((a, b) => b.likesCount - a.likesCount),
  )

  return {
    period,
    works,
    years: toArchiveYears(now),
    /** 同じ日は同じ並び（毎日入れ替わる） */
    dateText: toJstDateText(now),
  }
}

export type ArchiveData = Awaited<ReturnType<typeof loadArchive>>

const archiveWorksQuery = graphql(
  `query ArchiveWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)
