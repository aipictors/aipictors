import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { createClient as createCmsClient, createManagementClient } from "microcms-js-sdk"
import {
  type ActionData,
  DEFAULT_PLATFORM,
  DEFAULT_TAG,
  type ReleaseTag,
  tagOptions,
} from "~/lib/admin-release-shared"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const DISCORD_WEBHOOK_FALLBACK_URL =
  "https://discord.com/api/webhooks/1506267892872908982/OgQO6gWM3lg8N0dByUjUGHiGMCnzQ-CSBjOydRWjpdC-frxk4xl32yqCfdRZ_fvku0Rv"

const toJsonResponse = (body: ActionData, status: number) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
    },
  })
}

const isReleaseTag = (value: string): value is ReleaseTag => {
  return tagOptions.some((tag) => tag === value)
}

const resolveMicroCmsApiKey = (context: ActionFunctionArgs["context"]) => {
  return (
    getServerEnvValue(context, "MICROCMS_RELEASES_API_KEY") ??
    getServerEnvValue(context, "VITE_MICRO_CMS_API_KEY")
  )
}

const resolveMicroCmsManagementApiKey = (context: ActionFunctionArgs["context"]) => {
  return (
    getServerEnvValue(context, "MICROCMS_MANAGEMENT_API_KEY") ??
    getServerEnvValue(context, "MICROCMS_RELEASES_MANAGEMENT_API_KEY")
  )
}

const resolveDiscordWebhookUrl = (context: ActionFunctionArgs["context"]) => {
  return (
    getServerEnvValue(context, "DISCORD_RELEASES_WEBHOOK_URL") ??
    getServerEnvValue(context, "DISCORD_WEBHOOK_RELEASES_URL") ??
    DISCORD_WEBHOOK_FALLBACK_URL
  )
}

const resolveGraphqlEndpoint = (context: ActionFunctionArgs["context"]) => {
  return getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
}

