const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const toStringValue = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined
}

export const getApolloErrorMessage = (error: unknown): string | undefined => {
  if (!isRecord(error)) {
    return undefined
  }

  const graphQLErrors = error.graphQLErrors

  if (Array.isArray(graphQLErrors)) {
    for (const graphQLError of graphQLErrors) {
      if (!isRecord(graphQLError)) {
        continue
      }

      const message = toStringValue(graphQLError.message)

      if (message) {
        return message
      }
    }
  }

  const networkError = error.networkError

  if (isRecord(networkError)) {
    const networkMessage = toStringValue(networkError.message)

    if (networkMessage) {
      return networkMessage
    }
  }

  return toStringValue(error.message)
}