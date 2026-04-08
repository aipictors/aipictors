export { headers, loader, meta } from "~/routes/($lang)._main._index/route"
import { HomeIndexPage } from "~/routes/($lang)._main._index/route"

export default function FollowTagWorksPage() {
  return <HomeIndexPage forcedTab="follow-tag" />
}