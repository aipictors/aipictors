const viewerIdQuery = `query VerifyViewer { viewer { id isModerator currentPass { type } user { id mailAddress } } }`

export type VerifiedViewer = {
  viewerId: string
  userId: string
  isModerator: boolean
  userEmail: string | null
  currentPassType: string | null
}

export const verifyViewerFromGraphQL = async (props: {
  graphqlEndpoint: string
  authorization: string
  wpUserId?: string | null
}): Promise<VerifiedViewer | null> => {
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
    return null
  }

  const json = (await response.json()) as {
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
    return null
  }

  return { viewerId, userId, isModerator, userEmail, currentPassType }
}
