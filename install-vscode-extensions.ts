import { $ } from "bun"

async function installVscodeExtensions() {
  const EXTENSIONS_FILE = ".vscode/extensions.json"

  try {
    const { recommendations } = await $`cat ${EXTENSIONS_FILE}`.json()

    if (!recommendations || recommendations.length === 0) {
      console.error("Can not find your recommendations extensions list.")
      return
    }

    for (const ext of recommendations) {
      await $`code --install-extension ${ext}`
    }

    console.log("All extensions have been successfully installed.")
  } catch (error) {
    console.error(`Error loading extension list: ${error}`)
  }
}

installVscodeExtensions()
