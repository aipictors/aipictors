import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/_components/app/app-markdown"

export default function EventWakiaiai2() {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/privacy.md"),
    "utf-8",
  )

  return (
    <div className="py-8">
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  )
}
