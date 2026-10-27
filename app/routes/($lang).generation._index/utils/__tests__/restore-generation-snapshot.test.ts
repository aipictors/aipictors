import { expect, test } from "bun:test"
import { createActor } from "xstate"
import { generationConfigMachine } from "../../machines/generation-config-machine"
import { restoreGenerationSnapshot } from "../restore-generation-snapshot"

const stateNames = Object.keys(generationConfigMachine.config.states ?? {})

const persisted = (value: string) =>
  JSON.stringify({
    status: "active",
    value,
    historyValue: {},
    context: {
      promptText: "1girl",
      previewImageURL: "https://example.com/a.png",
    },
    children: {},
  })

test("廃止したホバープレビューの状態はプロンプト入力画面に戻す", () => {
  for (const value of ["HISTORY_PREVIEW", "WORK_PREVIEW"]) {
    const snapshot = restoreGenerationSnapshot(persisted(value), stateNames)
    expect(snapshot.value).toBe("PROMPT_VIEW")
    expect(snapshot.context.promptText).toBe("1girl")
    expect(snapshot.context.previewImageURL).toBeNull()
  }
})

test("復元した状態から画面を起動して操作できる", () => {
  const snapshot = restoreGenerationSnapshot(
    persisted("HISTORY_PREVIEW"),
    stateNames,
  )
  const actor = createActor(generationConfigMachine, {
    snapshot,
    input: snapshot.context,
  }).start()
  expect(actor.getSnapshot().value).toBe("PROMPT_VIEW")
  actor.send({ type: "OPEN_WORKS_FROM_MODEL" })
  expect(actor.getSnapshot().value).toBe("WORKS_FROM_MODEL")
  actor.stop()
})

test("存在する状態はそのまま復元する", () => {
  const snapshot = restoreGenerationSnapshot(
    persisted("COMMUNICATION"),
    stateNames,
  )
  expect(snapshot.value).toBe("COMMUNICATION")
})

test("壊れた保存データは無視する", () => {
  expect(restoreGenerationSnapshot("{broken", stateNames)).toBeUndefined()
  expect(restoreGenerationSnapshot("null", stateNames)).toBeUndefined()
  expect(restoreGenerationSnapshot(null, stateNames)).toBeUndefined()
})
