import { describe, expect, test } from "bun:test"
import type { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"
import { requestGenerationTasks } from "~/routes/($lang).generation._index/utils/request-generation-tasks"

const baseConfig = {
  vae: null,
  promptText: "prompt",
  negativePromptText: "",
  languageUsedForPrompt: "en",
  seed: -1,
  steps: 20,
  scale: 7,
  sampler: "s",
  clipSkip: 2,
  sizeType: "SD1_512_512",
  i2iDenoisingStrengthSize: 0.5,
  controlNetImageBase64: null,
  controlNetWeight: null,
  controlNetModel: null,
  controlNetModule: null,
  upscaleSize: null,
  modelType: "SD1",
}

const run = async (
  props: {
    config?: Partial<typeof baseConfig>
    taskCount?: number
    modelName?: string
    i2iFileUrl?: string
    inProgress?: number
    maxTasksCount?: number
    imagesPerRequest?: number
  } = {},
) => {
  const calls: { name: string; input: Record<string, unknown> }[] = []
  const fake =
    (name: string) => async (options: { variables: { input: unknown } }) => {
      calls.push({
        name,
        input: options.variables.input as Record<string, unknown>,
      })
      return { data: {} }
    }
  const events: string[] = []
  const onEvent = (event: Event) => {
    events.push(`${event.type}:${(event as CustomEvent).detail?.count ?? ""}`)
  }
  const names = [
    "generation:task-sending",
    "generation:task-requested",
    "generation:task-sent",
  ]
  for (const name of names) window.addEventListener(name, onEvent)
  let isFinished = false
  await requestGenerationTasks({
    taskCount: props.taskCount ?? 1,
    modelName: props.modelName ?? "model",
    generationType: "TEXT_TO_IMAGE",
    i2iFileUrl: props.i2iFileUrl ?? "",
    config: {
      ...baseConfig,
      ...props.config,
    } as unknown as GenerationConfigState,
    scheduler: "Automatic",
    imagesPerRequest: props.imagesPerRequest ?? 1,
    inProgressImageGenerationTasksCount: props.inProgress ?? 0,
    maxTasksCount: props.maxTasksCount ?? 3,
    getControlNetImageUrl: async () => null,
    onFinished: async () => {
      isFinished = true
    },
    createTask: fake("sd") as never,
    createFluxTask: fake("flux") as never,
    createGeminiTask: fake("gemini") as never,
    createReservedTask: fake("reserved") as never,
  })
  for (const name of names) window.removeEventListener(name, onEvent)
  return { calls, events, isFinished }
}

describe("requestGenerationTasks", () => {
  test("上限までは通常、超えたら予約にする", async () => {
    const { calls } = await run({ taskCount: 4, inProgress: 1 })
    expect(calls.map((call) => call.name)).toEqual([
      "sd",
      "sd",
      "reserved",
      "reserved",
    ])
  })

  test("画像から生成は上限を超えた分を送らない", async () => {
    const { calls, events } = await run({
      taskCount: 4,
      inProgress: 1,
      i2iFileUrl: "https://example.com/i.png",
    })
    expect(calls.map((call) => call.name)).toEqual(["sd", "sd"])
    expect(events[0]).toBe("generation:task-sending:2")
  })

  test("FLUX は予約できないので上限を超えた分を送らない", async () => {
    const { calls } = await run({
      taskCount: 4,
      modelName: "flux.1 pro",
    })
    expect(calls.map((call) => call.name)).toEqual(["flux", "flux", "flux"])
  })

  test("Gemini のモデルと種類は Gemini のタスクにする", async () => {
    expect((await run({ modelName: "Gemini 3.1" })).calls[0]?.name).toBe("gemini")
    expect(
      (await run({ config: { modelType: "SD5" } })).calls[0]?.name,
    ).toBe("gemini")
    expect(
      (await run({ config: { modelType: "GEMINI" } })).calls[0]?.name,
    ).toBe("gemini")
  })

  test("Seed は依頼ごとに枚数ぶんずらす。-1 はそのまま", async () => {
    const seeds = (result: Awaited<ReturnType<typeof run>>) =>
      result.calls.map((call) => call.input.seed)
    expect(
      seeds(
        await run({
          taskCount: 3,
          imagesPerRequest: 4,
          config: { seed: 10 },
        }),
      ),
    ).toEqual([10, 14, 18])
    expect(seeds(await run({ taskCount: 2 }))).toEqual([-1, -1])
  })

  test("プロンプトが空ならランダムなプロンプトを使う", async () => {
    const { calls } = await run({ config: { promptText: "" } })
    expect(typeof calls[0]?.input.prompt).toBe("string")
    expect(calls[0]?.input.prompt).not.toBe("")
  })

  test("送信中・送信後のイベントを出して、最後に後処理を呼ぶ", async () => {
    const { events, isFinished } = await run()
    expect(events).toEqual([
      "generation:task-sending:1",
      "generation:task-requested:",
      "generation:task-sent:1",
      "generation:task-requested:",
    ])
    expect(isFinished).toBe(true)
  })
})
