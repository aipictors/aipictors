import { AppFixedContent } from "~/components/app/app-fixed-content"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { config } from "~/config"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { useBoolean, useMediaQuery } from "usehooks-ts"
import { VerificationDialog } from "~/components/verification-dialog"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { graphql } from "gql.tada"
import { GenerationDemoSubmitOperationParts } from "~/routes/($lang).generation.demonstration/components/submission-view/generation-demo-submit-operation-parts"
import type { GeminiImageSize } from "~/types/gemini-image-generation"
import { useIpAddress } from "~/hooks/use-ip-address"

/**
 * UIサイズタイプをGeminiImageSizeに変換する
 */
const convertToGeminiImageSize = (sizeType: string): GeminiImageSize => {
  switch (sizeType) {
    case "SD3_512_512":
    case "SD5_512_512":
      return "SQUARE_512"
    case "SD3_768_768":
    case "SD5_768_768":
      return "SQUARE_768"
    case "SD3_1024_1024":
    case "SD5_1024_1024":
      return "SQUARE_1024"
    case "SD3_1280_720":
      return "LANDSCAPE"
    case "SD3_720_1280":
    case "SD5_720_1280":
      return "PORTRAIT"
    default:
      return "SQUARE_1024"
  }
}

const ViewerTokenQuery = graphql(
  `query ViewerTokenQuery {
    viewer {
      id
      token
    }
  }`,
)

type Props = {
  termsText: string
}

