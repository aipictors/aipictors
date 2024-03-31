"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

/**
 * サイドコンテンツ切替タブ
 * @returns
 */
export function GenerationSideTabsView() {
  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const [mode, setMode] = useState("history")

  return (
    <>
      <Tabs value={mode} defaultValue={mode} className="mb-2">
        <TabsList>
          <TabsTrigger
            onClick={() => {
              send({ type: "CLOSE" })
              context.updateSearchWorksModelId(null)
              setMode("history")
            }}
            className="w-full"
            value="history"
          >
            履歴
          </TabsTrigger>
          <TabsTrigger
            onClick={() => {
              send({ type: "OPEN_WORKS_FROM_MODEL" })
              context.updateSearchWorksModelId(null)
              setMode("search")
            }}
            className="w-full"
            value="search"
          >
            検索
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  )
}
