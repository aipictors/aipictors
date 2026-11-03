import { useMutation, useQuery } from "@apollo/client/index"
import { getAuth, getIdToken } from "firebase/auth"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"
import {
  adminAdjustCoinsMutation,
  adminCoinOperationHistoriesQuery,
  viewerQuery,
} from "~/routes/($lang)._main.admin.coins/components/admin-coins-queries"
import {
  type AdminAdjustCoinsResult,
  type AdminCoinOperationHistory,
  type AmazonExchangeAdminListData,
  type ExchangeStatusFilter,
  filterExchangeRequests,
  type OperationType,
  parseUserIdsText,
  type PlanType,
  type TargetScope,
} from "~/routes/($lang)._main.admin.coins/utils/admin-coins-utils"

/**
 * コイン操作のページの状態と操作
 */
export function useAdminCoinsPage() {
  const authContext = useContext(AuthContext)
  const [operationType, setOperationType] = useState<OperationType>("GRANT")
  const [targetScope, setTargetScope] = useState<TargetScope>("ALL")
  const [planType, setPlanType] = useState<PlanType>("FREE")
  const [userIdsText, setUserIdsText] = useState("")
  const [freeCoins, setFreeCoins] = useState("0")
  const [premiumCoins, setPremiumCoins] = useState("0")
  const [expiresAtInput, setExpiresAtInput] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<AdminAdjustCoinsResult | null>(
    null,
  )
  const [exchangeListData, setExchangeListData] =
    useState<AmazonExchangeAdminListData | null>(null)
  const [isLoadingExchangeList, setIsLoadingExchangeList] = useState(false)
  const [exchangeStatusFilter, setExchangeStatusFilter] =
    useState<ExchangeStatusFilter>("PENDING")
  const [giftCodeByRequestId, setGiftCodeByRequestId] = useState<
    Record<string, string>
  >({})
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null,
  )

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const {
    data: historyData,
    loading: historyLoading,
    refetch: refetchHistory,
  } = useQuery(adminCoinOperationHistoriesQuery, {
    variables: {
      offset: 0,
      limit: 20,
    },
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "network-only",
  })

  const [mutate, { loading: isSubmitting }] = useMutation(
    adminAdjustCoinsMutation,
  )

  const hasPermission = Boolean(viewerData?.viewer?.isModerator)

  const parsedFreeCoins = Math.max(
    0,
    Number.parseInt(freeCoins || "0", 10) || 0,
  )
  const parsedPremiumCoins = Math.max(
    0,
    Number.parseInt(premiumCoins || "0", 10) || 0,
  )
  const requiresExpiry =
    operationType === "GRANT" && (parsedFreeCoins > 0 || parsedPremiumCoins > 0)
  const parsedUserIds = parseUserIdsText(userIdsText)
  const histories = (historyData?.adminCoinOperationHistories ??
    []) as AdminCoinOperationHistory[]
  const historyCount = historyData?.adminCoinOperationHistoriesCount ?? 0

  const withAuthHeader = async () => {
    const currentUser = getAuth().currentUser
    if (!currentUser) {
      throw new Error("ログインが必要です。")
    }

    const idToken = await getIdToken(currentUser)

    return {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    }
  }

  const loadExchangeList = async () => {
    try {
      setIsLoadingExchangeList(true)
      const headers = await withAuthHeader()

      const [pendingResponse, approvedResponse] = await Promise.all([
        fetch(`/api/admin/amazon-exchange?status=PENDING&limit=100`, {
          method: "GET",
          headers,
        }),
        fetch(`/api/admin/amazon-exchange?status=APPROVED&limit=100`, {
          method: "GET",
          headers,
        }),
      ])

      const [pendingJson, approvedJson] = (await Promise.all([
        pendingResponse.json(),
        approvedResponse.json(),
      ])) as Array<{
        error: string | null
        data?: AmazonExchangeAdminListData
      }>

      if (
        !pendingResponse.ok ||
        !approvedResponse.ok ||
        pendingJson.error ||
        approvedJson.error
      ) {
        throw new Error(
          pendingJson.error ??
            approvedJson.error ??
            "交換申請一覧の取得に失敗しました。",
        )
      }

      const pendingRequests = pendingJson.data?.requests ?? []
      const approvedRequests = approvedJson.data?.requests ?? []
      const mergedRequests = [...pendingRequests, ...approvedRequests].sort(
        (a, b) => (b.appliedAt ?? 0) - (a.appliedAt ?? 0),
      )

      setExchangeListData({
        requests: mergedRequests,
        totalCount:
          (pendingJson.data?.totalCount ?? pendingRequests.length) +
          (approvedJson.data?.totalCount ?? approvedRequests.length),
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "交換申請一覧の取得に失敗しました。"
      toast.error(message)
    } finally {
      setIsLoadingExchangeList(false)
    }
  }

  const handleApproveExchangeRequest = async (requestId: string) => {
    const giftCode = (giftCodeByRequestId[requestId] ?? "").trim()
    if (!giftCode) {
      toast.error("Amazonギフトコードを入力してください。")
      return
    }

    try {
      setApprovingRequestId(requestId)
      const headers = await withAuthHeader()
      const response = await fetch("/api/admin/amazon-exchange", {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestId,
          amazonGiftCode: giftCode,
        }),
      })

      const json = (await response.json()) as {
        error: string | null
        data?: { notificationSent?: boolean }
      }

      if (!response.ok || json.error) {
        throw new Error(json.error ?? "コード反映に失敗しました。")
      }

      setGiftCodeByRequestId((current) => ({
        ...current,
        [requestId]: "",
      }))

      toast.success(
        json.data?.notificationSent === false
          ? "コード反映を完了しました。通知作成は確認できませんでした。"
          : "コード反映と承認を完了しました。",
      )

      await loadExchangeList()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "コード反映に失敗しました。"
      toast.error(message)
    } finally {
      setApprovingRequestId(null)
    }
  }

  useEffect(() => {
    if (!hasPermission) {
      return
    }

    void loadExchangeList()
  }, [hasPermission])

  const exchangeRequests = exchangeListData?.requests ?? []
  const pendingExchangeRequests = exchangeRequests.filter(
    (request) => request.status === "PENDING",
  )
  const approvedExchangeRequests = exchangeRequests.filter(
    (request) => request.status === "APPROVED",
  )
  const reflectedExchangeRequests = approvedExchangeRequests.filter(
    (request) => (request.amazonGiftCode?.trim().length ?? 0) > 0,
  )

  const displayedExchangeRequests = filterExchangeRequests(
    exchangeRequests,
    exchangeStatusFilter,
  )

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (parsedFreeCoins === 0 && parsedPremiumCoins === 0) {
      const message = "付与または減少するコイン数を入力してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    if (requiresExpiry && !expiresAtInput) {
      const message = "付与コインの失効日時を指定してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    if (targetScope === "USER_IDS" && parsedUserIds.length === 0) {
      const message = "対象ユーザIDを1件以上入力してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    const expiresAt = expiresAtInput
      ? Math.floor(new Date(expiresAtInput).getTime() / 1000)
      : undefined

    if (requiresExpiry && (!expiresAt || Number.isNaN(expiresAt))) {
      const message = "失効日時の形式が不正です。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    try {
      setSubmitError(null)

      const freeDelta =
        operationType === "GRANT" ? parsedFreeCoins : -parsedFreeCoins
      const premiumDelta =
        operationType === "GRANT" ? parsedPremiumCoins : -parsedPremiumCoins

      const response = await mutate({
        variables: {
          targetScope,
          planType: targetScope === "PLAN" ? planType : null,
          userIds: targetScope === "USER_IDS" ? parsedUserIds : null,
          freeDelta,
          premiumDelta,
          expiresAt: requiresExpiry ? expiresAt : null,
        },
      })

      const result = response.data?.adminAdjustCoins ?? null

      if (!result) {
        throw new Error("コイン操作の実行に失敗しました。")
      }

      setLastResult(result)
      setOperationType("GRANT")
      setTargetScope("ALL")
      setPlanType("FREE")
      setUserIdsText("")
      setFreeCoins("0")
      setPremiumCoins("0")
      setExpiresAtInput("")
      setSubmitError(null)
      await refetchHistory()
      toast.success(
        `コイン操作が完了しました。対象 ${result.targetCount} 件中 ${result.changedCount} 件を更新しました。`,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "コイン操作の実行に失敗しました。"
      setSubmitError(message)
      toast.error(message)
    }
  }

  return {
    approvedExchangeRequests,
    approvingRequestId,
    authContext,
    displayedExchangeRequests,
    exchangeStatusFilter,
    expiresAtInput,
    freeCoins,
    giftCodeByRequestId,
    handleApproveExchangeRequest,
    hasPermission,
    histories,
    historyCount,
    historyLoading,
    isLoadingExchangeList,
    isSubmitting,
    lastResult,
    loadExchangeList,
    onSubmit,
    operationType,
    parsedUserIds,
    pendingExchangeRequests,
    planType,
    premiumCoins,
    reflectedExchangeRequests,
    setExchangeStatusFilter,
    setExpiresAtInput,
    setFreeCoins,
    setGiftCodeByRequestId,
    setOperationType,
    setPlanType,
    setPremiumCoins,
    setTargetScope,
    setUserIdsText,
    submitError,
    targetScope,
    userIdsText,
    viewerLoading,
  }
}

export type AdminCoinsPageState = ReturnType<typeof useAdminCoinsPage>
