import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  type VerifiedViewer,
  verifyViewerFromGraphQL,
} from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import type { UserModel } from "~/lib/user-models/types"

type RouteContext =
  | LoaderFunctionArgs["context"]
  | ActionFunctionArgs["context"]

export function toUserModelsJsonResponse(
  body: unknown,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

type ApiTarget = {
  apiBaseUrl: string
  headers: Record<string, string>
}

/**
 * aipictors-api の internal API を呼ぶための接続先とヘッダー
 */
function resolveApiTarget(
  context: RouteContext,
): ApiTarget | { error: Response } {
  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken = getServerEnvValue(
    context,
    "AIPICTORS_API_INTERNAL_TOKEN",
  )
  const cfAccessClientId = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_ID",
  )
  const cfAccessClientSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )

  if (!internalToken) {
    return {
      error: toUserModelsJsonResponse(
        { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
        500,
      ),
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${internalToken}`,
  }

  if (cfAccessClientId && cfAccessClientSecret) {
    headers["CF-Access-Client-Id"] = cfAccessClientId
    headers["CF-Access-Client-Secret"] = cfAccessClientSecret
  }

  return { apiBaseUrl, headers }
}

/**
 * Authorization ヘッダーの Firebase ID トークンから viewer を検証する
 * required=false のときは未ログインでも null を返して続行する
 */
async function resolveViewer(
  request: Request,
  context: RouteContext,
  required: boolean,
): Promise<{ viewer: VerifiedViewer | null } | { error: Response }> {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    if (!required) {
      return { viewer: null }
    }
    return {
      error: toUserModelsJsonResponse(
        { error: "ログインが必要です", data: null },
        401,
      ),
    }
  }

  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
  if (!graphqlEndpoint) {
    return {
      error: toUserModelsJsonResponse(
        { error: "VITE_GRAPHQL_ENDPOINT_REMIX is not configured", data: null },
        500,
      ),
    }
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
  })

  if (!viewer && required) {
    return {
      error: toUserModelsJsonResponse(
        { error: "ログインが必要です", data: null },
        401,
      ),
    }
  }

  return { viewer }
}

export type UserModelsProxyContext = {
  viewer: VerifiedViewer | null
  apiBaseUrl: string
  headers: Record<string, string>
}

export async function resolveUserModelsProxy(props: {
  request: Request
  context: RouteContext
  requireViewer: boolean
}): Promise<
  | { ok: true; value: UserModelsProxyContext & { viewer: VerifiedViewer } }
  | { ok: true; value: UserModelsProxyContext }
  | { ok: false; response: Response }
> {
  const target = resolveApiTarget(props.context)
  if ("error" in target) {
    return { ok: false, response: target.error }
  }

  const viewerResult = await resolveViewer(
    props.request,
    props.context,
    props.requireViewer,
  )
  if ("error" in viewerResult) {
    return { ok: false, response: viewerResult.error }
  }

  return {
    ok: true,
    value: {
      viewer: viewerResult.viewer,
      apiBaseUrl: target.apiBaseUrl,
      headers: target.headers,
    },
  }
}

/**
 * aipictors-api のレスポンスを { error, data } 形式のままブラウザに返す
 * HTML（Cloudflare のエラーページ等）はメッセージに置き換える
 */
export async function relayUserModelsApiResponse(
  apiResponse: Response,
  fallbackError: string,
): Promise<Response> {
  const text = await apiResponse.text()
  const parsed = (() => {
    if (!text) return null
    try {
      return JSON.parse(text) as Record<string, unknown>
    } catch {
      return null
    }
  })()

  if (parsed === null) {
    const message =
      text && !text.trim().startsWith("<") ? text.slice(0, 500) : fallbackError
    return toUserModelsJsonResponse(
      { error: apiResponse.ok ? null : message, data: null },
      apiResponse.ok
        ? 200
        : apiResponse.status >= 500
          ? 502
          : apiResponse.status,
    )
  }

  const status = apiResponse.ok
    ? 200
    : apiResponse.status >= 500
      ? 502
      : apiResponse.status

  return toUserModelsJsonResponse(
    {
      ...parsed,
      error:
        typeof parsed.error === "string"
          ? parsed.error
          : apiResponse.ok
            ? null
            : fallbackError,
      data: parsed.data ?? null,
    },
    status,
  )
}

export async function callUserModelsApi(props: {
  proxy: UserModelsProxyContext
  path: string
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT"
  json?: unknown
  fallbackError: string
}): Promise<Response> {
  try {
    const headers: Record<string, string> = { ...props.proxy.headers }
    if (props.json !== undefined) {
      headers["content-type"] = "application/json"
    }
    const apiResponse = await fetch(`${props.proxy.apiBaseUrl}${props.path}`, {
      method: props.method,
      headers,
      body: props.json !== undefined ? JSON.stringify(props.json) : undefined,
    })
    return relayUserModelsApiResponse(apiResponse, props.fallbackError)
  } catch (error) {
    return toUserModelsJsonResponse(
      {
        error: error instanceof Error ? error.message : props.fallbackError,
        data: null,
      },
      502,
    )
  }
}

/**
 * ブラウザから受け取った JSON 本文を読み、userId はサーバー側の値で上書きする
 */
export async function readJsonBodyWithUserId(
  request: Request,
  userId: string,
): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return { userId }
    }
    return { ...(body as Record<string, unknown>), userId }
  } catch {
    return null
  }
}

/**
 * サーバー（loader）からみんなのモデルの一覧を取得する（未ログイン扱い・公開中のモデルのみ）
 * 失敗したときは空の一覧を返す（SSR の表示やサイトマップのため。ブラウザ側で再取得される）
 */
export async function fetchPublicUserModels(
  context: RouteContext,
  params: {
    sort?: "popular" | "new"
    kind?: string | null
    baseModel?: string | null
    q?: string | null
    ratings?: string[]
    offset?: number
    limit?: number
  },
): Promise<{ models: UserModel[]; hasMore: boolean }> {
  const target = resolveApiTarget(context)
  if ("error" in target) {
    return { models: [], hasMore: false }
  }
  const search = new URLSearchParams()
  search.set("sort", params.sort ?? "popular")
  if (params.kind) search.set("kind", params.kind)
  if (params.baseModel) search.set("baseModel", params.baseModel)
  if (params.q) search.set("q", params.q)
  search.set("ratings", (params.ratings ?? ["G", "R15"]).join(","))
  search.set("offset", String(params.offset ?? 0))
  search.set("limit", String(Math.min(Math.max(params.limit ?? 24, 1), 60)))
  try {
    const response = await fetch(
      `${target.apiBaseUrl}/internal/user-models?${search.toString()}`,
      { headers: target.headers },
    )
    if (!response.ok) {
      return { models: [], hasMore: false }
    }
    const json = (await response.json()) as {
      data?: {
        models?: UserModel[]
        hasMore?: boolean
      } | null
    }
    const models = (json.data?.models ?? []).filter(
      (model) => model.status === "READY",
    )
    return {
      models,
      hasMore: json.data?.hasMore ?? false,
    }
  } catch {
    return { models: [], hasMore: false }
  }
}
