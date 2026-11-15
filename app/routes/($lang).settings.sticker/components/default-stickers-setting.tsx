import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useId } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  SettingsSection,
  SettingsSwitchRow,
} from "~/routes/($lang).settings/components/settings-section"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/** 既定のスタンプ（ぴくたーちゃんの英語のスタンプ）。サーバーの lib/default-stickers.ts と同じ */
const DEFAULT_STICKERS = [
  {
    id: "88355",
    title: "Thanks!",
    imageUrl:
      "https://files.aipictors.com/c478173d-45d1-4792-b51f-c0973f9579cd",
  },
  {
    id: "88356",
    title: "Love it!",
    imageUrl:
      "https://files.aipictors.com/bf84ac49-6a0c-4067-b119-fca939d29793",
  },
  {
    id: "88357",
    title: "Nice!",
    imageUrl:
      "https://files.aipictors.com/47865721-a488-4c0e-a435-fc3a2f89957c",
  },
  {
    id: "88358",
    title: "Wow!",
    imageUrl:
      "https://files.aipictors.com/475b66e8-12d9-4b09-96fd-46506ebbeadb",
  },
  {
    id: "88359",
    title: "Hello!",
    imageUrl:
      "https://files.aipictors.com/84f1759d-6e5b-4506-934f-f25fd7552202",
  },
]

/** 以前の既定のスタンプ（id 0〜4）。スタンプの一覧には出さず、ここでオンにした人だけに出す */
const LEGACY_DEFAULT_STICKERS = [
  {
    id: "0",
    imageUrl:
      "https://files.aipictors.com/431f3f95-a4e2-4763-a808-dffe8943d037",
  },
  {
    id: "1",
    imageUrl:
      "https://files.aipictors.com/bfa27f23-e028-479d-aeae-6949df17c87c",
  },
  {
    id: "2",
    imageUrl:
      "https://files.aipictors.com/cbd72227-1a9a-441c-9f4b-e43dcb2a1c6d",
  },
  {
    id: "3",
    imageUrl:
      "https://files.aipictors.com/5a52ef25-f89e-400c-9bce-859162be8f38",
  },
  {
    id: "4",
    imageUrl:
      "https://files.aipictors.com/c50e322f-4450-4a40-91fa-d5ec8104cc67",
  },
]

/**
 * 既定のスタンプ（ぴくたーちゃんのスタンプ）の表示の設定。
 * 切り替えたらすぐ保存し、コメントのスタンプの一覧を読み直す
 */
export function DefaultStickersSetting() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const hideId = useId()
  const legacyId = useId()

  const { data } = useQuery(defaultStickersSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading }] = useMutation(
    updateDefaultStickersSettingMutation,
    {
      // スタンプの一覧（先頭に既定のスタンプが入る）を次に開いたときに取り直す
      update(cache) {
        const viewerId = data?.viewer?.id
        if (viewerId === undefined) return
        cache.evict({
          id: cache.identify({ __typename: "Viewer", id: viewerId }),
          fieldName: "userStickers",
        })
        cache.gc()
      },
      refetchQueries: [defaultStickersSettingQuery],
    },
  )

  const isHide = data?.userSetting?.isHideDefaultStickers ?? false
  const isShowLegacy = data?.userSetting?.isShowLegacyDefaultStickers ?? false

  const save = async (input: {
    isHideDefaultStickers?: boolean
    isShowLegacyDefaultStickers?: boolean
  }) => {
    try {
      await updateUserSetting({ variables: { input } })
      toast(t("保存しました", "Settings saved"))
    } catch {
      toast(t("保存できませんでした", "Could not save"))
    }
  }

  if (authContext.isNotLoggedIn) {
    return null
  }

  return (
    <SettingsSection
      title={t("デフォルトのスタンプ", "Default stickers")}
      description={t(
        "コメントのスタンプの一覧の最初に出る、ぴくたーちゃんのスタンプです。",
        "Pictor-chan stickers shown first in the comment sticker list.",
      )}
    >
      <div className="divide-y">
        <div className="pb-2">
          <div className="flex flex-wrap gap-2">
            {DEFAULT_STICKERS.map((sticker) => (
              <StickerPreview
                key={sticker.id}
                imageUrl={sticker.imageUrl}
                title={sticker.title}
                isDimmed={isHide}
              />
            ))}
          </div>
        </div>
        <SettingsSwitchRow
          htmlFor={hideId}
          title={t("デフォルトのスタンプを表示しない", "Hide default stickers")}
          description={t(
            "オンにすると、スタンプの一覧に上のスタンプを出しません。",
            "When on, the stickers above are not shown in the sticker list.",
          )}
        >
          <Switch
            checked={isHide}
            disabled={loading || data === undefined}
            id={hideId}
            onCheckedChange={(checked) => {
              void save({ isHideDefaultStickers: checked })
            }}
          />
        </SettingsSwitchRow>
        <SettingsSwitchRow
          htmlFor={legacyId}
          title={t(
            "以前のデフォルトのスタンプも使う",
            "Also use the previous default stickers",
          )}
          description={t(
            "以前からある 5 つのスタンプを、スタンプの一覧に足します。",
            "Adds the five previous default stickers to the sticker list.",
          )}
        >
          <Switch
            checked={isShowLegacy}
            disabled={loading || data === undefined}
            id={legacyId}
            onCheckedChange={(checked) => {
              void save({ isShowLegacyDefaultStickers: checked })
            }}
          />
        </SettingsSwitchRow>
        <div className="pt-2">
          <div className="flex flex-wrap gap-2">
            {LEGACY_DEFAULT_STICKERS.map((sticker) => (
              <StickerPreview
                key={sticker.id}
                imageUrl={sticker.imageUrl}
                title={null}
                isDimmed={!isShowLegacy}
              />
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}

function StickerPreview(props: {
  imageUrl: string
  title: string | null
  isDimmed: boolean
}) {
  return (
    <img
      src={toResizedImageUrl(props.imageUrl, 240)}
      alt={props.title ?? ""}
      title={props.title ?? undefined}
      loading="lazy"
      className={`size-16 rounded-md object-contain transition-opacity md:size-20 ${props.isDimmed ? "opacity-30 grayscale" : ""}`}
    />
  )
}

const defaultStickersSettingQuery = graphql(
  `query DefaultStickersSetting {
    userSetting {
      id
      isHideDefaultStickers
      isShowLegacyDefaultStickers
    }
    viewer {
      id
    }
  }`,
)

const updateDefaultStickersSettingMutation = graphql(
  `mutation UpdateDefaultStickersSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      isHideDefaultStickers
      isShowLegacyDefaultStickers
    }
  }`,
)
