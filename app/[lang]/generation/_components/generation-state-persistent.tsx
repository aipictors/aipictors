"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

export const GenerationStatePersistent = (props: Props) => {
  const actor = GenerationConfigContext.useActorRef()

  useEffect(() => {
    const subscription = actor.subscribe(() => {
      const snapshot = actor.getPersistedSnapshot()
      localStorage.setItem("generation.state", JSON.stringify(snapshot))
      console.log("saved", snapshot)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return props.children
}
