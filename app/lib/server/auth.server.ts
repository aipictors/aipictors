const viewerIdQuery = `query VerifyViewer { viewer { id isModerator user { id } } }`

export type VerifiedViewer = {
  viewerId: string
  userId: string
  isModerator: boolean
}

export const verifyViewerFromGraphQL = async (props: {
  graphqlEndpoint: string
  authorization: string
}): Promise<VerifiedViewer | null> => {
  const response = await fetch(props.graphqlEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: props.authorization,
      platform: "web",
    },
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
        user?: {
          id?: string | null
        } | null
      } | null
    }
  }

  const viewerId = json.data?.viewer?.id
  const userId = json.data?.viewer?.user?.id
  const isModerator = json.data?.viewer?.isModerator === true

  if (!viewerId || !userId) {
    return null
  }

  return { viewerId, userId, isModerator }
}
