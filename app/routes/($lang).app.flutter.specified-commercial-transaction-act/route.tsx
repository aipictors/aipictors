import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/_components/app/app-markdown"

export default function FlutterScta() {
  return (
    <div className="py-8">
      <div className="flex justify-between">
        <p>{"運営サービス"}</p>
        <p>{"Aipictors"}</p>
      </div>
    </div>
  )
}
