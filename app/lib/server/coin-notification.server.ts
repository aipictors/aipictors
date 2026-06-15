const createCoinNotificationMutation = `
  mutation CreateCoinNotification($message: String!) {
    createCoinNotification(message: $message)
  }
`

type CoinNotificationEvent = {
  kind: "GRANT" | "CONSUME" | "EXPIRE"
  message: string
  freeCoins: number
  premiumCoins: number
}

export const createCoinNotificationsViaGraphQL = async (props: {
  graphqlEndpoint: string
  authorization: string
  events: CoinNotificationEvent[]
}) => {
  for (const event of props.events) {
    const response = await fetch(props.graphqlEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: props.authorization,
        platform: "web",
      },
      body: JSON.stringify({
        query: createCoinNotificationMutation,
        variables: { message: event.message },
      }),
    })

    const json = (await response.json()) as {
      data?: { createCoinNotification?: boolean | null }
      errors?: Array<{ message?: string }>
    }

    if (
      !response.ok ||
      json.errors?.length ||
      json.data?.createCoinNotification !== true
    ) {
      throw new Error(
        json.errors?.[0]?.message ?? "Failed to create coin notification",
      )
    }
  }
}