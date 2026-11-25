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
  canPostMosaic,
  createAutoMosaicItem,
  getItemMosaicSource,
  getPostMosaicDetection,
  getPostMosaicVersion,
  hasItemMosaic,
  isItemMosaicWarning,
  type PostMosaicSettings,
  readPostMosaicSelfApplied,
  readPostMosaicSettings,
  renderPostMosaic,
  requestPostMosaicDetection,
  savePostMosaicSelfApplied,
  savePostMosaicSettings,
  subscribePostMosaic,
} from "~/routes/($lang)._main.new.image/utils/post-mosaic-store"

/** 一覧の画像の下に出す状態 */
export type PostMosaicBadge =
  | { kind: "pending" }
  | { kind: "applied"; isAuto: boolean }
  | { kind: "none" }
  | { kind: "warning" }
  | { kind: "failed" }
  | null

/**
 * 投稿画面の自動モザイク（R18 / R18G）
 * - 画像を選んだら裏で検出して、見つかったらかけた画像に差し替える（一覧がそのままプレビューになる）
 * - 「自分でかけ済み」のときはかけないが、検出は回して、隠れていないように見える画像に印を付ける
 */
export function usePostAutoMosaic(props: {
  items: TSortableItem[]
  /** 年齢種別が R18 / R18G の画像投稿 */
  isEnabled: boolean
  dispatch: Dispatch<PostImageFormAction>
}) {
  const [isSelfApplied, setIsSelfAppliedState] = useState(false)
  const [settings, setSettingsState] = useState<PostMosaicSettings>({
    style: "mosaic",
    strength: 1,
  })
  const [isRendering, setIsRendering] = useState(false)

  // 端末に保存した設定はマウント後に読む（サーバーの描画と合わせる）
  useEffect(() => {
    setIsSelfAppliedState(readPostMosaicSelfApplied())
    setSettingsState(readPostMosaicSettings())
  }, [])

  const version = useSyncExternalStore(
    subscribePostMosaic,
    getPostMosaicVersion,
    () => 0,
  )

  // 差し替え中の元の画像（同じ画像を 2 回処理しない）
  const busyRef = useRef(new Set<string>())

  // 検出（自分でかけ済みでも、警告のために回す）
  useEffect(() => {
    if (!props.isEnabled) return
    for (const item of props.items) {
      const source = getItemMosaicSource(item)
      if (source && canPostMosaic(source)) requestPostMosaicDetection(source)
    }
  }, [props.isEnabled, props.items])

  // かける・外す
  useEffect(() => {
    const isAuto = props.isEnabled && !isSelfApplied
    for (const item of props.items) {
      const source = getItemMosaicSource(item)
      if (!source || item.content === null || !canPostMosaic(source)) continue
      if (busyRef.current.has(source)) continue

      if (!isAuto) {
        // 自動でかけたままの分は外す（手で直した分は残す）
        if (item.mosaic?.isAuto) {
          props.dispatch({
            type: "REPLACE_ITEM",
            payload: {
              from: item.content,
              item: { ...item, content: source, mosaic: null },
            },
          })
        }
        continue
      }

      // 手で直した・外した画像、まだ検出中の画像は触らない
      if (item.mosaic || item.content !== source) continue
      const detection = getPostMosaicDetection(source)
      if (detection?.status !== "done" || detection.mask === null) continue

      busyRef.current.add(source)
      createAutoMosaicItem(item, settings)
        .then((next) => {
          if (next) {
            props.dispatch({
              type: "REPLACE_ITEM",
              payload: { from: source, item: next },
            })
          }
        })
        .catch((error) => console.error(error))
        .finally(() => busyRef.current.delete(source))
    }
  }, [props.items, props.isEnabled, isSelfApplied, settings, version])

  const setIsSelfApplied = (value: boolean) => {
    savePostMosaicSelfApplied(value)
    setIsSelfAppliedState(value)
  }

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
        busyRef.current.add(mosaic.source)
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
        } finally {
          busyRef.current.delete(mosaic.source)
        }
      }
    } finally {
      setIsRendering(false)
    }
  }

  /** 警告が出ている画像に自動でかける（自分でかけ済みのまま。手で直したのと同じ扱い） */
  const applyToWarnings = async () => {
    const targets = props.items.filter(isItemMosaicWarning)
    setIsRendering(true)
    try {
      for (const item of targets) {
        const next = await createAutoMosaicItem(item, settings).catch(
          (error) => {
            console.error(error)
            return null
          },
        )
        if (next?.mosaic && item.content !== null) {
          props.dispatch({
            type: "REPLACE_ITEM",
            payload: {
              from: item.content,
              item: { ...next, mosaic: { ...next.mosaic, isAuto: false } },
            },
          })
        }
      }
    } finally {
      setIsRendering(false)
    }
  }

  const getBadge = (item: TSortableItem): PostMosaicBadge => {
    if (!props.isEnabled) return null
    const source = getItemMosaicSource(item)
    if (!source || !canPostMosaic(source)) return null
    if (hasItemMosaic(item)) {
      return { kind: "applied", isAuto: item.mosaic?.isAuto === true }
    }
    const detection = getPostMosaicDetection(source)
    if (!detection || detection.status === "pending") return { kind: "pending" }
    if (detection.status === "failed") return { kind: "failed" }
    if (isSelfApplied) {
      return isItemMosaicWarning(item) ? { kind: "warning" } : { kind: "none" }
    }
    // 検出済みで見つかったが、差し替え待ち
    if (detection.mask !== null && !item.mosaic) return { kind: "pending" }
    return { kind: "none" }
  }

  const badges = props.items.map(getBadge)
  const summary = {
    total: badges.filter((badge) => badge !== null).length,
    pending: badges.filter((badge) => badge?.kind === "pending").length,
    applied: badges.filter((badge) => badge?.kind === "applied").length,
    warning: badges.filter((badge) => badge?.kind === "warning").length,
    failed: badges.filter((badge) => badge?.kind === "failed").length,
  }

  return {
    isSelfApplied,
    setIsSelfApplied,
    settings,
    changeSettings,
    applyToWarnings,
    isRendering,
    getBadge,
    summary,
  }
}