export async function createAdminReleaseAction({ request, context }: ActionFunctionArgs) {
  try {
    if (request.method !== "POST") {
      return toJsonResponse({ error: "Method not allowed", data: null }, 405)
    }

    const authorization = request.headers.get("authorization")
    if (!authorization?.startsWith("Bearer ")) {
      return toJsonResponse({ error: "Unauthorized", data: null }, 401)
    }

    const graphqlEndpoint = resolveGraphqlEndpoint(context)
    if (!graphqlEndpoint) {
      return toJsonResponse(
        { error: "VITE_GRAPHQL_ENDPOINT_REMIX is not configured", data: null },
        500,
      )
    }

    const viewer = await verifyViewerFromGraphQL({
      graphqlEndpoint,
      authorization,
    })

    if (!viewer) {
      return toJsonResponse({ error: "Unauthorized", data: null }, 401)
    }

    if (viewer.userId !== "1") {
      return toJsonResponse(
        { error: "このページは UserID 1 の管理者のみ利用できます。", data: null },
        403,
      )
    }

    let payload: {
      title?: string
      description?: string
      imageUrl?: string
      tag?: string
      isImportant?: boolean
    }

    try {
      payload = (await request.json()) as typeof payload
    } catch {
      return toJsonResponse({ error: "リクエスト形式が不正です。", data: null }, 400)
    }

    const title = payload.title?.trim() ?? ""
    const description = payload.description?.trim() ?? ""
    const imageUrl = payload.imageUrl?.trim() ?? ""
    const selectedTag = payload.tag?.trim() ?? DEFAULT_TAG
    const isImportant = payload.isImportant === true

    if (title.length === 0) {
      return toJsonResponse({ error: "タイトルを入力してください。", data: null }, 400)
    }

    if (description.length === 0) {
      return toJsonResponse({ error: "説明文を入力してください。", data: null }, 400)
    }

    if (!isReleaseTag(selectedTag)) {
      return toJsonResponse({ error: "タグの値が不正です。", data: null }, 400)
    }

    if (imageUrl.length > 0) {
      try {
        new URL(imageUrl)
      } catch {
        return toJsonResponse({ error: "画像 URL の形式が不正です。", data: null }, 400)
      }
    }

    const apiKey = resolveMicroCmsApiKey(context)
    if (!apiKey) {
      return toJsonResponse({ error: "microCMS API キーが未設定です。", data: null }, 500)
    }

    const discordWebhookUrl = resolveDiscordWebhookUrl(context)
    if (!discordWebhookUrl) {
      return toJsonResponse({ error: "Discord webhook URL が未設定です。", data: null }, 500)
    }

    const microCmsClient = createCmsClient({
      serviceDomain: "aipictors",
      apiKey,
    })

    let thumbnailUrl: string | null = null
    let warning: string | null = null

    const managementApiKey = resolveMicroCmsManagementApiKey(context)

    if (imageUrl.length > 0) {
      if (managementApiKey) {
        try {
          const managementClient = createManagementClient({
            serviceDomain: "aipictors",
            apiKey: managementApiKey,
          })

          const uploadedMedia = await managementClient.uploadMedia({
            data: imageUrl,
          })

          thumbnailUrl = uploadedMedia.url
        } catch (error) {
          warning =
            error instanceof Error
              ? `画像の microCMS 登録に失敗したため、画像なしで登録しました: ${error.message}`
              : "画像の microCMS 登録に失敗したため、画像なしで登録しました。"
        }
      } else {
        warning =
          "Management API キーが未設定のため、microCMS には画像なしで登録しました。Discord には指定画像を表示します。"
      }
    }

    const createContent: {
      title: string
      description: string
      thumbnail_url?: string
      platform: string[]
      tag: ReleaseTag
      is_important: boolean
    } = {
      title,
      description,
      platform: [DEFAULT_PLATFORM],
      tag: selectedTag,
      is_important: isImportant,
    }

    if (thumbnailUrl) {
      createContent.thumbnail_url = thumbnailUrl
    }

    const created = await microCmsClient.create<{
      title: string
      description: string
      thumbnail_url?: string
      platform: string[]
      tag: ReleaseTag
      is_important: boolean
    }>({
      endpoint: "releases",
      content: createContent,
    })

    const releaseUrl = `https://www.aipictors.com/releases/${created.id}`
    const discordImageUrl = imageUrl || thumbnailUrl
    const discordResponse = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: [`【Aipictors お知らせ】`, title, releaseUrl].join("\n"),
        embeds: [
          {
            title,
            description: description.slice(0, 4000),
            url: releaseUrl,
            ...(discordImageUrl
              ? {
                  image: {
                    url: discordImageUrl,
                  },
                }
              : {}),
            fields: [
              {
                name: "タグ",
                value: selectedTag,
                inline: true,
              },
              {
                name: "platform",
                value: DEFAULT_PLATFORM,
                inline: true,
              },
              {
                name: "重要なお知らせ",
                value: isImportant ? "はい" : "いいえ",
                inline: true,
              },
            ],
          },
        ],
      }),
    })

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text()
      return toJsonResponse(
        {
          error:
            errorText.length > 0
              ? `microCMS への追加は完了しましたが、Discord 通知に失敗しました: ${errorText}`
              : "microCMS への追加は完了しましたが、Discord 通知に失敗しました。",
          data: {
            id: created.id,
            releaseUrl,
            discordDelivered: false,
            warning,
          },
        },
        502,
      )
    }

    return toJsonResponse(
      {
        error: null,
        data: {
          id: created.id,
          releaseUrl,
          discordDelivered: true,
          warning,
        },
      },
      200,
    )
  } catch (error) {
    return toJsonResponse(
      {
        error: error instanceof Error ? error.message : "お知らせの追加に失敗しました。",
        data: null,
      },
      500,
    )
  }
}