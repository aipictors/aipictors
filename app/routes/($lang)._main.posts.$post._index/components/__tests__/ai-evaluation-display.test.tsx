import { test, expect, beforeEach, mock } from "bun:test"
import { render, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AiEvaluationDisplay } from "../ai-evaluation-display"

// useTranslationのモック
mock.module("~/hooks/use-translation", () => ({
  useTranslation: () => (jaText: string, _enText: string) => jaText,
}))

// LocalStorageのモック
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

// グローバルなLocalStorageモック
Object.defineProperty(window, "localStorage", {
  value: createLocalStorageMock(),
})

beforeEach(() => {
  // 各テスト前にLocalStorageをクリア
  window.localStorage.clear()
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter initialEntries={["/"]}>{component}</MemoryRouter>)
}

test("AI評価表示が正しくレンダリングされる", () => {
  const mockEvaluation = {
    cutenessScore: 85,
    coolnessScore: 72,
    beautyScore: 90,
    originalityScore: 78,
    compositionScore: 88,
    colorScore: 92,
    detailScore: 84,
    consistencyScore: 86,
    overallScore: 85,
    comment:
      "素晴らしい作品です。特に色彩と構図が印象的で、キャラクターの表情も豊かに描かれています。",
    personality: "female",
  }

  const { container } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="female"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-work-id"
    />,
  )

  expect(container).toBeTruthy()
})

test("ぴくたーちゃんの場合は正しい名前が表示される", () => {
  const mockEvaluation = {
    cutenessScore: 95,
    coolnessScore: 80,
    beautyScore: 88,
    originalityScore: 92,
    compositionScore: 85,
    colorScore: 90,
    detailScore: 87,
    consistencyScore: 89,
    overallScore: 88,
    comment: "とても可愛らしい作品ですね！",
    personality: "pictor_chan",
  }

  const { container } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="pictor_chan"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-work-id-2"
    />,
  )

  expect(container.textContent).toContain("ぴくたーちゃん")
})

test("ぴくたーちゃん以外の場合はAIと表示される", () => {
  const mockEvaluation = {
    cutenessScore: 75,
    coolnessScore: 82,
    beautyScore: 78,
    originalityScore: 85,
    compositionScore: 80,
    colorScore: 77,
    detailScore: 83,
    consistencyScore: 79,
    overallScore: 80,
    comment: "良い作品です。",
    personality: "robot",
  }

  const { container } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="robot"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-work-id-3"
    />,
  )

  expect(container.textContent).toContain("AI")
  expect(container.textContent).not.toContain("ぴくたーちゃん")
})

test("非表示の場合はレンダリングされない", () => {
  const mockEvaluation = {
    cutenessScore: 85,
    coolnessScore: 72,
    beautyScore: 90,
    originalityScore: 78,
    compositionScore: 88,
    colorScore: 92,
    detailScore: 84,
    consistencyScore: 86,
    overallScore: 85,
    comment: "素晴らしい作品です。",
    personality: "robot",
  }

  const { container } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="robot"
      isVisible={false}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-work-id-4"
    />,
  )

  expect(container.innerHTML).toBe("")
})

test("評価が公開だが評価がない場合は評価中と表示される", () => {
  const { container } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={null}
      personality={null}
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-work-id-5"
    />,
  )

  expect(container.textContent).toContain("AI評価を生成中です")
})

test("評価が非公開で投稿者の場合は非公開状態と表示される", () => {
  const { container } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={null}
      personality={null}
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={false}
      isOwner={true}
      workId="test-work-id-6"
    />,
  )

  expect(container.textContent).toContain("AI評価は非公開設定です")
})

test("閉じるボタンをクリックするとAI評価が非表示になる", async () => {
  const mockEvaluation = {
    cutenessScore: 85,
    coolnessScore: 72,
    beautyScore: 90,
    originalityScore: 78,
    compositionScore: 88,
    colorScore: 92,
    detailScore: 84,
    consistencyScore: 86,
    overallScore: 85,
    comment: "素晴らしい作品です。",
    personality: "female",
  }

  const { container, rerender } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="female"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-close-button"
    />,
  )

  // 最初は表示されている
  expect(container.textContent).toContain("素晴らしい作品です。")

  // 閉じるボタンを探してクリック
  const closeButton = container.querySelector(
    '[data-testid="ai-evaluation-close-button"]',
  )
  expect(closeButton).toBeTruthy()

  if (closeButton) {
    fireEvent.click(closeButton)
  }

  // 少し待機してから状態の変更を確認
  await waitFor(() => {
    // LocalStorageに保存されたことを確認
    expect(
      window.localStorage.getItem("ai-evaluation-hidden-test-close-button"),
    ).toBe("true")
  })

  // コンポーネントを再レンダリングして状態変更を反映
  rerender(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="female"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-close-button"
    />,
  )

  // 再度開くボタンが表示されることを確認
  await waitFor(() => {
    expect(container.textContent).toContain("AI評価を表示")
  })
})

