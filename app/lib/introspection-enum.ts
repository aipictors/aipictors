import type { introspection } from "@/graphql-env"

export type IntrospectionEnum<T extends keyof introspection["types"]> =
  introspection["types"][T] extends { enumValues: infer U } ? U : never
