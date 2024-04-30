import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerTokenQuery = gql(`
    query ViewerToken {
        viewer {
            token
        }
    }
`)
