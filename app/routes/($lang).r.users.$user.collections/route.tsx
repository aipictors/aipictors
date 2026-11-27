export {
  headers,
  loader,
  meta,
} from "~/routes/($lang)._main.users.$user.collections/route"

import UserCollections from "~/routes/($lang)._main.users.$user.collections/route"

/**
 * R18 側のユーザーのコレクション一覧（通常の一覧と同じもの）
 */
export default function SensitiveUserCollections() {
  return <UserCollections />
}
