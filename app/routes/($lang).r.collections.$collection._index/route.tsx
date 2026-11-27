export {
  headers,
  loader,
  meta,
} from "~/routes/($lang)._main.collections.$collection/route"

import Collection from "~/routes/($lang)._main.collections.$collection/route"

/**
 * R18 のコレクションの詳細（/r/collections/:id）
 * 以前はコレクションと関係のない新着作品の一覧を出していたので、通常のコレクションの詳細と同じものを出す
 */
export default function SensitiveCollection() {
  return <Collection />
}
