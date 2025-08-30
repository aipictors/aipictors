import { test, expect } from "bun:test"
import { render } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { AiEvaluationDisplay } from "../ai-evaluation-display"

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
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
    />,
  )

  expect(container.textContent).toContain("AI評価は非公開設定です")
})
