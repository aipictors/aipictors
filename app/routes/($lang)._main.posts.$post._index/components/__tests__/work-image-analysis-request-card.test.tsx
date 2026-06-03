import { expect, mock, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { WorkImageAnalysisRequestCard } from "../work-image-analysis-request-card"

mock.module("@apollo/client/index", () => ({
  useMutation: () => [async () => ({}), { loading: false }],
}))

mock.module("sonner", () => ({
  toast: {
    success: () => undefined,
    error: () => undefined,
  },
}))

mock.module("~/hooks/use-translation", () => ({
  useTranslation: () => (jaText: string, _enText: string) => jaText,
}))

test("投稿者で再依頼可能な場合はボタンが有効で表示される", () => {
  const html = renderToStaticMarkup(
    <WorkImageAnalysisRequestCard
      workId="1"
      isOwner={true}
      canRequestImageAnalysis={true}
      imageAnalysisRequestReason={null}
      imageAnalysisRequestAvailableAt={null}
      imageAnalysisRemainingRequestsToday={2}
    />,
  )

  expect(html).toContain("本日の残り回数: 2")
  expect(html).not.toContain('disabled=""')
})

test("cooldown 中は次回可能日時が表示されてボタンが無効になる", () => {
  const availableAt = Math.floor(new Date("2026-06-03T10:00:00+09:00").getTime() / 1000)

  const html = renderToStaticMarkup(
    <WorkImageAnalysisRequestCard
      workId="1"
      isOwner={true}
      canRequestImageAnalysis={false}
      imageAnalysisRequestReason="COOLDOWN"
      imageAnalysisRequestAvailableAt={availableAt}
      imageAnalysisRemainingRequestsToday={3}
    />,
  )

  expect(html).toContain("AI判定の再依頼は")
  expect(html).toContain('disabled=""')
})

test("投稿者でない場合は表示されない", () => {
  const html = renderToStaticMarkup(
    <WorkImageAnalysisRequestCard
      workId="1"
      isOwner={false}
      canRequestImageAnalysis={true}
      imageAnalysisRequestReason={null}
      imageAnalysisRequestAvailableAt={null}
      imageAnalysisRemainingRequestsToday={3}
    />,
  )

  expect(html).toBe("")
})