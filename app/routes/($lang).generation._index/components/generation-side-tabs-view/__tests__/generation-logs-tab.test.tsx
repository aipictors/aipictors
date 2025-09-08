// filepath: app/routes/($lang).generation._index/components/generation-side-tabs-view/__tests__/generation-logs-tab.test.tsx
import { expect, test } from "bun:test"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { GenerationLogsTab } from "../generation-logs-tab"
import { clearLogs, logInfo } from "../../../utils/client-diagnostics-logger"

const renderWithRouter = (
  ui: React.ReactNode,
  initialEntries: string[] = ["/ja/generation"],
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
  )
}

// 事前後処理
const resetLogs = () => {
  try {
    clearLogs()
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("aipictors:generation:logs")
    }
  } catch {}
}

test("初期状態ではログがない", () => {
  resetLogs()
  renderWithRouter(<GenerationLogsTab />)
  expect(screen.getByText("ログはありません")).toBeTruthy()
})

test("ログを追加すると表示される", async () => {
  resetLogs()
  renderWithRouter(<GenerationLogsTab />)

  await act(async () => {
    logInfo({ source: "Test", message: "Hello", details: { token: "secret" } })
  })

  // レベルやメッセージ表示
  expect(await screen.findByText(/\[info\]/)).toBeTruthy()
  expect(screen.getByText("Hello")).toBeTruthy()
  // 機密情報はマスク
  expect(
    screen.getByText((content) => content.includes("<redacted>")),
  ).toBeTruthy()
})

test("クリアボタンでログが消える", async () => {
  resetLogs()
  renderWithRouter(<GenerationLogsTab />)
  await act(async () => {
    logInfo({ source: "Test", message: "to be cleared" })
  })
  expect(await screen.findByText("to be cleared")).toBeTruthy()

  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: "クリア" }))

  expect(await screen.findByText("ログはありません")).toBeTruthy()
})
