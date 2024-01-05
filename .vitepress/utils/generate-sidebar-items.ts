import { Dirent, existsSync, readdirSync } from "fs"
import { join } from "path"

type SidebarItem = {
  text: string
  link: string
  items?: SidebarItem[]
}

export const generateSidebarItems = (directory: string): SidebarItem[] => {
  const items: SidebarItem[] = []

  const contents: Dirent[] = readdirSync(directory, { withFileTypes: true })

  for (const content of contents) {
    // ドットで始まるディレクトリ、_assetsディレクトリをスキップ
    if (
      content.isDirectory() &&
      (content.name.startsWith(".") || content.name === "_assets")
    )
      continue

    const fullPath = join(directory, content.name).replace(/\\/g, "/")
    const textName =
      content.name.charAt(0).toUpperCase() + content.name.slice(1)

    if (content.isDirectory()) {
      const readmePath = join(directory, content.name, "README.md")
      const hasReadme = existsSync(readmePath)
      const subItems = generateSidebarItems(join(directory, content.name))
      // サブアイテムがなく、READMEもない場合はスキップ
      if (!(subItems.length > 0 || hasReadme)) continue
      items.push({
        text: textName,
        link: hasReadme ? `${fullPath}/README.md` : fullPath,
        items: subItems.length > 0 ? subItems : undefined,
      })
    }

    if (!content.isFile()) continue

    // .mdでないファイル
    if (!content.name.endsWith(".md")) continue

    // README.mdファイルをスキップ
    if (content.name.toLowerCase() === "readme.md") continue

    items.push({
      text: textName.replace(".md", ""),
      link: fullPath,
    })
  }

  return items
}
