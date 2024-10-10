import { useNavigate, useLocation } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  user: FragmentOf<typeof UserTabsFragment>
}

export function UserTabs(props: Props) {
  const t = useTranslation()

  const navigate = useNavigate()

  const location = useLocation()

  // 現在のURLパスに基づいてアクティブなタブを判定
  const getActiveTab = () => {
    if (location.pathname.endsWith("/posts")) return t("画像", "Images")
    if (location.pathname.endsWith("/novels")) return t("小説", "Novels")
    if (location.pathname.endsWith("/notes")) return t("コラム", "Columns")
    if (location.pathname.endsWith("/videos")) return t("動画", "Videos")
    if (location.pathname.endsWith("/albums")) return t("シリーズ", "Series")
    if (location.pathname.endsWith("/collections"))
      return t("コレクション", "Collections")
    if (location.pathname.endsWith("/stickers")) return t("スタンプ", "Stamps")
    return t("ポートフォリオ", "Portfolio") // デフォルトは「ポートフォリオ」
  }

  const handleTabClick = (value: string) => {
    if (value === t("ポートフォリオ", "Portfolio")) {
      navigate(`/users/${props.user.login}`)
    }
    if (value === t("画像", "Images")) {
      navigate(`/users/${props.user.login}/posts`)
    }
    if (value === t("小説", "Novels")) {
      navigate(`/users/${props.user.login}/novels`)
    }
    if (value === t("コラム", "Columns")) {
      navigate(`/users/${props.user.login}/notes`)
    }
    if (value === t("動画", "Videos")) {
      navigate(`/users/${props.user.login}/videos`)
    }
    if (value === t("シリーズ", "Series")) {
      navigate(`/users/${props.user.login}/albums`)
    }
    if (value === t("コレクション", "Collections")) {
      navigate(`/users/${props.user.login}/collections`)
    }
    if (value === t("スタンプ", "Stamps")) {
      navigate(`/users/${props.user.login}/stickers`)
    }
  }

  const tabList = () => {
    return [
      t("ポートフォリオ", "Portfolio"),
      ...(props.user.hasImageWorks ? [t("画像", "Images")] : []),
      ...(props.user.hasNovelWorks ? [t("小説", "Novels")] : []),
      ...(props.user.hasColumnWorks ? [t("コラム", "Columns")] : []),
      ...(props.user.hasVideoWorks ? [t("動画", "Videos")] : []),
      ...(props.user.hasAlbums ? [t("シリーズ", "Series")] : []),
      ...(props.user.hasFolders ? [t("コレクション", "Collections")] : []),
      ...(props.user.hasPublicStickers ? [t("スタンプ", "Stamps")] : []),
    ]
  }

  const removeParentheses = (str: string) => {
    return str.replace(/\(([^)]+)\)/, "")
  }

  const activeTab = getActiveTab()

  return (
    <div className="grid grid-cols-3 gap-2">
      {tabList().map((tabValue: string) => (
        <Button
          key={removeParentheses(tabValue)}
          onClick={() => handleTabClick(removeParentheses(tabValue))}
          variant="secondary"
          className={
            removeParentheses(tabValue) === activeTab ? "opacity-50" : ""
          }
        >
          {tabValue}
        </Button>
      ))}
    </div>
  )
}

export const UserTabsFragment = graphql(
  `fragment UserTabs on UserNode @_unmask {
    login
    hasImageWorks
    hasNovelWorks
    hasVideoWorks
    hasColumnWorks
    hasFolders
    hasSensitiveFolders
    hasAlbums
    hasPublicStickers
  }`,
)
