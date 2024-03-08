type Props = {
  apiKey: string
  idToken: string
}

export async function verifyIdToken(props: Props) {
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${props.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: props.idToken }),
    },
  )

  const json = await resp.json()

  return json
}