test("長いコメントは省略表示され、もっと見るボタンで全文表示される", () => {
  const longComment = "これは非常に長いコメントです。".repeat(10) // 300文字以上の長いコメント
  const mockEvaluation = {
    cutenessScore: 85,
    coolnessScore: 72,
    beautyScore: 90,
    originalityScore: 78,
    compositionScore: 88,
    colorScore: 92,
    detailScore: 84,
    consistencyScore: 86,
    overallScore: 85,
    comment: longComment,
    personality: "female",
  }

  const { container } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="female"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-long-comment"
    />,
  )

  // 最初は省略されたコメントが表示される
  expect(container.textContent).toContain("もっと見る")
  expect(container.textContent).not.toContain(longComment)

  // もっと見るボタンをクリック
  const buttons = container.querySelectorAll("button")
  let showMoreBtn = null
  for (const button of buttons) {
    if (button.textContent?.includes("もっと見る")) {
      showMoreBtn = button
      break
    }
  }
  if (showMoreBtn) {
    fireEvent.click(showMoreBtn)
  }

  // 全文が表示される
  expect(container.textContent).toContain("閉じる")
  expect(container.textContent).toContain(longComment)

  // 閉じるボタンをクリック
  const allButtons = container.querySelectorAll("button")
  let collapseBtn = null
  for (const button of allButtons) {
    if (button.textContent?.includes("閉じる")) {
      collapseBtn = button
      break
    }
  }
  if (collapseBtn) {
    fireEvent.click(collapseBtn)
  }

  // 再び省略表示に戻る
  expect(container.textContent).toContain("もっと見る")
  expect(container.textContent).not.toContain(longComment)
})

test("AI評価を閉じた後、再度開くボタンが表示される", async () => {
  const mockEvaluation = {
    cutenessScore: 85,
    coolnessScore: 72,
    beautyScore: 90,
    originalityScore: 78,
    compositionScore: 88,
    colorScore: 92,
    detailScore: 84,
    consistencyScore: 86,
    overallScore: 85,
    comment: "テストコメント",
    personality: "female",
  }

  const { container, rerender } = renderWithRouter(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="female"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-reopen"
    />,
  )

  // 最初はAI評価が表示される
  expect(container.textContent).toContain("テストコメント")

  // 閉じるボタンをクリック
  const closeButton = container.querySelector(
    '[data-testid="ai-evaluation-close-button"]',
  )
  expect(closeButton).toBeTruthy()

  if (closeButton) {
    fireEvent.click(closeButton)
  }

  // LocalStorageに保存されるまで待機
  await waitFor(() => {
    expect(
      window.localStorage.getItem("ai-evaluation-hidden-test-reopen"),
    ).toBe("true")
  })

  // 再レンダリング（状態の変更を反映）
  rerender(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="female"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-reopen"
    />,
  )

  // 再度開くボタンが表示されることを確認
  await waitFor(() => {
    expect(container.textContent).toContain("AI評価を表示")
  })

  // 再度開くボタンをクリック
  const reopenButton = container.querySelector(
    '[data-testid="ai-evaluation-reopen-button"]',
  )
  expect(reopenButton).toBeTruthy()

  if (reopenButton) {
    fireEvent.click(reopenButton)
  }

  // LocalStorageの状態が更新されるまで待機
  await waitFor(() => {
    expect(
      window.localStorage.getItem("ai-evaluation-hidden-test-reopen"),
    ).toBe("false")
  })

  // 再レンダリング
  rerender(
    <AiEvaluationDisplay
      evaluation={mockEvaluation}
      personality="female"
      isVisible={true}
      isBotGradingEnabled={true}
      isBotGradingPublic={true}
      isOwner={false}
      workId="test-reopen"
    />,
  )

  // AI評価が再び表示されることを確認
  await waitFor(() => {
    expect(container.textContent).toContain("テストコメント")
  })
})
