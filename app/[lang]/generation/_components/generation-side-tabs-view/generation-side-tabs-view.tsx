"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import type { StateValue } from "xstate"

/**
 * サイドコンテンツ切替タブ
 * @returns
 */
export function GenerationSideTabsView() {
  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  return (
    <>
      {state === "HISTORY_LIST_FULL" || state === "WORK_LIST_FULL" ? (
        <Tabs value={state.toString()} defaultValue={"HISTORY_LIST_FULL"}>
          <TabsList>
            <TabsTrigger
              onClick={() => {
                send({ type: "CHANGE_FULL_HISTORY_LIST" })
                context.updateSearchWorksModelId(null)
              }}
              className="w-full"
              value="HISTORY_LIST_FULL"
            >
              履歴
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "CHANGE_FULL_WORK_LIST" })
                context.updateSearchWorksModelId(null)
              }}
              className="w-full"
              value="WORK_LIST_FULL"
            >
              検索
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <Tabs value={state.toString()} defaultValue={"PROMPT_VIEW"}>
          <TabsList>
            <TabsTrigger
              onClick={() => {
                send({ type: "CLOSE" })
                context.updateSearchWorksModelId(null)
              }}
              className="w-full"
              value="PROMPT_VIEW"
            >
              履歴
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "OPEN_WORKS_FROM_MODEL" })
                context.updateSearchWorksModelId(null)
              }}
              className="w-full"
              value="WORKS_FROM_MODEL"
            >
              検索
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "OPEN_COMMUNICATION" })
                context.updateSearchWorksModelId(null)
              }}
              className="w-full"
              value="COMMUNICATION"
            >
              ご要望など
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </>
  )
}
