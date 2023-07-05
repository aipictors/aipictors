import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  documents: "graphql/**/*.ts",
  generates: {
    "__generated__/react.ts": {
      schema: "schema.graphql",
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        enumsAsConst: true,
        avoidOptionals: {
          field: true,
          inputValue: true,
          object: true,
          defaultValue: false,
        },
      },
    },
  },
}

export default config
