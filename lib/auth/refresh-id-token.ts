type Props = {
  apiKey: string
  refreshToken: string
}

/**
 * https://firebase.google.com/docs/reference/rest/auth?hl=ja
 * @param refreshToken
 * @returns
 */
const refreshIdToken = async (props: Props) => {
  const resp = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${props.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: props.refreshToken,
      }),
    },
  )

  const json = await resp.json()

  return json
}
