type CloudflareContextEnv = {
  cloudflare?: {
    env?: Record<string, unknown>
  }
}

export const getServerEnvValue = (
  context: unknown,
  key: string,
): string | null => {
  const fromContext = (context as CloudflareContextEnv | undefined)?.cloudflare
    ?.env?.[key]

  if (typeof fromContext === "string" && fromContext.length > 0) {
    return fromContext
  }

  const fromBuild = (import.meta.env as Record<string, string | undefined>)[key]

  if (typeof fromBuild === "string" && fromBuild.length > 0) {
    return fromBuild
  }

  const fromProcess =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)[key]
      : undefined

  if (typeof fromProcess === "string" && fromProcess.length > 0) {
    return fromProcess
  }

  return null
}
