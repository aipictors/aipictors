const viewerIdQuery = `query VerifyViewer { viewer { id isModerator currentPass { type } user { id mailAddress } } }`

export type VerifiedViewer = {
  viewerId: string
  userId: string
  isModerator: boolean
  userEmail: string | null
  currentPassType: string | null
}

const VERIFIED_VIEWER_TTL_MS = 30_000
const VERIFIED_VIEWER_MAX_ENTRIES = 2000
const verifiedViewers = new Map<
  string,
  { viewer: VerifiedViewer; expiresAt: number }
>()

/**
 * /api の各ルートが毎回 GraphQL を通して本人確認していて、同じページの数本で同じ確認を繰り返していた。
 * 同じトークンの確認結果を isolate で少しの間使い回す（成功だけ覚える）
 */
export const verifyViewerFromGraphQL = async (props: {
  graphqlEndpoint: string
  authorization: string
  wpUserId?: string | null
}): Promise<VerifiedViewer | null> => {
  const cacheKey = `${props.wpUserId ?? ""}:${props.authorization}`
  const cached = verifiedViewers.get(cacheKey)
  if (cached !== undefined && cached.expiresAt > Date.now()) {
    return cached.viewer
  }
  // GraphQL が一時的に失敗しただけのときは、もう一度だけ確かめる
  // （決済のボタンを押した人が「ログインしていない」扱いになり、決済画面を開けないことがあった）
  let result = await fetchVerifiedViewer(props).catch(() => "failed" as const)
  if (result === "failed") {
    await new Promise((resolve) => setTimeout(resolve, 250))
    result = await fetchVerifiedViewer(props).catch(() => "failed" as const)
  }
  const viewer = result === "failed" ? null : result
  if (viewer !== null) {
    if (verifiedViewers.size >= VERIFIED_VIEWER_MAX_ENTRIES) {
      verifiedViewers.clear()
    }
    verifiedViewers.set(cacheKey, {
      viewer,
      expiresAt: Date.now() + VERIFIED_VIEWER_TTL_MS,
    })
  }
  return viewer
}

const fetchVerifiedViewer = async (props: {
  graphqlEndpoint: string
  authorization: string
  wpUserId?: string | null
}): Promise<VerifiedViewer | null | "failed"> => {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: props.authorization,
    platform: "web",
  }

  if (props.wpUserId) {
    headers["wp-user-id"] = props.wpUserId
  }

  const response = await fetch(props.graphqlEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: viewerIdQuery }),
  })

  if (!response.ok) {
    // トークンが無効なとき（401・403）は確かめ直さない
    return response.status === 401 || response.status === 403 ? null : "failed"
  }

  const json = (await response.json()) as {
    errors?: unknown[]
    data?: {
      viewer?: {
        id?: string | null
        isModerator?: boolean | null
        currentPass?: {
          type?: string | null
        } | null
        user?: {
          id?: string | null
          mailAddress?: string | null
        } | null
      } | null
    }
  }

  const viewerId = json.data?.viewer?.id
  const userId = json.data?.viewer?.user?.id
  const isModerator = json.data?.viewer?.isModerator === true
  const userEmail = json.data?.viewer?.user?.mailAddress ?? null
  const currentPassType = json.data?.viewer?.currentPass?.type ?? null

  if (!viewerId || !userId) {
    // viewer を取れずにエラーが返ったときは、一時的な失敗かもしれない
    return json.data?.viewer == null && (json.errors?.length ?? 0) > 0
      ? "failed"
      : null
  }

  return { viewerId, userId, isModerator, userEmail, currentPassType }
}
