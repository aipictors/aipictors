import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { createContext, lazy, Suspense, useContext, useState } from "react"
import { toast } from "sonner"
import type {
  ModelLibraryItem,
  ModelLibrarySection,
} from "~/components/model-library/model-library-types"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { parseUserLoraName } from "~/lib/user-models/generation"
import type { UserModelKind } from "~/lib/user-models/types"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"

const ModelLibraryDialog = lazy(
  () => import("~/components/model-library/model-library-dialog"),
)

const ModelLibraryUploadPanel = lazy(() =>
  import("~/components/model-library/model-library-upload-panel").then(
    (module) => ({ default: module.ModelLibraryUploadPanel }),
  ),
)

/**
 * ボタンにカーソルを乗せた時点で読み込んでおく
 */
export const preloadModelLibrary = () => {
  import("~/components/model-library/model-library-dialog")
}

export type OpenModelLibraryOptions = {
  section?: ModelLibrarySection
  kind?: UserModelKind | null
  startWithUpload?: boolean
}

type ContextValue = {
  open(options?: OpenModelLibraryOptions): void
  /**
   * 公式チェックポイントを選ぶ（推奨プロンプトの設定・みんなのモデルの解除も行う）
   */
  selectOfficialModel(id: string, type: string, prompt: string): void
}

const ModelLibraryLauncherContext = createContext<ContextValue>({
  open: () => {},
  selectOfficialModel: () => {},
})

export function useModelLibraryLauncher() {
  return useContext(ModelLibraryLauncherContext)
}

type Props = {
  children: React.ReactNode
}

/**
 * 生成画面のモデルライブラリ（ダイアログは開くときに読み込む）
 */
export function GenerationModelLibraryProvider(props: Props) {
  const context = useGenerationContext()
  const authContext = useContext(AuthContext)
  const userModelSelection = useUserModelSelection()

  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [options, setOptions] = useState<OpenModelLibraryOptions>({})
  const [openCount, setOpenCount] = useState(0)

  const [changeRatingModel] = useMutation(
    updateRatingImageGenerationModelMutation,
  )

  const open = (next: OpenModelLibraryOptions = {}) => {
    setOptions(next)
    setOpenCount((count) => count + 1)
    setHasOpened(true)
    setIsOpen(true)
  }

  const selectOfficialModel = (id: string, type: string, prompt: string) => {
    // 公式モデルを選んだらみんなのモデルの選択は外す
    if (userModelSelection.checkpoint) {
      userModelSelection.clearCheckpoint({ restore: false })
    }
    if (context.config.isUseRecommendedPrompt) {
      context.updateModelIdAndPrompt(
        id,
        type,
        prompt === "" ? config.generationFeature.defaultPromptValue : prompt,
      )
    } else {
      context.updateModelId(id, type)
    }
  }

  const loraNames = context.promptLoraModels.map((text) => text.split(":")[0])

  const selectedKeys = [
    userModelSelection.checkpoint
      ? `user:${userModelSelection.checkpoint.id}`
      : `official-checkpoint:${context.config.modelId}`,
    ...loraNames.map((name) => {
      const userId = parseUserLoraName(name)
      return userId ? `user:${userId}` : `official-lora:${name}`
    }),
  ]

  const onUse = (item: ModelLibraryItem) => {
    if (item.kind === "CHECKPOINT") {
      if (item.officialCheckpoint) {
        selectOfficialModel(
          item.officialCheckpoint.id,
          item.officialCheckpoint.type,
          item.officialCheckpoint.prompts.join(","),
        )
      } else if (item.userModel) {
        userModelSelection.selectCheckpoint(item.userModel)
      }
      setIsOpen(false)
      return
    }

    if (item.userModel) {
      userModelSelection.toggleLora(item.userModel)
      return
    }
    if (item.officialLora) {
      const isSelected = loraNames.includes(item.officialLora.name)
      if (
        !isSelected &&
        context.promptLoraModels.length >= context.availableLoraModelsCount
      ) {
        toast(
          `LoRA は ${context.availableLoraModelsCount} 個まで使えます。どれかを外してから追加してください`,
        )
        return
      }
      context.changeLoraModel(
        item.officialLora.name,
        typeof item.officialLora.triggerWord === "string" &&
          item.officialLora.triggerWord !== ""
          ? item.officialLora.triggerWord
          : undefined,
      )
    }
  }

  const onToggleFavorite = async (modelId: string, isFavorite: boolean) => {
    const result = await changeRatingModel({
      variables: { input: { modelId, rating: isFavorite ? 1 : 0 } },
    })
    const ids =
      result.data?.updateRatingImageGenerationModel
        .favoritedImageGenerationModelIds
    if (ids) {
      context.updateFavoriteModelIds(ids)
    }
  }

  const loraCount = loraNames.length

  return (
    <ModelLibraryLauncherContext.Provider value={{ open, selectOfficialModel }}>
      {props.children}
      {hasOpened && (
        <Suspense fallback={null}>
          <ModelLibraryDialog
            key={openCount}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            initialSection={
              options.section ??
              (userModelSelection.checkpoint && options.kind === "CHECKPOINT"
                ? "community"
                : "official")
            }
            initialKind={options.kind ?? null}
            startWithUpload={options.startWithUpload}
            officialCheckpoints={context.imageModels}
            officialLoras={context.imageLoraModels}
            favoriteOfficialIds={context.config.favoriteModelIds}
            recentOfficialCheckpointIds={context.config.modelIds}
            onToggleFavorite={
              authContext.isLoggedIn ? onToggleFavorite : undefined
            }
            selectedKeys={selectedKeys}
            onUse={onUse}
            toolbarExtra={(state) =>
              state.kind === "LORA" ||
              state.section === "community" ||
              state.section === "mine" ? null : (
                <div className="flex w-fit items-center gap-2">
                  <Checkbox
                    id="model-library-recommended-prompt"
                    checked={context.config.isUseRecommendedPrompt}
                    onCheckedChange={(value) =>
                      context.changeUseRecommendedPrompt(value === true)
                    }
                    className="size-3.5"
                  />
                  <label
                    htmlFor="model-library-recommended-prompt"
                    className="cursor-pointer text-muted-foreground text-xs"
                  >
                    公式モデルを選んだときに推奨プロンプトを入れる
                  </label>
                </div>
              )
            }
            footer={
              loraCount > 0 || options.kind === "LORA" ? (
                <div className="flex shrink-0 items-center justify-between gap-3 border-t bg-background px-4 py-3 md:px-5">
                  <p className="text-muted-foreground text-sm">
                    LoRA{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {loraCount} / {context.availableLoraModelsCount}
                    </span>{" "}
                    個を使用中
                  </p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full px-6"
                  >
                    完了
                  </Button>
                </div>
              ) : null
            }
          />
        </Suspense>
      )}
      {hasOpened && !isOpen && (
        <Suspense fallback={null}>
          <ModelLibraryUploadPanel className="fixed right-4 bottom-20 md:right-6 md:bottom-6" />
        </Suspense>
      )}
    </ModelLibraryLauncherContext.Provider>
  )
}

const updateRatingImageGenerationModelMutation = graphql(
  `mutation UpdateRatingImageGenerationModel($input: UpdateRatingImageGenerationModelInput!) {
    updateRatingImageGenerationModel(input: $input) {
      id
      userId
      favoritedImageGenerationModelIds
      preferenceRating
      featurePromptonRequest
      isNotifyComment
    }
  }`,
)
