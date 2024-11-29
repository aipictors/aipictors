import { GenerationConfigContext } from "~/routes/($lang).generation.demonstration/contexts/generation-config-context"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

export function GenerationConfigPersistent(props: Props) {
  const actor = GenerationConfigContext.useActorRef()

  useEffect(() => {
    const subscription = actor.subscribe(() => {
      const snapshot = actor.getPersistedSnapshot()
      localStorage.setItem("generation.state", JSON.stringify(snapshot))
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return props.children
}