export function GenerationDemoSubmissionView(props: Props) {
  const context = useGenerationContext()

  const queryData = useGenerationQuery()

  const navigate = useNavigate()

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [beforeGenerationParams, setBeforeGenerationParams] = useState("")

  const { data: tokenData } = useQuery(ViewerTokenQuery)

  // IPアドレス取得（バックエンド側でスキーマ更新後に有効化）
  const { ipInfo } = useIpAddress()

  const { data: pass, refetch: refetchPass } = useQuery(
    viewerCurrentPassQuery,
    {},
  )

  const [createTask, { loading: isCreatingTask }] = useMutation(
    createImageGenerationTaskMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
      onError(error) {
        if (isDesktop) {
          toast.error(error.message)
        } else {
          toast.error(error.message, { position: "top-center" })
        }
      },
    },
  )

  const [createFluxTask] = useMutation(createFluxImageGenerationTaskMutation, {
    refetchQueries: [viewerCurrentPassQuery],
    awaitRefetchQueries: true,
    onError(error) {
      if (isDesktop) {
        toast.error(error.message)
      } else {
        toast.error(error.message, { position: "top-center" })
      }
    },
  })

  const [createGeminiTask] = useMutation<{
    createGeminiImageGenerationTask: {
      id: string
      nanoid: string
      status: string
    }
  }>(createGeminiImageGenerationTaskMutation, {
    refetchQueries: [viewerCurrentPassQuery],
    awaitRefetchQueries: true,
    onCompleted(data) {
      // Geminiタスク作成後の成功メッセージ
      if (data?.createGeminiImageGenerationTask) {
        toast("Geminiタスクが作成されました。完了後に結果が表示されます。", {
          position: isDesktop ? "bottom-right" : "top-center",
        })
      }
    },
    onError(error) {
      if (isDesktop) {
        toast.error(error.message)
      } else {
        toast.error(error.message, { position: "top-center" })
      }
    },
  })

  const [createReservedTask] = useMutation(
    createImageGenerationTaskReservedMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
      onError(error) {
        if (isDesktop) {
          toast.error(error.message)
        } else {
          toast.error(error.message, { position: "top-center" })
        }
      },
    },
  )

  const authContext = useContext(AuthContext)

  const { data: lineUserId } = useQuery(viewerLineUserIdQuery, {
    skip: authContext.isNotLoggedIn,
  })

  const [signTerms, { loading: isSigningTerms }] = useMutation(
    signImageGenerationTermsMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    },
  )

  /**
   * 規約に同意する
   */
  const onSignTerms = async () => {
    try {
      await signTerms({ variables: { input: { version: 1 } } })
      toast("画像生成の利用規約に同意しました")
      window.location.reload()
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 同じSeedでリクエストを行ったかどうか、同じならエラーを表示する
   */
  const checkSameBeforeRequestAndToast: (
    modelName: string,
    generationType: string,
    i2iFileUrl: string,
  ) => boolean = (modelName, generationType, i2iFileUrl) => {
    const generationParams = {
      model: modelName,
      vae: context.config.vae ?? "",
      prompt: context.config.promptText,
      negativePrompt: context.config.negativePromptText,
      seed: context.config.seed,
      steps: context.config.steps,
      scale: context.config.scale,
      sampler: context.config.sampler,
      clipSkip: context.config.clipSkip,
      sizeType: context.config
        .sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
      type: generationType,
      i2iFileUrl: i2iFileUrl,
      t2tImageUrl: i2iFileUrl,
      t2tDenoisingStrengthSize:
        context.config.i2iDenoisingStrengthSize.toString(),
    }
    const generationParamsJson = JSON.stringify(generationParams)
    if (beforeGenerationParams === generationParamsJson) {
      toast(
        "前回と同じ生成条件での連続生成はできません。Seedを変更してください。",
      )
      return true
    }
    if (context.config.seed !== -1) {
      setBeforeGenerationParams(generationParamsJson)
    }
    return false
  }

  const getControlNetImageUrl = async (base64: string | null) => {
    if (base64 === null) {
      return null
    }

    const viewerToken = tokenData?.viewer?.token
    if (!viewerToken) {
      toast("認証エラーが発生しました。ログインし直してください。")
      return null
    }

    const controlNetImageUrl = await uploadPublicImage(base64, viewerToken)

    if (controlNetImageUrl === "") return null

    return controlNetImageUrl
  }

  // 認証モーダルの開閉
  const {
    value: isOpenVerificationModal,
    setTrue: openVerificationModal,
    setFalse: closeVerificationModal,
  } = useBoolean()

  const appContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip: appContext.isLoading,
  })

  const generatedCount = data?.viewer?.user.generatedCount ?? 0

  /**
   * タスクを作成ボタンを押したときのコールバック
   */
  const onCreateTask = async () => {
    const isStandardOrPremium =
      context.currentPass?.type === "STANDARD" ||
      context.currentPass?.type === "PREMIUM"

    const isLiteOrStandardOrPremium =
      context.currentPass?.type === "LITE" ||
      context.currentPass?.type === "STANDARD" ||
      context.currentPass?.type === "PREMIUM"

    if (
      !context.currentPass?.type &&
      !lineUserId?.viewer?.lineUserId &&
      !pass?.viewer?.currentPass?.type &&
      generatedCount >= 10 &&
      !isExistedPreviousPass
    ) {
      await refetchPass()
      if (!pass?.viewer?.currentPass?.type) {
        toast("本人確認が完了していません。本人確認を完了してください。")
        openVerificationModal()
        return
      }
    }

    /**
     * 生成種別
     */
    const generationType =
      context.config.i2iImageBase64 &&
      (isLiteOrStandardOrPremium || context.config.modelType === "GEMINI")
        ? "IMAGE_TO_IMAGE"
        : "TEXT_TO_IMAGE"

    // GEMINIの場合は画像から生成をプラン関係なく利用可能
    if (
      context.config.i2iImageBase64 &&
      !isLiteOrStandardOrPremium &&
      context.config.modelType !== "GEMINI"
    ) {
      toast("img2imgはLITE以上のプランでご利用いただけます。")
      return
    }

    if (context.config.generationCount > 1 && !isStandardOrPremium) {
      toast("STANDARD以上のプランで2枚以上を同時指定可能です。")
      return
    }

    // 生成中かつスタンダード、プレミアム以外ならサブスクに誘導
    if (inProgressImageGenerationTasksCount !== 0 && !isStandardOrPremium) {
      toast("STANDARD以上のプランで複数枚同時生成可能です。")
      return
    }

    // i2iの場合は連続生成数を超過していたらエラーにする
    if (
      generationType === "IMAGE_TO_IMAGE" &&
      inProgressImageGenerationTasksCount + context.config.generationCount >
        maxTasksCount
    ) {
      toast("同時生成枚数の上限です。")
      return
    }

    if (
      context.config.generationCount > 1 &&
      context.config.controlNetImageBase64 !== null
    ) {
      toast("ControlNetを使用する場合は1枚ずつ生成下さい。")
      return
    }

    if (
      context.config.modelType === "FLUX" &&
      context.config.controlNetImageBase64 !== null
    ) {
      if (isDesktop) {
        toast("FLUXモデルはControlNetを使用できません。")
        return
      }
      toast("FLUXモデルはControlNetを使用できません。", {
        position: "top-center",
      })
      return
    }

    if (context.config.modelType === "FLUX" && context.config.i2iImageBase64) {
      if (isDesktop) {
        toast(
          "FLUXモデルは画像から生成を一時的に停止しています、申し訳ございません",
        )
        return
      }
      toast(
        "FLUXモデルは画像から生成を一時的に停止しています、申し訳ございません",
        {
          position: "top-center",
        },
      )
      return
    }

    if (context.config.upscaleSize === 2 && context.config.i2iImageBase64) {
      if (isDesktop) {
        toast(
          "高解像度とi2iの組み合わせは現在一時停止しております、申し訳ございません",
        )
        return
      }
      toast(
        "高解像度とi2iの組み合わせは現在一時停止しております、申し訳ございません",
        {
          position: "top-center",
        },
      )
      return
    }

    if (
      context.config.controlNetImageBase64 !== null &&
      (context.config.controlNetWeight === null ||
        context.config.controlNetModule === null)
    ) {
      toast(
        "ControlNetの画像が設定されていますが、詳細設定が完了していません。画像を消すか、設定を完了して下さい。",
      )
      return
    }

    const userId = context.user?.id ?? null
    if (userId === null) {
      return null
    }

    const userNanoid = context.user?.nanoid ?? null
    if (userNanoid === null) {
      navigate("/new/profile")
      return null
    }

    const model = context.imageModels.find((model) => {
      return model.id === context.config.modelId
    })

    if (typeof model === "undefined") {
      toast("モデルが見つかりません、再度モデルを選択しなおしてください。")
      return
    }

    if (
      (model.name === "flux.1 schnell" || model.name === "flux.1 pro") &&
      !isStandardOrPremium
    ) {
      toast("flux.1は、STANDARD以上のプランで生成可能です。")
      return
    }

    // const ng = await checkNgPrompts(
    //   context.config.promptText,
    //   `${context.config.negativePromptText}, nsfw, nude`,
    //   model.name,
    //   userId,
    // )
    // if (ng.hit_words.length > 0) {
    //   toast(`プロンプトにNGワードが含まれています: ${ng.hit_words}`)
    //   return
    // }
    // if (ng.hit_negative_words.length > 0) {
    //   toast(
    //     `ネガティブプロンプトにNGワードが含まれています: ${ng.hit_negative_words}`,
    //   )
    //   return
    // }

    // 生成リクエストしたい回数分生成リクエストを行う
    // もし通常の連続生成を超過したら予約生成に切り替える
    try {
      if (
        checkSameBeforeRequestAndToast(model.name, generationType, "") === true
      ) {
        return
      }

      if (generationType === "IMAGE_TO_IMAGE") {
        const viewerToken = tokenData?.viewer?.token
        if (!viewerToken) {
          toast("認証エラーが発生しました。ログインし直してください。")
          return
        }

        const i2iFileUrl = await uploadPublicImage(
          context.config.i2iImageBase64,
          viewerToken,
        )
        await createTaskCore(
          context.config.generationCount,
          model.name,
          generationType,
          i2iFileUrl,
        )
      } else {
        await createTaskCore(
          context.config.generationCount,
          model.name,
          generationType,
          "",
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 生成APIを使って生成を開始する
   * @param taskCount
   * @param modelName
   * @param generationType
   * @param i2iFileUrl
   * @returns
   */
  const createTaskCore = async (
    taskCount: number,
    modelName: string,
    _generationType: string,
    i2iFileUrl: string,
  ) => {
    const taskCounts = Array.from({ length: taskCount }, (_, i) => i)

    // シードを設定する、連続生成のときはSeedは連番にする
    const seeds: number[] = []

    taskCounts.forEach((i) => {
      if (context.config.seed === -1) {
        seeds.push(-1)
      } else {
        seeds.push(context.config.seed + i)
      }
    })

    // プロンプトが設定されていない場合はランダムなプロンプトを使用する
    const promptsTexts: string[] = []

    taskCounts.forEach(() => {
      if (context.config.promptText) {
        promptsTexts.push(context.config.promptText)
      } else {
        promptsTexts.push(
          config.generationFeature.randomPrompts[
            Math.floor(
              Math.random() * config.generationFeature.randomPrompts.length,
            )
          ],
        )
      }
    })

    const controlNetImageUrl = await getControlNetImageUrl(
      context.config.controlNetImageBase64,
    )

    const nowGeneratingCount = inProgressImageGenerationTasksCost // 生成中枚数
    const promises = taskCounts.map((i) => {
      if (i2iFileUrl !== "" && i + 1 + nowGeneratingCount > maxTasksCount) {
        // i2iの場合は通常の連続生成の枚数を超過していたら何もしない
        return
      }
      if (i + 1 + nowGeneratingCount > maxTasksCount) {
        if (modelName === "flux.1 schnell" || modelName === "flux.1 pro") {
          // flux.1は予約生成に対応していない
          return
        }
        createReservedTask({
          variables: {
            input: {
              count: 1,
              model: "flux.1 schnell",
              vae: context.config.vae ?? "",
              prompt: context.config.promptText,
              isPromptGenerationEnabled:
                context.config.languageUsedForPrompt === "jp",
              negativePrompt: context.config.negativePromptText,
              seed: seeds[i],
              steps:
                context.config.steps >
                  config.generationFeature.imageGenerationMaxSteps ||
                context.config.steps < 9
                  ? config.generationFeature.imageGenerationMaxSteps
                  : context.config.steps,
              scale: context.config.scale,
              sampler: context.config.sampler,
              clipSkip: context.config.clipSkip,
              sizeType: context.config
                .sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
              type: "TEXT_TO_IMAGE",
              controlNetImageUrl: controlNetImageUrl,
              controlNetWeight: context.config.controlNetWeight
                ? Number(context.config.controlNetWeight)
                : null,
              controlNetModel: context.config.controlNetModel,
              controlNetModule: context.config.controlNetModule,
              upscaleSize: context.config.upscaleSize,
            },
          },
        })
      } else {
        if (modelName === "flux.1 schnell" || modelName === "flux.1 pro") {
          createFluxTask({
            variables: {
              input: {
                count: 1,
                prompt: promptsTexts[i],
                isPromptGenerationEnabled:
                  context.config.languageUsedForPrompt === "jp",
                negativePrompt: context.config.negativePromptText,
                seed: seeds[i],
                steps:
                  context.config.steps >
                    config.generationFeature.imageGenerationMaxSteps ||
                  context.config.steps < 9
                    ? config.generationFeature.imageGenerationMaxSteps
                    : context.config.steps,
                scale: context.config.scale,
                sizeType: context.config
                  .sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
                modelName: "flux.1 schnell",
              },
            },
          })
        } else if (
          modelName === "Gemini 2.5" ||
          context.config.modelType === "SD5" ||
          context.config.modelType === "GEMINI"
        ) {
          // Gemini 2.5モデル、SD5タイプ、またはGEMINIタイプの場合はGeminiタスクとして作成
          createGeminiTask({
            variables: {
              input: {
                prompt: promptsTexts[i],
                size: convertToGeminiImageSize(context.config.sizeType),
                imageUrl: i2iFileUrl || null,
                ipaddress: ipInfo?.ip || null,
              },
            },
          })
        } else {
          createTask({
            variables: {
              input: {
                count: 1,
                model: modelName,
                vae: context.config.vae ?? "",
                prompt: promptsTexts[i],
                isPromptGenerationEnabled:
                  context.config.languageUsedForPrompt === "jp",
                negativePrompt: context.config.negativePromptText,
                seed: seeds[i],
                steps:
                  context.config.steps >
                    config.generationFeature.imageGenerationMaxSteps ||
                  context.config.steps < 9
                    ? config.generationFeature.imageGenerationMaxSteps
                    : context.config.steps,
                scale: context.config.scale,
                sampler: context.config.sampler,
                clipSkip: context.config.clipSkip,
                sizeType: context.config
                  .sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
                type: "TEXT_TO_IMAGE",
                controlNetImageUrl: controlNetImageUrl,
                controlNetWeight: context.config.controlNetWeight
                  ? Number(context.config.controlNetWeight)
                  : null,
                controlNetModel: context.config.controlNetModel,
                controlNetModule: context.config.controlNetModule,
                upscaleSize: context.config.upscaleSize,
              },
            },
          })
        }
      }
    })
    // タスクの作成後も呼び出す必要がある
    toast("タスク作成をリクエストしました", { position: "top-center" })
    await Promise.all(promises)
    if (typeof context.user?.nanoid !== "string") {
      toast("画面更新して再度お試し下さい。")
      return
    }
    // await activeImageGeneration({ nanoid: context.user.nanoid })
  }

  /**
   * 最大生成枚数
   */
  const availableImageGenerationMaxTasksCount =
    queryData.userStatus?.availableImageGenerationMaxTasksCount ?? 10

  /**
   * 生成中コスト
   */
  const inProgressImageGenerationTasksCost =
    queryData.userStatus?.inProgressImageGenerationTasksCost ?? 0

  /**
   * 生成済みコスト
   */
  const remainingImageGenerationTasksCount =
    queryData.userStatus?.remainingImageGenerationTasksCount ?? 0

  /**
   * 同時生成最大枚数
   */
  const maxTasksCount =
    queryData.userStatus?.availableConsecutiveImageGenerationsCount ?? 0

  /**
   * 生成中の枚数
   */
  const inProgressImageGenerationTasksCount =
    queryData.userStatus?.inProgressImageGenerationTasksCount ?? 0

  /**
   * 予約生成中の枚数
   */
  const inProgressImageGenerationReservedTasksCount =
    queryData.userStatus?.inProgressImageGenerationReservedTasksCount ?? 0

  const [searchParams] = useSearchParams()

  const verificationResult = searchParams.get("result")

  const subscription = pass?.viewer?.currentPass?.type

  const isExistedPreviousPass = pass?.viewer?.isExistedPreviousPass

  return (
    <>
      <AppFixedContent position="bottom">
        <div className="space-y-2">
          <GenerationDemoSubmitOperationParts
            isCreatingTask={isCreatingTask || isSigningTerms}
            inProgressImageGenerationTasksCount={
              inProgressImageGenerationTasksCount
            }
            inProgressImageGenerationReservedTasksCount={
              inProgressImageGenerationReservedTasksCount
            }
            maxTasksCount={maxTasksCount}
            tasksCount={
              inProgressImageGenerationTasksCost +
              remainingImageGenerationTasksCount
            }
            termsText={props.termsText}
            availableImageGenerationMaxTasksCount={
              availableImageGenerationMaxTasksCount
            }
            onCreateTask={onCreateTask}
            onSignTerms={onSignTerms}
          />
        </div>
      </AppFixedContent>
      {subscription === undefined && !isExistedPreviousPass && (
        <VerificationDialog
          verificationResult={verificationResult}
          isOpen={isOpenVerificationModal}
          onClose={closeVerificationModal}
        />
      )}
    </>
  )
}

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
      isExistedPreviousPass
    }
  }`,
)

const viewerLineUserIdQuery = graphql(
  `query viewerLineUserId {
    viewer {
      id
      lineUserId
    }
  }`,
)

const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        generatedCount
      }
    }
  }`,
)

const createImageGenerationTaskReservedMutation = graphql(
  `mutation CreateReservedImageGenerationTask($input: CreateReservedImageGenerationTaskInput!) {
    createReservedImageGenerationTask(input: $input) {
      id
    }
  }`,
)

const createImageGenerationTaskMutation = graphql(
  `mutation CreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      id
    }
  }`,
)

const createFluxImageGenerationTaskMutation = graphql(
  `mutation CreateDemoFluxImageGenerationTask($input: CreateFluxImageGenerationTaskInput!) {
    createDemoFluxImageGenerationTask(input: $input) {
      id
    }
  }`,
)

const createGeminiImageGenerationTaskMutation = graphql(
  `mutation CreateGeminiImageGenerationTask($input: CreateGeminiImageGenerationTaskInput!) {
    createGeminiImageGenerationTask(input: $input) {
      id
      nanoid
      status
    }
  }`,
)

const signImageGenerationTermsMutation = graphql(
  `mutation SignImageGenerationTerms($input: SignImageGenerationTermsInput!) {
    signImageGenerationTerms(input: $input) {
      id
    }
  }`,
)
