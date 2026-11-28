import { useLayoutEffect } from "react"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import {
  getLatestGenerationConfig,
  sendGenerationConfig,
} from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"
import {
  createIndexedDbGenerationImageStore,
  type GenerationImageStore,
} from "~/routes/($lang).generation._index/utils/generation-image-store"
import {
  createGenerationStatePersister,
  hasInlineLargeFields,
  type LargeFieldRefs,
  pickRestorableImages,
} from "~/routes/($lang).generation._index/utils/generation-state-persister"

type Props = {
  /** 保存データにあった、IndexedDB に置いた画像のキー */
  largeFieldRefs: LargeFieldRefs
  children: React.ReactNode
}

export function GenerationConfigPersistent(props: Props) {
  const actor = GenerationConfigContext.useActorRef()

  // 子の useEffect（URL で指定したモデルの選択など）より先に購読しておく。
  // useEffect だと子の変更を取りこぼし、読み込み直し（Suspense など）で古い保存内容に戻っていた
  useLayoutEffect(() => {
    let store: GenerationImageStore | null = null
    try {
      store = createIndexedDbGenerationImageStore()
    } catch (_error) {}
    // 参照画像・ControlNet の画像は IndexedDB に置く。使えなければ localStorage だけに保存する
    const persister = createGenerationStatePersister({
      storage: localStorage,
      store,
      pendingRefs: props.largeFieldRefs,
    })
    const persist = () => {
      // 容量超え（QuotaExceededError）で例外を投げると生成画面が止まるため、保存できなくても続ける
      persister.persist(actor.getPersistedSnapshot())
    }
    const subscription = actor.subscribe(persist)

    // 以前の保存データ（localStorage に画像がそのまま入っている）は IndexedDB に移して小さく書き直す
    if (persister.isUsingStore() && hasInlineLargeFields(actor.getSnapshot())) {
      persist()
    }

    // 画像は後から読み込む。ほかの設定は先に戻っているので、読み込みの間にユーザーが入れた画像は上書きしない
    let cancelled = false
    void (async () => {
      const loaded = await persister.load()
      if (cancelled) return
      const latest = getLatestGenerationConfig(actor)
      const images = pickRestorableImages(latest, loaded)
      // 送るとすぐ保存が走るので、先に読み込んだことを伝えて同じ画像を書き直さないようにする
      persister.markLoaded(images)
      if (Object.keys(images).length > 0) {
        sendGenerationConfig(
          actor,
          new GenerationConfigState({ ...latest, ...images }),
        )
      }
      await persister.prune()
    })()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return props.children
}
