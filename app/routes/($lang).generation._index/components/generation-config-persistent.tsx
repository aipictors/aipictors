import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useLayoutEffect } from "react"

type Props = {
  children: React.ReactNode
}

export function GenerationConfigPersistent (props: Props) {
  const actor = GenerationConfigContext.useActorRef()

  // 子の useEffect（URL で指定したモデルの選択など）より先に購読しておく。
  // useEffect だと子の変更を取りこぼし、読み込み直し（Suspense など）で古い保存内容に戻っていた
  useLayoutEffect(() => {
    const persist = () => {
      const snapshot = actor.getPersistedSnapshot()
      localStorage.setItem("generation.state", JSON.stringify(snapshot))
    }
    const subscription = actor.subscribe(persist)
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return props.children
}
