import { onCLS } from "web-vitals/attribution"
import {
  buildClsExtra,
  CLS_SAMPLE_RATE,
  type ClsEstimate,
  createClsGate,
  estimatesFor,
  routeAt,
  selectorFor,
} from "~/utils/cls-attribution"
import { flushEventLog, logEventItem } from "~/utils/event-log"

/**
 * CLS の原因を cls_shift として操作の記録に送る（root から間引きで選ばれたセッションだけ動的 import される）。
 * reportAllChanges は使わない: web-vitals は画面が隠れたとき（と soft navigation・bfcache の切り替わり）に
 * その計測の確定値を報告するので、それを 1 計測 1 回だけ送る
 */
let isStarted = false

export function startClsObserver() {
  // 2 回呼ばれても 1 つだけ（StrictMode の開発中は effect が 2 回走り、同じずれを 2 回送っていた）
  if (isStarted) return
  isStarted = true
  const shouldSend = createClsGate()
  // ずれた時点の見積もりの高さ（あとから測ると content-visibility で縮んだ・伸びたあとになるため）
  const estimatesByNode = new WeakMap<Node, ClsEstimate[]>()
  onCLS(
    (metric) => {
      if (!shouldSend(metric.id, metric.value)) return
      const attribution = metric.attribution
      const node = attribution.largestShiftSource?.node ?? null
      const path = routeAt(
        attribution.largestShiftTime,
        window.location.pathname,
      )
      logEventItem({
        e: "cls_shift",
        ...(attribution.loadState ? { s: attribution.loadState } : {}),
        p: path,
        n: Math.round(metric.value * 10000) / 10000,
        x: buildClsExtra({
          target: attribution.largestShiftTarget,
          largestShiftValue: attribution.largestShiftValue,
          largestShiftTime: attribution.largestShiftTime,
          navigationType: metric.navigationType,
          viewportWidth: window.innerWidth,
          sampleRate: CLS_SAMPLE_RATE,
          estimates: (node && estimatesByNode.get(node)) || [],
        }),
      })
      // 画面が隠れたときの報告は、記録の送信（同じ visibilitychange）より後に来るのでここで送る
      if (document.visibilityState === "hidden") flushEventLog()
    },
    {
      reportSoftNavs: true,
      generateTarget: (node) => {
        if (node) estimatesByNode.set(node, estimatesFor(node))
        return selectorFor(node)
      },
    },
  )
}
