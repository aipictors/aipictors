import { graphql } from "gql.tada"

/**
 * 編集ダイアログは持ち主が開くときだけ読むので、ページの読み込みに必要なフラグメントだけ別のファイルに置く
 */
export const AlbumArticleEditorDialogFragment = graphql(
  `fragment AlbumArticleEditorDialog on AlbumNode @_unmask {
    id
    title
    description
    user {
      id
      name
      login
      iconUrl
      nanoid
    }
    createdAt
    isSensitive
    rating
    thumbnailImageURL
    slug
    worksCount
    workIds
  }`,
)
