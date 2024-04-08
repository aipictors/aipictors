import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/_components/app/app-markdown"
import { AppPageCenter } from "@/_components/app/app-page-center"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  const text = await readFile(join(process.cwd(), "assets/terms.md"), "utf-8")

  return {
    text,
  }
}

export default function Terms() {
  const data = useLoaderData<typeof loader>()
  return (
    <>
      <AppPageCenter>
        <div className="w-full space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"利用規約"}</h1>
          <AppMarkdown>{data.text}</AppMarkdown>
        </div>
      </AppPageCenter>
    </>
  )
}
