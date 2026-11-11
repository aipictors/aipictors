import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

/**
 * その日の人気作品（画像・100 件）
 */
export const PopularWorksQuery = graphql(
  `query PopularWorks($where: PopularWorksWhereInput!) {
    popularWorks(where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

/**
 * いいねの多い順（API は投稿日時の新しい順で返す）
 * @param works
 */
export function sortPopularWorks<T extends { likesCount: number }>(
  works: readonly T[],
): T[] {
  return [...works].sort((a, b) => b.likesCount - a.likesCount)
}
