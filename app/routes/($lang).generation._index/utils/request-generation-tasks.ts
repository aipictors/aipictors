import { config as appConfig } from "~/config"
import type { useGenerationTaskMutations } from "~/routes/($lang).generation._index/hooks/use-generation-task-mutations"
import type { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"
import { logInfo, logWarn } from "~/routes/($lang).generation._index/utils/client-diagnostics-logger"
import {
  convertToGeminiImageSize,
  toFluxTaskInput,
  toGeminiTaskInput,
  toImageGenerationTaskInput,
  toReservedTaskInput,
} from "~/routes/($lang).generation._index/utils/generation-task-input"

/**
 * 生成画面のほかの部品に知らせるイベント（一覧の更新・送信中の仮カードなど）
 */
const dispatchGenerationEvent = (name: string, detail?: unknown) => {
  if (typeof window === "undefined") return
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }))
  } catch {
    // noop
  }
}

type Mutations = ReturnType<typeof useGenerationTaskMutations>

type Props = {
  taskCount: number
  modelName: string
  generationType: string
  i2iFileUrl: string
  config: GenerationConfigState
  scheduler: string | null
  imagesPerRequest: number
  inProgressImageGenerationTasksCount: number
  maxTasksCount: number
  getControlNetImageUrl: (base64: string | null) => Promise<string | null>
  /**
   * すべての依頼が終わったあとの処理
   */
  onFinished: () => Promise<void>
} & Pick<
  Mutations,
  "createTask" | "createFluxTask" | "createGeminiTask" | "createReservedTask"
>

/**
 * 指定の回数ぶん生成タスクを作る。通常の連続生成を超えたら予約生成に切り替える
 */
export const requestGenerationTasks = async (props: Props) => {
  const {
    taskCount,
    modelName,
    generationType,
    i2iFileUrl,
    config,
    scheduler,
    imagesPerRequest,
    inProgressImageGenerationTasksCount,
    maxTasksCount,
    getControlNetImageUrl,
    onFinished,
    createTask,
    createFluxTask,
    createGeminiTask,
    createReservedTask,
  } = props

  logInfo({
    source: "GenerationSubmit",
    message: "createTaskCore start",
    details: {
      taskCount,
      modelName,
      generationType,
      hasI2iFileUrl: i2iFileUrl !== "",
    },
  })
  const taskCounts = Array.from({ length: taskCount }, (_, i) => i)

  // シードを設定する、連続生成のときはSeedは連番にする
  // 1 依頼で複数枚作るときは依頼の中で Seed+1, Seed+2… になるので、依頼ごとに枚数ぶんずらす
  const seeds: number[] = []

  taskCounts.map((i) => {
    if (config.seed === -1) {
      seeds.push(-1)
    } else {
      seeds.push(config.seed + i * imagesPerRequest)
    }
  })

  // プロンプトが設定されていない場合はランダムなプロンプトを使用する
  const promptsTexts: string[] = []

  taskCounts.map((_i) => {
    if (config.promptText) {
      promptsTexts.push(config.promptText)
    } else {
      promptsTexts.push(
        appConfig.generationFeature.randomPrompts[
          Math.floor(
            Math.random() * appConfig.generationFeature.randomPrompts.length,
          )
        ],
      )
    }
  })

  const controlNetImageUrl = await getControlNetImageUrl(
    config.controlNetImageBase64,
  )

  const nowGeneratingCount = inProgressImageGenerationTasksCount
  const promises = taskCounts.map((i) => {
    if (i2iFileUrl !== "" && i + 1 + nowGeneratingCount > maxTasksCount) {
      logWarn({
        source: "GenerationSubmit",
        message: "Skip one: IMG2IMG beyond maxTasksCount",
        details: { index: i, nowGeneratingCount, maxTasksCount },
      })
      // i2iの場合は通常の連続生成の枚数を超過していたら何もしない
      return
    }
    if (i + 1 + nowGeneratingCount > maxTasksCount) {
      if (modelName === "flux.1 schnell" || modelName === "flux.1 pro") {
        logWarn({
          source: "GenerationSubmit",
          message: "Skip reserved: flux does not support reservation",
          details: { index: i },
        })
        // flux.1は予約生成に対応していない
        return
      }
      logInfo({
        source: "GenerationSubmit",
        message: "Create reserved task",
        details: { index: i },
      })
      return createReservedTask({
        variables: {
          input: toReservedTaskInput({
            config,
            scheduler,
            modelName,
            seed: seeds[i],
            controlNetImageUrl,
          }),
        },
      })
    }
    if (modelName === "flux.1 schnell" || modelName === "flux.1 pro") {
      logInfo({
        source: "GenerationSubmit",
        message: "Create FLUX task",
        details: { index: i, promptLength: promptsTexts[i]?.length ?? 0 },
      })
      return createFluxTask({
        variables: {
          input: toFluxTaskInput({
            config,
            modelName,
            prompt: promptsTexts[i],
            seed: seeds[i],
          }),
        },
      })
    }
    if (
      modelName === "Gemini 2.5" ||
      modelName === "Gemini 3.1" ||
      config.modelType === "SD5" ||
      config.modelType === "GEMINI"
    ) {
      // Geminiモデル、SD5タイプ、またはGEMINIタイプの場合はGeminiタスクとして作成
      logInfo({
        source: "GenerationSubmit",
        message: "Create Gemini task",
        details: {
          index: i,
          promptLength: promptsTexts[i]?.length ?? 0,
          hasImageUrl: Boolean(i2iFileUrl),
          size: convertToGeminiImageSize(config.sizeType),
        },
      })
      return createGeminiTask({
        variables: {
          input: toGeminiTaskInput({
            sizeType: config.sizeType,
            modelName,
            prompt: promptsTexts[i],
            i2iFileUrl,
          }),
        },
      })
    }
    logInfo({
      source: "GenerationSubmit",
      message: "Create SD task",
      details: {
        index: i,
        promptLength: promptsTexts[i]?.length ?? 0,
        generationType,
        hasI2i: i2iFileUrl !== "",
      },
    })
    return createTask({
      variables: {
        input: toImageGenerationTaskInput({
          config,
          scheduler,
          modelName,
          prompt: promptsTexts[i],
          seed: seeds[i],
          imagesPerRequest,
          generationType,
          i2iFileUrl,
          controlNetImageUrl,
        }),
      },
    })
  })
  // 送信中の仮カードを一覧に出す（サーバーの応答を待たずに反応を返す）
  const requestKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const sendingCount = promises.filter(
    (promise) => promise !== undefined,
  ).length
  dispatchGenerationEvent("generation:task-sending", {
    key: requestKey,
    count: sendingCount,
  })
  dispatchGenerationEvent("generation:task-requested")
  logInfo({ source: "GenerationSubmit", message: "Requested task creations" })
  const results = await Promise.all(promises)
  const createdCount = results.filter((result) => {
    return result !== undefined && !result.errors && result.data
  }).length
  dispatchGenerationEvent("generation:task-sent", {
    key: requestKey,
    count: createdCount,
  })
  if (createdCount > 0) {
    // 作成が終わった時点でもう一度一覧と残り枚数を取り直す
    dispatchGenerationEvent("generation:task-requested")
  }
  await onFinished()
}
