import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  documents: "graphql/**/*.ts",
  generates: {
    "__generated__/apollo.ts": {
      schema: "https://router-6ouzjmdzha-an.a.run.app",
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
