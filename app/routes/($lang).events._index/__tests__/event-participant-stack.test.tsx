import { describe, expect, test } from "bun:test"
import { render } from "@testing-library/react"
import { EventParticipantStack } from "~/routes/($lang).events._index/components/app-event-card"

const icons = [1, 2, 3, 4, 5].map((n) => ({
  id: String(n),
  name: `user${n}`,
  iconUrl: n === 5 ? null : `https://files.aipictors.com/icon-${n}.webp`,
}))

describe("EventParticipantStack", () => {
  test("max 個まで縮小版（96px）のアイコンを重ね、残りを「＋〇人」にする", () => {
    const view = render(
      <EventParticipantStack
        icons={icons}
        participantCount={71}
        max={5}
        size="md"
        unit="人"
        label="が参加中"
      />,
    )
    const srcs = [...view.container.querySelectorAll("img")].map((img) =>
      img.getAttribute("src"),
    )
    expect(srcs).toHaveLength(5)
    expect(srcs[0]).toBe("https://variants.aipictors.com/v2/96/icon-1.webp")
    // アイコンが無い人は既定のアイコン
    expect(srcs[4]).toBe("https://assets.aipictors.com/no-profile.webp")
    expect(view.container.textContent).toBe("＋66人が参加中")
    view.unmount()
  })

  test("全員が見えているときは人数、アイコンが無いときは何も出さない", () => {
    const view = render(
      <EventParticipantStack
        icons={icons.slice(0, 2)}
        participantCount={2}
        max={3}
        size="sm"
        unit="人"
        label="が参加"
      />,
    )
    expect(view.container.textContent).toBe("2人が参加")
    view.unmount()

    const empty = render(
      <EventParticipantStack
        icons={[]}
        participantCount={10}
        max={3}
        size="sm"
      />,
    )
    expect(empty.container.innerHTML).toBe("")
    empty.unmount()
  })
})
