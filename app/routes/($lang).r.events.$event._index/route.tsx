/**
 * R18 版のイベントページ
 * 通常版と同じ画面を使い、作品だけ R18・R18G にする（loader が /r/events/… を見て切り替える）
 * meta は書かない（親の /r の既定で検索エンジンに載せない）
 */
export {
  default,
  headers,
  loader,
} from "~/routes/($lang).events.$event._index/route"
