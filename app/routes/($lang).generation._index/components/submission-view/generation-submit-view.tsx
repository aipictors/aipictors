import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
import { useNavigate } from "~/lib/app/locale-router"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { useBoolean, useMediaQuery } from "usehooks-ts"
import { AppFixedContent } from "~/components/app/app-fixed-content"
import { VerificationDialog } from "~/components/verification-dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useIpAddress } from "~/hooks/use-ip-address"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import { GenerationCoinShortageDialog } from "~/routes/($lang).generation._index/components/submission-view/generation-coin-shortage-dialog"
import {
  GenerationNoticeBanner,
  GenerationNoticeDialog,
  useGenerationMaintenance,
} from "~/routes/($lang).generation._index/components/submission-view/generation-notice"
import { GenerationGeminiAllowanceNotice } from "~/routes/($lang).generation._index/components/submission-view/generation-gemini-allowance-notice"
import { GenerationGeminiLimitDialog } from "~/routes/($lang).generation._index/components/submission-view/generation-gemini-limit-dialog"
import { useGeminiAllowance } from "~/routes/($lang).generation._index/hooks/use-gemini-allowance"
import { GenerationPremiumCoinConfirmDialog } from "~/routes/($lang).generation._index/components/submission-view/generation-premium-coin-confirm-dialog"
import { GenerationSubmitOperationParts } from "~/routes/($lang).generation._index/components/submission-view/generation-submit-operation-parts"
import {
  useGenerationCoinSummary,
  useGenerationCoinSummaryRefresh,
} from "~/routes/($lang).generation._index/hooks/use-generation-coin-summary"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationNoticeConfirm } from "~/routes/($lang).generation._index/hooks/use-generation-notice-confirm"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import { useGenerationScheduler } from "~/routes/($lang).generation._index/hooks/use-generation-scheduler"
import { useGenerationTaskMutations } from "~/routes/($lang).generation._index/hooks/use-generation-task-mutations"
import { useIsEditingTextField } from "~/routes/($lang).generation._index/hooks/use-is-editing-text-field"
import { useImagesPerRequest } from "~/routes/($lang).generation._index/hooks/use-max-images-per-request"
import { usePremiumCoinConfirm } from "~/routes/($lang).generation._index/hooks/use-premium-coin-confirm"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"
// 追加: 診断ログ
import {
  logError,
  logInfo,
  logWarn,
} from "~/routes/($lang).generation._index/utils/client-diagnostics-logger"
import { findGenerationSubmitBlock } from "~/routes/($lang).generation._index/utils/find-generation-submit-block"
import { calcGenerationModelCoinCost } from "~/routes/($lang).generation._index/utils/generation-submit-coin"
import {
  signImageGenerationTermsMutation,
  viewerCurrentPassQuery,
  viewerLineUserIdQuery,
  ViewerTokenQuery,
  viewerUserQuery,
} from "~/routes/($lang).generation._index/utils/generation-submit-queries"
import {
  estimateGeminiCoinUse,
  estimatePremiumCoinUse,
} from "~/routes/($lang).generation._index/utils/premium-coin-confirm"
import { requestGenerationTasks } from "~/routes/($lang).generation._index/utils/request-generation-tasks"
import { uploadPublicImage } from "~/utils/upload-public-image"

type Props = {
  termsText: string
  /**
   * スマホで生成ボタンの上に出すプロンプト欄
   */
  composer?: React.ReactNode
}

