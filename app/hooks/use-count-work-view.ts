import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { isbot } from "isbot"
import { useContext, useEffect, useRef } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { logEvent } from "~/utils/event-log"

/**
 * 作品ページを開いたときに閲覧数を 1 足す（投稿者本人は数えない）。
 * ページの読み込み（サーバー側）はログイン状態がわからず投稿者本人でも数えてしまうので、
 * 読み込みとページ内の問い合わせは x-aipictors-no-view で数えず、ログイン状態がわかってからここで 1 回だけ数える
 */
export function useCountWorkView(props: {
  workId: string
  /** 作品の情報から投稿者本人とわかっているか（わからないときはサーバーが判定する） */
  isWorkOwner: boolean
}) {
  const authContext = useContext(AuthContext)
  const countedRef = useRef<string | null>(null)
  const [viewWork] = useMutation(viewWorkMutation)

  useEffect(() => {
    if (authContext.isLoading) return
    if (countedRef.current === props.workId) return
    countedRef.current = props.workId
    // 1 回の訪問で見た作品数を数えるための記録（作品ダイアログの分は WorkViewerDialog が source: dialog で送る）
    logWorkView(props.workId, "page")
    if (props.isWorkOwner) return
    if (isbot(navigator.userAgent)) return
    viewWork({ variables: { workId: props.workId } }).catch(() => {})
  }, [authContext.isLoading, props.workId, props.isWorkOwner, viewWork])
}

/**
 * 作品を見たことを操作の記録に残す（work_view。作品ページ: page、作品ダイアログ: dialog）。
 * 主な数字「1 回の訪問で見た作品数」「2 作品以上見た訪問の割合」はセッションごとの work_view の作品数で数える。
 * ダイアログはパスが変わらず page_view が積まれないため、page_view の作品ページだけでは数え漏れる
 */
export function logWorkView(workId: string, source: "page" | "dialog") {
  const id = Number(workId)
  if (!Number.isSafeInteger(id) || id <= 0) return
  logEvent("work_view", { source, work: id })
}

/** ページの読み込みと問い合わせで閲覧数を数えないための context */
export const NO_VIEW_CONTEXT = { headers: { "x-aipictors-no-view": "1" } }

const viewWorkMutation = graphql(
  `mutation ViewWork($workId: ID!) {
    viewWork(workId: $workId)
  }`,
)
