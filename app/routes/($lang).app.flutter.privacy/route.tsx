import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/_components/app/app-markdown"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/privacy.md"),
    "utf-8",
  )
  return { text }
}

export default function EventWakiaiai2() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="py-8">
      <AppMarkdown>{data.text}</AppMarkdown>
    </div>
  )
}
