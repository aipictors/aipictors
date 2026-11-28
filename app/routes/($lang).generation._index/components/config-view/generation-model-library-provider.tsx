import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { createContext, lazy, Suspense, useContext, useState } from "react"
import { toast } from "sonner"
import type {
  ModelLibraryItem,
  ModelLibrarySection,
} from "~/components/model-library/model-library-types"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { parseUserLoraName } from "~/lib/user-models/generation"
import {
  type CheckpointLoraFamily,
  isLoraUsableWith,
  officialLoraFamily,
  userCheckpointLoraFamily,
  userModelLoraFamily,
} from "~/lib/user-models/lora-compat"
import type { UserModel, UserModelKind } from "~/lib/user-models/types"
import {
  GenerationLoraSwitchDialog,
  type PendingModelSwitch,
} from "~/routes/($lang).generation._index/components/config-view/generation-lora-switch-dialog"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import {
  imageModelLoraFamily,
  useLoraCompatibility,
} from "~/routes/($lang).generation._index/hooks/use-lora-compatibility"
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

type OpenModelLibraryOptions = {
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
  /**
   * みんなのモデルのチェックポイントを選ぶ（LoRA が効かなくなるときは確認する）
   */
  selectUserCheckpoint(model: UserModel): void
}

const ModelLibraryLauncherContext = createContext<ContextValue>({
  open: () => {},
  selectOfficialModel: () => {},
  selectUserCheckpoint: () => {},
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

  const loraCompat = useLoraCompatibility()

  const [pendingSwitch, setPendingSwitch] = useState<PendingModelSwitch | null>(
    null,
  )

  /**
   * 選択中の LoRA が効かないモデルへ切り替えるときは、LoRA を外すか確認してから切り替える
   */
  const switchWithLoraCheck = (props: {
    modelName: string
    family: CheckpointLoraFamily | null
    apply(): void
  }) => {
    const unusable = loraCompat.unusableWith(props.family)
    if (props.family === null || unusable.length === 0) {
      props.apply()
      return
    }
    setPendingSwitch({
      modelName: props.modelName,
      family: props.family,
      loraNames: unusable.map((lora) => lora.displayName),
      removeLoras: () => {
        for (const lora of unusable) context.changeLoraModel(lora.name)
      },
      apply: props.apply,
    })
  }

  const selectOfficialModel = (id: string, type: string) => {
    const model = context.imageModels.find((item) => item.id === id)
    switchWithLoraCheck({
      modelName: model?.displayName ?? model?.name ?? "",
      family: model ? imageModelLoraFamily(model) : null,
      apply: () => {
        // 公式モデルを選んだらみんなのモデルの選択は外す
        if (userModelSelection.checkpoint) {
          userModelSelection.clearCheckpoint({ restore: false })
        }
        context.updateModelId(id, type)
      },
    })
  }

  const selectUserCheckpoint = (model: UserModel) => {
    switchWithLoraCheck({
      modelName: model.name,
      family: userCheckpointLoraFamily(model.baseModel),
      apply: () => userModelSelection.selectCheckpoint(model),
    })
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
        )
      } else if (item.userModel) {
        selectUserCheckpoint(item.userModel)
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
    <ModelLibraryLauncherContext.Provider
      value={{ open, selectOfficialModel, selectUserCheckpoint }}
    >
      {props.children}
      <GenerationLoraSwitchDialog
        pending={pendingSwitch}
        onClose={() => setPendingSwitch(null)}
      />
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
            isUsableWithCurrentModel={(item) =>
              isLoraUsableWith(
                item.officialLora
                  ? officialLoraFamily(item.officialLora.name)
                  : userModelLoraFamily(item.userModel?.baseModel),
                loraCompat.checkpointFamily,
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
