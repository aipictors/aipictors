import { describe, expect, test } from "bun:test"
import { canEditThemeProposalNote } from "~/routes/($lang)._main.themes.proposals._index/components/theme-proposal-note-edit-dialog"

describe("canEditThemeProposalNote", () => {
  test("自分の審査待ちの提案だけ編集できる", () => {
    expect(
      canEditThemeProposalNote({ status: "PENDING", proposerUserId: "1" }, "1"),
    ).toBe(true)
    expect(
      canEditThemeProposalNote({ status: "ADOPTED", proposerUserId: "1" }, "1"),
    ).toBe(false)
    expect(
      canEditThemeProposalNote(
        { status: "REJECTED", proposerUserId: "1" },
        "1",
      ),
    ).toBe(false)
    expect(
      canEditThemeProposalNote({ status: "PENDING", proposerUserId: "2" }, "1"),
    ).toBe(false)
    expect(
      canEditThemeProposalNote(
        { status: "PENDING", proposerUserId: "1" },
        null,
      ),
    ).toBe(false)
  })
})
