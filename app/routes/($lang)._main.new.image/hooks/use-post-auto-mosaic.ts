import {
  type Dispatch,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import type { TSortableItem } from "~/components/drag/sortable-item"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import {
  countSensitivePostImages,
  SENSITIVE_RATING_MIN_SCORE,
} from "~/routes/($lang)._main.new.image/utils/post-auto-mosaic"
import {
  canPostMosaic,
  createAutoMosaicItem,
  getItemMosaicSource,
  getPostMosaicDetection,
  getPostMosaicTentacle,
  getPostMosaicVersion,
  hasItemMosaic,
  isItemMosaicSuggested,
  type PostMosaicSettings,
  readPostMosaicSettings,
  renderPostMosaic,
  requestPostMosaicDetection,
  savePostMosaicSettings,
  setPostMosaicTentacle,
  subscribePostMosaic,
} from "~/routes/($lang)._main.new.image/utils/post-mosaic-store"

/** 一覧の画像の下に出す状態 */
export type PostMosaicBadge =
  | { kind: "pending" }
  | { kind: "applied" }
  | { kind: "none" }
  | { kind: "suggested" }
  | { kind: "sensitive" }
  | { kind: "failed" }
  | null

/**
 * 投稿画面の自動モザイク（おすすめ）
 * - 画像を選んだら裏で検出する（投稿者のブラウザの中だけ）。自動ではかけず、年齢種別も変えない
 * - R18 / R18G: モザイクが必要そうな画像を「おすすめ」として出し、押したときだけかける
 * - 全年齢・R15: はっきり写っていそうな画像があれば「R-18 がおすすめ」と出す（変えるのは投稿者）
 */
export function usePostAutoMosaic(props: {
  items: TSortableItem[]
  /** 画像の投稿（検出はこのときだけ） */
  isImagePost: boolean
  /** 年齢種別が R18 / R18G */
  isR18: boolean
  /** タグ・プロンプトに触手がある（触手を含む作品を自動でオンにする） */
  isTentacleHint?: boolean
  dispatch: Dispatch<PostImageFormAction>
}) {
  const [settings, setSettingsState] = useState<PostMosaicSettings>({
    style: "mosaic",
    strength: 1,
  })
  const [isRendering, setIsRendering] = useState(false)
  /** 「R-18 がおすすめ」を閉じた（この投稿の間は出さない） */
  const [isRatingSuggestionDismissed, setIsRatingSuggestionDismissed] =
    useState(false)

  // 端末に保存した設定はマウント後に読む（サーバーの描画と合わせる）
  useEffect(() => {
    setSettingsState(readPostMosaicSettings())
  }, [])

  // 検出が進んだら描き直す
  useSyncExternalStore(subscribePostMosaic, getPostMosaicVersion, () => 0)
  const isTentacle = useSyncExternalStore(
    subscribePostMosaic,
    getPostMosaicTentacle,
    () => false,
  )
  // 自分で切り替えたら、タグ・プロンプトでは変えない
  const isTentacleTouchedRef = useRef(false)

  // 検出（かけはしない）
  useEffect(() => {
    if (!props.isImagePost) return
    for (const item of props.items) {
      const source = getItemMosaicSource(item)
      if (source && canPostMosaic(source)) requestPostMosaicDetection(source)
    }
  }, [props.isImagePost, props.items, isTentacle])

  /** 自動でかけたままの画像を元に戻す（手で直した分は残す） */
  const removeAutoMosaic = () => {
    for (const item of props.items) {
      if (item.mosaic?.isAuto && item.content !== null) {
        props.dispatch({
          type: "REPLACE_ITEM",
          payload: {
            from: item.content,
            item: { ...item, content: item.mosaic.source, mosaic: null },
          },
        })
      }
    }
  }

  /** おすすめのモザイクを、まだかけていない画像すべてにかける */
  const applySuggestions = async () => {
    const targets = props.items.filter(isItemMosaicSuggested)
    if (targets.length === 0) return
    setIsRendering(true)
    try {
      for (const item of targets) {
        if (item.content === null) continue
        const next = await createAutoMosaicItem(item, settings).catch(
          (error) => {
            console.error(error)
            return null
          },
        )
        if (next) {
          props.dispatch({
            type: "REPLACE_ITEM",
            payload: { from: item.content, item: next },
          })
        }
      }
    } finally {
      setIsRendering(false)
    }
  }

  /**
   * 触手を含む作品か（触手を性器と見間違えないようにする）
   * 自動でかけたままの画像は元に戻し、検出し直す（かけ直すかは投稿者が選ぶ）
   */
  const changeTentacle = (value: boolean) => {
    if (value === getPostMosaicTentacle()) return
    removeAutoMosaic()
    setPostMosaicTentacle(value)
  }

  const setIsTentacle = (value: boolean) => {
    isTentacleTouchedRef.current = true
    changeTentacle(value)
  }

  // タグ・プロンプトに触手が入ったら自動でオンにする
  useEffect(() => {
    if (props.isTentacleHint && !isTentacleTouchedRef.current) {
      changeTentacle(true)
    }
  }, [props.isTentacleHint])

  // 次の投稿に持ち越さない
  useEffect(() => () => setPostMosaicTentacle(false), [])

  /** 種類・濃さをまとめて変える（モザイクがかかっている画像すべてを描き直す） */
  const changeSettings = async (next: PostMosaicSettings) => {
    savePostMosaicSettings(next)
    setSettingsState(next)
    const targets = props.items.filter(
      (item) => item.mosaic?.mask && item.content !== null,
    )
    if (targets.length === 0) return
    setIsRendering(true)
    try {
      for (const item of targets) {
        const mosaic = item.mosaic
        if (!mosaic || item.content === null) continue
        try {
          const content = await renderPostMosaic(
            mosaic.source,
            mosaic.mask,
            next,
          )
          props.dispatch({
            type: "REPLACE_ITEM",
            payload: {
              from: item.content,
              item: { ...item, content, mosaic: { ...mosaic, ...next } },
            },
          })
        } catch (error) {
          console.error(error)
        }
      }
    } finally {
      setIsRendering(false)
    }
  }

  const getBadge = (item: TSortableItem): PostMosaicBadge => {
    if (!props.isImagePost) return null
    const source = getItemMosaicSource(item)
    if (!source || !canPostMosaic(source)) return null
    if (hasItemMosaic(item)) return { kind: "applied" }
    const detection = getPostMosaicDetection(source)
    if (!props.isR18) {
      // 全年齢・R15 は、R-18 がおすすめの画像だけ印を付ける
      return detection?.status === "done" &&
        detection.maxScore >= SENSITIVE_RATING_MIN_SCORE
        ? { kind: "sensitive" }
        : null
    }
    if (!detection || detection.status === "pending") return { kind: "pending" }
    if (detection.status === "failed") return { kind: "failed" }
    return isItemMosaicSuggested(item)
      ? { kind: "suggested" }
      : { kind: "none" }
  }

  const badges = props.items.map(getBadge)
  const summary = {
    total: props.items.filter((item) => {
      const source = getItemMosaicSource(item)
      return Boolean(source) && canPostMosaic(source)
    }).length,
    pending: props.items.filter((item) => {
      const source = getItemMosaicSource(item)
      return (
        source !== null &&
        canPostMosaic(source) &&
        getPostMosaicDetection(source)?.status === "pending"
      )
    }).length,
    applied: badges.filter((badge) => badge?.kind === "applied").length,
    autoApplied: props.items.filter(
      (item) => hasItemMosaic(item) && item.mosaic?.isAuto,
    ).length,
    suggested: props.items.filter(isItemMosaicSuggested).length,
    sensitive: countSensitivePostImages(props.items),
  }

  return {
    isTentacle,
    setIsTentacle,
    settings,
    changeSettings,
    applySuggestions,
    removeAutoMosaic,
    isRendering,
    getBadge,
    summary,
    isRatingSuggestionDismissed,
    dismissRatingSuggestion: () => setIsRatingSuggestionDismissed(true),
  }
}
