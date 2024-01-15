import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://router-6ouzjmdzha-an.a.run.app",
  documents: "graphql/(fragments|mutations|queries)**/*.ts",
  ignoreNoDocuments: true,
  generates: {
    "graphql/__generated__/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
        fragmentMasking: false,
      },
      config: {
        enumsAsTypes: true,
        avoidOptionals: {
          defaultValue: false,
          field: true,
          inputValue: false,
          object: true,
        },
      },
    },
  },
}

export default config
