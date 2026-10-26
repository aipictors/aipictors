import type { ApolloCache } from "@apollo/client/index"
import type { DocumentNode } from "graphql"

/**
 * 一覧の表示内容（ミュート・ブロック・閲覧レーティング）を変えるミューテーション
 */
const VIEWER_FILTER_MUTATION_FIELDS = new Set([
  "muteUser",
  "unmuteUser",
  "blockUser",
  "unblockUser",
  "muteTag",
  "unmuteTag",
  "updateUserSetting",
])

/**
 * ログインユーザのミュート・ブロック・レーティング設定で結果が変わるルートのクエリ
 */
const VIEWER_FILTERED_ROOT_FIELDS = [
  "works",
  "worksCount",
  "hotWorks",
  "popularWorks",
  "bestWorks",
  "newUserWorks",
  "tagWorks",
  "tagWorksCount",
]

/**
 * ミュート・ブロック・表示設定を変更するミューテーションかどうか
 * @param document
 */
export function isViewerFilterMutation(document: DocumentNode): boolean {
  return document.definitions.some((definition) => {
    if (definition.kind !== "OperationDefinition") {
      return false
    }
    if (definition.operation !== "mutation") {
      return false
    }
    return definition.selectionSet.selections.some((selection) => {
      return (
        selection.kind === "Field" &&
        VIEWER_FILTER_MUTATION_FIELDS.has(selection.name.value)
      )
    })
  })
}

/**
 * ミュート・ブロック・表示設定に依存する作品一覧のキャッシュを破棄する
 * cache-first の一覧が変更前の結果を表示し続けるのを防ぐ
 * @param cache
 */
export function evictViewerFilteredLists(cache: ApolloCache<unknown>) {
  for (const fieldName of VIEWER_FILTERED_ROOT_FIELDS) {
    cache.evict({ id: "ROOT_QUERY", fieldName })
  }

  // フォロー新着・お気に入りタグ新着の投稿一覧は FeedNode に紐づいてキャッシュされる
  const snapshot = cache.extract() as Record<string, unknown>
  for (const id of Object.keys(snapshot)) {
    if (id.startsWith("FeedNode:")) {
      cache.evict({ id, fieldName: "posts" })
    }
  }

  cache.gc()
}
