import type { CodegenConfig } from "@graphql-codegen/cli"

const endPoint = "https://router-6ouzjmdzha-an.a.run.app"

const config: CodegenConfig = {
  overwrite: true,
  documents: "graphql/**/*.ts",
  generates: {
    "__generated__/apollo.ts": {
      schema: endPoint,
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        enumsAsConst: true,
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
