import { gql, useMutation, useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { getApolloErrorMessage } from "~/utils/get-apollo-error-message"

export const MAX_PINNED_STICKERS = 12

export type PinnedSticker = {
  __typename?: "StickerNode"
  id: string
  title: string
  imageUrl: string | null
}

type PinnedStickersData = {
  viewer: { __typename?: string; id: string; pinnedStickers: PinnedSticker[] } | null
}

const viewerPinnedStickersQuery = gql`
  query ViewerPinnedStickers {
    viewer {
      id
      pinnedStickers {
        id
        title
        imageUrl
      }
    }
  }
`

const updatePinnedStickersMutation = gql`
  mutation UpdatePinnedStickers($stickerIds: [ID!]!) {
    updatePinnedStickers(stickerIds: $stickerIds) {
      id
      title
      imageUrl
    }
  }
`

/**
 * コメント欄に固定するスタンプ（アカウントに保存され、どの端末でも同じ）
 */
export function usePinnedStickers(options?: { skip?: boolean }) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const { data } = useQuery<PinnedStickersData>(viewerPinnedStickersQuery, {
    skip:
      options?.skip === true ||
      authContext.isLoading ||
      authContext.isNotLoggedIn,
  })

  const [updatePinnedStickers] = useMutation<{
    updatePinnedStickers: PinnedSticker[]
  }>(updatePinnedStickersMutation)

  const pinnedStickers = data?.viewer?.pinnedStickers ?? []

  const isPinned = (stickerId: string) =>
    pinnedStickers.some((sticker) => sticker.id === stickerId)

  const togglePin = async (sticker: PinnedSticker) => {
    const next = isPinned(sticker.id)
      ? pinnedStickers.filter((pinned) => pinned.id !== sticker.id)
      : [...pinnedStickers, sticker]

    if (next.length > MAX_PINNED_STICKERS) {
      toast(
        t(
          `固定できるスタンプは ${MAX_PINNED_STICKERS} 個までです`,
          `You can pin up to ${MAX_PINNED_STICKERS} stickers`,
        ),
      )
      return
    }

    try {
      await updatePinnedStickers({
        variables: { stickerIds: next.map((pinned) => pinned.id) },
        optimisticResponse: {
          updatePinnedStickers: next.map((pinned) => ({
            __typename: "StickerNode",
            id: pinned.id,
            title: pinned.title,
            imageUrl: pinned.imageUrl,
          })),
        },
        update(cache, result) {
          const stickers = result.data?.updatePinnedStickers
          const current = cache.readQuery<PinnedStickersData>({
            query: viewerPinnedStickersQuery,
          })
          if (!stickers || !current?.viewer) return
          cache.writeQuery<PinnedStickersData>({
            query: viewerPinnedStickersQuery,
            data: { viewer: { ...current.viewer, pinnedStickers: stickers } },
          })
        },
      })
    } catch (error) {
      toast(
        getApolloErrorMessage(error) ??
          t(
            "スタンプの固定に失敗しました。しばらくしてから再度お試しください。",
            "Failed to pin the sticker. Please try again later.",
          ),
      )
    }
  }

  return { pinnedStickers, isPinned, togglePin }
}
