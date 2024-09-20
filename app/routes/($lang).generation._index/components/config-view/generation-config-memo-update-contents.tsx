import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { config } from "~/config"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onClose: () => void
  refetchMemos: () => void
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  memo: any
}

/**
 * 履歴メモ更新コンテンツ
 */
export function GenerationConfigMemoUpdateContent(props: Props) {
  const context = useGenerationContext()

  const [title, setTitle] = useState(props.memo.title)

  const [description, setDescription] = useState(props.memo.explanation)

  const [modelId, setModelId] = useState(props.memo.model.id)

  const [prompts, setPrompts] = useState(props.memo.prompts)

  const [negativePrompts, setNegativePrompts] = useState(
    props.memo.negativePrompts,
  )

  const [steps, setSteps] = useState(props.memo.steps)

  const [scale, setScale] = useState(props.memo.scale)

  const [seed, setSeed] = useState(props.memo.seed)

  const [sampler, setSampler] = useState(
    props.memo.sampler === "" ? "DPM++ 2M Karras" : props.memo.sampler,
  )

  const [vae, setVae] = useState(
    props.memo.vae === "" ? "vae-ft-mse-840000-ema-pruned" : props.memo.vae,
  )

  const [clipSkip, setClipSkip] = useState(props.memo.clipSkip)

  const [width, setWidth] = useState(0)

  const [height, setHeight] = useState(0)

  const [updateMemo, { loading: isUpdatingMemo }] = useMutation(
    updateImageGenerationMemoMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    },
  )

  const t = useTranslation()

  const [deleteMemo, { loading: isDeletingMemo }] = useMutation(
    deleteImageGenerationMemoMutation,
  )

  const onDelete = async () => {
    await deleteMemo({
      variables: {
        input: {
          nanoid: props.memo.nanoid,
        },
      },
    })
    props.refetchMemos()
    toast(t("削除しました", "Deleted"))
    props.onClose()
  }

  const onCreateMemo = async () => {
    await updateMemo({
      variables: {
        input: {
          nanoid: props.memo.nanoid,
          title: title,
          explanation: description,
          prompts: prompts,
          negativePrompts: negativePrompts,
          sampler: sampler,
          modelId: modelId,
          seed: seed,
          steps: steps,
          scale: scale,
          vae: vae,
          clipSkip: clipSkip,
          width: width,
          height: height,
        },
      },
    })
    props.refetchMemos()
  }

  /**
   * リストア
   */
  const onRestore = () => {
    const modelId =
      props.memo.model.id === "0" ? context.config.modelId : props.memo.model.id
    const promptText =
      props.memo.prompts === "" ? context.config.promptText : props.memo.prompts
    const negativePromptText =
      props.memo.negativePrompts === ""
        ? context.config.negativePromptText
        : props.memo.negativePrompts
    const scale = props.memo.scale
    const seed = props.memo.seed
    const clipSkip = props.memo.clipSkip
    const steps = props.memo.steps
    const sizeType = context.config.sizeType
    const modelType = context.config.modelType
    const vae = !props.memo.vae
      ? !context.config.vae
        ? "vae-ft-mse-840000-ema-pruned"
        : context.config.vae
      : props.memo.vae

    context.updateSettings(
      modelId,
      steps,
      modelType,
      sampler,
      scale,
      vae ?? props.memo.vae,
      promptText,
      negativePromptText,
      seed,
      sizeType,
      clipSkip,
      null,
      null,
      null,
      null,
    )

    toast(t("設定を復元しました", "Restored settings"))
  }

  return (
    <>
      {t("*タイトル", "*Title")}
      <Input
        onChange={(event) => {
          setTitle(event.target.value)
        }}
        type="text"
        value={title}
        placeholder={t("*タイトル", "*Title")}
      />
      {t("説明（省略可）", "Description (optional)")}
      <Input
        onChange={(event) => {
          setDescription(event.target.value)
        }}
        type="text"
        value={description}
        placeholder={t("説明（省略可）", "Description (optional)")}
      />
      {t("プロンプト", "Prompt")}
      <Textarea
        onChange={(event) => {
          setPrompts(event.target.value)
        }}
        value={prompts}
        placeholder={t("プロンプト", "Prompt")}
      >
        {prompts}
      </Textarea>
      {t("ネガティブプロンプト", "Negative Prompt")}
      <Textarea
        onChange={(event) => {
          setNegativePrompts(event.target.value)
        }}
        value={negativePrompts}
        placeholder={t("ネガティブプロンプト", "Negative Prompt")}
      >
        {negativePrompts}
      </Textarea>
      <div className="flex items-center space-x-2">
        <div className="w-full">
          {"Steps"}
          <Input
            onChange={(event) => {
              setSteps(Number(event.target.value))
            }}
            type="number"
            value={steps}
            placeholder={t("Steps", "Steps")}
          />
        </div>
        <div className="w-full">
          {"Scale"}
          <Input
            onChange={(event) => {
              setScale(Number(event.target.value))
            }}
            type="number"
            value={scale}
            placeholder={t("Scale", "Scale")}
          />
        </div>
        <div className="w-full">
          {"Seeds"}
          <Input
            onChange={(event) => {
              setSeed(Number(event.target.value))
            }}
            type="number"
            value={seed}
            placeholder={t("Seeds", "Seeds")}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-full">
          {"ClipSkip"}
          <Input
            onChange={(event) => {
              setClipSkip(Number(event.target.value))
            }}
            type="number"
            value={clipSkip}
            placeholder={t("ClipSkip", "ClipSkip")}
          />
        </div>
        <div className="w-full">
          {"Sampler"}
          <Select
            value={sampler}
            onValueChange={(value) => {
              setSampler(value)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {config.generationFeature.samplerValues.map((sampler) => (
                <SelectItem key={sampler} value={sampler}>
                  {sampler}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full">
          {"VAE"}
          <Select
            value={vae ?? "vae-ft-mse-840000-ema-pruned"}
            onValueChange={(value) => {
              setVae(value)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {config.generationFeature.vaeValues.map((vae) => (
                <SelectItem key={vae} value={vae}>
                  {vae}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 mb-0 flex items-center">
        {isDeletingMemo ? (
          <Loader2 className="mr-2 w-16 animate-spin" />
        ) : (
          <AppConfirmDialog
            title={t("設定を削除する", "Delete settings")}
            description={t(
              "選択したメモを削除しますか？",
              "Do you want to delete the selected memo?",
            )}
            onNext={onDelete}
            onCancel={() => {}}
          >
            <Button className="mr-4 h-11 w-16" variant={"ghost"} size={"icon"}>
              <Trash2Icon className="w-4" />
            </Button>
          </AppConfirmDialog>
        )}

        <Button
          variant={"secondary"}
          className="mr-4 w-full"
          onClick={() => {
            onRestore()
          }}
        >
          {t("使用する", "Use")}
        </Button>
        {isUpdatingMemo ? (
          <Loader2 className="w-16 animate-spin" />
        ) : (
          <Button
            variant={"secondary"}
            className="w-full"
            onClick={() => {
              if (title === "") {
                toast(t("タイトルを入力してください", "Please enter a title"))
                return
              }
              props.onClose()
              onCreateMemo()
            }}
          >
            {t("保存する", "Save")}
          </Button>
        )}
      </div>
    </>
  )
}

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
      }
    }
  }`,
)

const deleteImageGenerationMemoMutation = graphql(
  `mutation DeleteImageGenerationMemo($input: DeleteImageGenerationMemoInput!) {
    deleteImageGenerationMemo(input: $input) {
      id
      isDeleted
    }
  }`,
)

const updateImageGenerationMemoMutation = graphql(
  `mutation UpdateImageGenerationTask($input: UpdateImageGenerationMemoInput!) {
    updateImageGenerationMemo(input: $input) {
      id
      nanoid
      userId
      title
      explanation
      prompts
      negativePrompts
      sampler
      model {
        id
        name
        type
      }
      vae
      seed
      steps
      scale
      clipSkip
      width
      height
      isDeleted
      createdAt
    }
  }`,
)