export function GenerationSubmissionView(props: Props) {
  const context = useGenerationContext()

  const [scheduler] = useGenerationScheduler()

  const userModelSelection = useUserModelSelection()

  const imagesPerRequestState = useImagesPerRequest()

  const queryData = useGenerationQuery()

  const navigate = useNavigate()

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const isEditingTextField = useIsEditingTextField()

  const {
    isPremiumCoinConfirmEnabled,
    setIsPremiumCoinConfirmEnabled,
    premiumCoinConfirmAmount,
    settlePremiumCoinConfirm,
    confirmPremiumCoinUse,
  } = usePremiumCoinConfirm()

  const {
    generationNotice,
    generationNoticeDialogMode,
    setGenerationNoticeDialogMode,
    settleGenerationNotice,
    confirmGenerationNotice,
  } = useGenerationNoticeConfirm()

  // 画像生成のメンテナンス中は生成ボタンを押せなくする（帯は生成画面の枠に出す）
  const generationMaintenance = useGenerationMaintenance()

  const [beforeGenerationParams, setBeforeGenerationParams] = useState("")

  // コインが足りないときの案内（プラン・コイン購入）
  const [isCoinShortageOpen, setIsCoinShortageOpen] = useState(false)

  const [isGeminiLimitOpen, setIsGeminiLimitOpen] = useState(false)

  // プレミアムコインの確認で「Gemini の枠を超えるため」と伝えるか
  const [isPremiumCoinForGemini, setIsPremiumCoinForGemini] = useState(false)

  const authContext = useContext(AuthContext)

  const { coinSummary, loadCoinSummary } = useGenerationCoinSummary({
    isLoggedIn: authContext.isLoggedIn,
  })

  const { data: tokenData } = useQuery(ViewerTokenQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  // IPアドレス取得
  const { ipInfo } = useIpAddress()

  const isGeminiModelSelected =
    context.config.modelType === "GEMINI" ||
    context.config.modelId === "gemini-2.5-flash-image" ||
    context.config.modelId === "gemini-3.1-flash-image-preview"

  const { allowance: geminiAllowance, refetch: refetchGeminiAllowance } =
    useGeminiAllowance({
      isEnabled: isGeminiModelSelected && authContext.isLoggedIn,
    })

  const { data: pass, refetch: refetchPass } = useQuery(
    viewerCurrentPassQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )

  const {
    createTask,
    isCreatingTask,
    createFluxTask,
    createGeminiTask,
    createReservedTask,
  } = useGenerationTaskMutations({ isDesktop, setIsCoinShortageOpen })

  const { data: lineUserId } = useQuery(viewerLineUserIdQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
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
      scheduler: scheduler,
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

    const userNanoid = context.user?.nanoid ?? null
    if (userNanoid === null) {
      navigate("/new/profile")
      return null
    }

    const viewerToken = tokenData?.viewer?.token
    if (!viewerToken) {
      logError({
        source: "GenerationSubmit",
        message: "Viewer token missing for ControlNet upload",
      })
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
    skip: appContext.isLoading || appContext.isNotLoggedIn,
  })

  const generatedCount = data?.viewer?.user.generatedCount ?? 0

  /**
   * タスクを作成ボタンを押したときのコールバック
   */
  const onCreateTask = async () => {
    // 送信開始ログ
    logInfo({
      source: "GenerationSubmit",
      message: "Submit start",
      details: {
        plan: context.currentPass?.type ?? null,
        modelId: context.config.modelId,
        modelType: context.config.modelType,
        sizeType: context.config.sizeType,
        promptLength: context.config.promptText.length,
        negativePromptLength: context.config.negativePromptText.length,
        generationCount: context.config.generationCount,
        hasI2iImage: Boolean(context.config.i2iImageBase64),
        upscaleSize: context.config.upscaleSize,
      },
    })

    if (generationMaintenance.enabled) {
      toast("画像生成はメンテナンス中です")
      return
    }

    if (!(await confirmGenerationNotice())) {
      logInfo({
        source: "GenerationSubmit",
        message: "Cancelled: generation notice",
        details: { kind: generationNotice?.kind ?? null },
      })
      return
    }

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
      logWarn({
        source: "GenerationSubmit",
        message: "Blocked: verification required",
        details: { generatedCount },
      })
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

    logInfo({
      source: "GenerationSubmit",
      message: "Decided generationType",
      details: { generationType },
    })

    const submitBlock = findGenerationSubmitBlock({
      config: context.config,
      passType: context.currentPass?.type,
      generationType,
      inProgressImageGenerationTasksCount,
      maxTasksCount,
    })

    if (submitBlock !== null) {
      logWarn({ source: "GenerationSubmit", ...submitBlock.log })
      if (submitBlock.isTopCenterOnMobile && !isDesktop) {
        toast(submitBlock.toast, { position: "top-center" })
      } else {
        toast(submitBlock.toast)
      }
      return
    }

    const userId = context.user?.id ?? null
    if (userId === null) {
      logWarn({ source: "GenerationSubmit", message: "Blocked: no userId" })
      return null
    }

    const userNanoid = context.user?.nanoid ?? null
    if (userNanoid === null) {
      logWarn({ source: "GenerationSubmit", message: "Blocked: no userNanoid" })
      navigate("/new/profile")
      return null
    }

    const model = context.imageModels.find((model) => {
      return model.id === context.config.modelId
    })

    if (typeof model === "undefined") {
      logWarn({
        source: "GenerationSubmit",
        message: "Blocked: model not found",
      })
      toast("モデルが見つかりません、再度モデルを選択しなおしてください。")
      return
    }

    if (
      (model.name === "flux.1 schnell" || model.name === "flux.1 pro") &&
      !isStandardOrPremium
    ) {
      logWarn({
        source: "GenerationSubmit",
        message: "Blocked: flux.1 requires STANDARD+",
        details: { model: model.name },
      })
      toast("flux.1は、STANDARD以上のプランで生成可能です。")
      return
    }

    // みんなのモデル（チェックポイント）を選択中なら user/<id>.safetensors で生成する
    const requestModelName =
      userModelSelection.checkpointModelName ?? model.name

    // コインが足りないときは、送る前にプラン・コイン購入の案内を出す
    if (coinSummary !== null && coinSummary.totalBalance < requestCoinCost) {
      logInfo({
        source: "GenerationSubmit",
        message: "Blocked: coin shortage",
        details: { requestCoinCost, totalBalance: coinSummary.totalBalance },
      })
      setIsCoinShortageOpen(true)
      return
    }

    // Gemini は毎日のフリーコインから使える量に週の枠がある。足りなければ先に案内する
    const geminiCoinUse =
      isGeminiModelSelected &&
      geminiAllowance?.isEnforced === true &&
      coinSummary !== null
        ? estimateGeminiCoinUse({
            requestCoinCost,
            freeBalance: coinSummary.freeBalance,
            premiumBalance: coinSummary.premiumBalance,
            allowanceRemaining: geminiAllowance.remaining,
          })
        : null

    if (geminiCoinUse !== null && !geminiCoinUse.canGenerate) {
      logInfo({
        source: "GenerationSubmit",
        message: "Blocked: gemini allowance",
        details: { requestCoinCost, remaining: geminiAllowance?.remaining },
      })
      setIsGeminiLimitOpen(true)
      return
    }

    // フリーコインが足りずプレミアムコインを使うときは確認する
    if (isPremiumCoinConfirmEnabled && coinSummary !== null) {
      const premiumCoinUse =
        geminiCoinUse !== null
          ? geminiCoinUse.premiumUse
          : estimatePremiumCoinUse({
              requestCoinCost,
              freeBalance: coinSummary.freeBalance,
              premiumBalance: coinSummary.premiumBalance,
            })
      if (premiumCoinUse > 0) {
        setIsPremiumCoinForGemini(
          geminiCoinUse !== null && coinSummary.freeBalance >= requestCoinCost,
        )
        const isConfirmed = await confirmPremiumCoinUse(premiumCoinUse)
        if (!isConfirmed) {
          logInfo({
            source: "GenerationSubmit",
            message: "Cancelled: premium coin confirmation",
            details: { premiumCoinUse },
          })
          return
        }
      }
    }

    // 生成リクエストしたい回数分生成リクエストを行う
    // もし通常の連続生成を超過したら予約生成に切り替える
    try {
      if (
        checkSameBeforeRequestAndToast(requestModelName, generationType, "") ===
        true
      ) {
        logWarn({
          source: "GenerationSubmit",
          message: "Blocked: same parameters as previous",
        })
        return
      }

      if (generationType === "IMAGE_TO_IMAGE") {
        const i2iFileUrl = await (async () => {
          const viewerToken = tokenData?.viewer?.token
          if (!viewerToken) {
            logError({
              source: "GenerationSubmit",
              message: "Viewer token missing for IMG2IMG upload",
            })
            toast("認証エラーが発生しました。ログインし直してください。")
            return ""
          }

          logInfo({
            source: "GenerationSubmit",
            message: "Uploading IMG2IMG (public)",
            details: { size: context.config.i2iImageBase64?.length ?? 0 },
          })
          return uploadPublicImage(context.config.i2iImageBase64, viewerToken)
        })()

        if (i2iFileUrl === "") {
          logError({
            source: "GenerationSubmit",
            message: "Upload failed (token missing or upload error)",
          })
          return
        }
        logInfo({
          source: "GenerationSubmit",
          message: "Upload success",
          details: {
            urlOrigin: (() => {
              try {
                return new URL(i2iFileUrl).origin
              } catch {
                return undefined
              }
            })(),
          },
        })
        await createTaskCore(
          context.config.generationCount,
          requestModelName,
          generationType,
          i2iFileUrl,
        )
      } else {
        await createTaskCore(
          context.config.generationCount,
          requestModelName,
          generationType,
          "",
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        logError({
          source: "GenerationSubmit",
          message: "onCreateTask threw",
          details: { name: error.name, message: error.message },
        })
        if (error.message.includes("コイン残高が不足")) {
          setIsCoinShortageOpen(true)
          return
        }
        if (error.message.includes("Gemini の枠")) {
          setIsGeminiLimitOpen(true)
          return
        }
        toast(error.message)
      }
    }
  }

  /**
   * 最大生成枚数
   */
  const availableImageGenerationMaxTasksCount =
    queryData.userStatus?.availableImageGenerationMaxTasksCount ?? 10

  /**
   * 残り生成可能枚数
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

  const isLiteOrStandardOrPremium =
    context.currentPass?.type === "LITE" ||
    context.currentPass?.type === "STANDARD" ||
    context.currentPass?.type === "PREMIUM"

  const selectedGenerationType =
    context.config.i2iImageBase64 &&
    (isLiteOrStandardOrPremium || context.config.modelType === "GEMINI")
      ? "IMAGE_TO_IMAGE"
      : "TEXT_TO_IMAGE"

  const selectedModel = context.imageModels.find((model) => {
    return model.id === context.config.modelId
  })

  const selectedModelCoinCost = calcGenerationModelCoinCost({
    modelKey:
      selectedModel?.name ?? selectedModel?.id ?? context.config.modelId ?? "",
    modelType: context.config.modelType,
    generationType: selectedGenerationType,
    upscaleSize: context.config.upscaleSize,
    sizeType: context.config.sizeType,
  })

  /**
   * 1 回の生成で作る枚数（上限はサーバーと同じ決まり。利用者が 1〜上限で選べる）
   */
  const imagesPerRequest = imagesPerRequestState.count

  const requestCoinCost =
    selectedModelCoinCost *
    imagesPerRequest *
    Math.max(1, context.config.generationCount)

  const isCoinSummaryLoading = authContext.isLoggedIn && coinSummary === null
  const ownedCoinCount = coinSummary?.totalBalance ?? 0

  useGenerationCoinSummaryRefresh({
    isLoggedIn: authContext.isLoggedIn,
    loadCoinSummary,
  })

  // 移動: createTaskCore をコンポーネント内に配置（スコープ修正）
  const createTaskCore = async (
    taskCount: number,
    modelName: string,
    generationType: string,
    i2iFileUrl: string,
  ) => {
    await requestGenerationTasks({
      taskCount,
      modelName,
      generationType,
      i2iFileUrl,
      config: context.config,
      scheduler,
      imagesPerRequest,
      inProgressImageGenerationTasksCount,
      maxTasksCount,
      getControlNetImageUrl,
      createTask,
      createFluxTask,
      createGeminiTask,
      createReservedTask,
      onFinished: async () => {
        if (isGeminiModelSelected) {
          refetchGeminiAllowance()
        }
        await loadCoinSummary().catch((error) => {
          if (error instanceof Error) {
            logWarn({
              source: "GenerationSubmit",
              message: "Failed to refresh coin summary",
              details: { message: error.message },
            })
          }
        })
        if (typeof context.user?.nanoid !== "string") {
          logWarn({
            source: "GenerationSubmit",
            message: "Missing user nanoid after tasks",
          })
          toast("画面更新して再度お試し下さい。")
          return
        }
      },
    })
  }

  return (
    <>
      <AppFixedContent
        position="bottom"
        className={cn(
          props.composer &&
            "pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]",
          !isDesktop && isEditingTextField && "hidden",
        )}
      >
        <div className="space-y-2">
          {props.composer && (
            <div className="empty:hidden md:hidden">{props.composer}</div>
          )}
          {generationNotice !== null && (
            <GenerationNoticeBanner
              notice={generationNotice}
              onOpen={() => setGenerationNoticeDialogMode("info")}
            />
          )}
          {isGeminiModelSelected && geminiAllowance !== null && (
            <GenerationGeminiAllowanceNotice
              allowance={geminiAllowance}
              coinCost={selectedModelCoinCost}
              premiumBalance={coinSummary?.premiumBalance ?? 0}
            />
          )}
          <GenerationSubmitOperationParts
            isCreatingTask={isCreatingTask || isSigningTerms}
            inProgressImageGenerationTasksCount={
              inProgressImageGenerationTasksCount
            }
            inProgressImageGenerationReservedTasksCount={
              inProgressImageGenerationReservedTasksCount
            }
            maxTasksCount={maxTasksCount}
            remainingImageGenerationTasksCount={
              remainingImageGenerationTasksCount
            }
            isCoinSummaryLoading={isCoinSummaryLoading}
            requestCoinCost={requestCoinCost}
            imagesPerRequest={imagesPerRequest}
            ownedCoinCount={ownedCoinCount}
            freeCoinBalance={coinSummary?.freeBalance ?? 0}
            premiumCoinBalance={coinSummary?.premiumBalance ?? 0}
            termsText={props.termsText}
            availableImageGenerationMaxTasksCount={
              remainingImageGenerationTasksCount
            }
            isMaintenance={generationMaintenance.enabled}
            onCreateTask={onCreateTask}
            onSignTerms={onSignTerms}
          />
        </div>
      </AppFixedContent>
      <GenerationCoinShortageDialog
        open={isCoinShortageOpen}
        onOpenChange={setIsCoinShortageOpen}
        passType={subscription ?? null}
        isExistedPreviousPass={isExistedPreviousPass === true}
        totalBalance={coinSummary?.totalBalance ?? 0}
        affordableImages={
          selectedModelCoinCost > 0
            ? Math.floor(
                (coinSummary?.totalBalance ?? 0) / selectedModelCoinCost,
              )
            : 0
        }
      />
      <GenerationGeminiLimitDialog
        open={isGeminiLimitOpen}
        onOpenChange={setIsGeminiLimitOpen}
        coinCost={selectedModelCoinCost}
        premiumBalance={coinSummary?.premiumBalance ?? 0}
        passType={subscription ?? null}
        resetsAt={geminiAllowance?.resetsAt ?? null}
      />
      <GenerationNoticeDialog
        notice={generationNoticeDialogMode === null ? null : generationNotice}
        mode={generationNoticeDialogMode ?? "info"}
        onProceed={() => settleGenerationNotice(true)}
        onClose={() => settleGenerationNotice(false)}
      />
      <GenerationPremiumCoinConfirmDialog
        key={premiumCoinConfirmAmount === null ? "closed" : "open"}
        premiumCoinAmount={premiumCoinConfirmAmount}
        isGeminiAllowance={isPremiumCoinForGemini}
        onConfirm={({ isNeverAskAgain }) => {
          if (isNeverAskAgain) setIsPremiumCoinConfirmEnabled(false)
          settlePremiumCoinConfirm(true)
        }}
        onCancel={() => settlePremiumCoinConfirm(false)}
      />
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
