import { useNavigate, useLocation } from "@remix-run/react"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  user: FragmentOf<typeof UserTabsFragment>
}

export function UserTabs(props: Props) {
  const user = readFragment(UserTabsFragment, props.user)

  const t = useTranslation()

  const navigate = useNavigate()

  const location = useLocation()

  /**
   * 現在のURLパスに基づいてアクティブなタブを判定
   * デフォルトは「ポートフォリオ」
   * TODO: pathnameを引数に持つカスタムHooksとして定義して単体テストを追加
   */
  const getActiveTab = () => {
    if (location.pathname.endsWith("/posts")) return t("画像", "Images")
    if (location.pathname.endsWith("/novels")) return t("小説", "Novels")
    if (location.pathname.endsWith("/notes")) return t("コラム", "Columns")
    if (location.pathname.endsWith("/videos")) return t("動画", "Videos")
    if (location.pathname.endsWith("/albums")) return t("シリーズ", "Series")
    if (location.pathname.endsWith("/collections"))
      return t("コレクション", "Collections")
    if (location.pathname.endsWith("/stickers")) return t("スタンプ", "Stamps")
    return t("ポートフォリオ", "Portfolio")
  }

  /**
   * TODO: パスを返す関数を定義して単体テストを追加
   */
  const handleTabClick = (value: string) => {
    if (value === t("ポートフォリオ", "Portfolio")) {
      navigate(`/users/${user.login}`)
    }
    if (value === t("画像", "Images")) {
      navigate(`/users/${user.login}/posts`)
    }
    if (value === t("小説", "Novels")) {
      navigate(`/users/${user.login}/novels`)
    }
    if (value === t("コラム", "Columns")) {
      navigate(`/users/${user.login}/notes`)
    }
    if (value === t("動画", "Videos")) {
      navigate(`/users/${user.login}/videos`)
    }
    if (value === t("シリーズ", "Series")) {
      navigate(`/users/${user.login}/albums`)
    }
    if (value === t("コレクション", "Collections")) {
      navigate(`/users/${user.login}/collections`)
    }
    if (value === t("スタンプ", "Stamps")) {
      navigate(`/users/${user.login}/stickers`)
    }
  }

  /**
   * TODO: 配列を返す関数を定義して単体テストを追加
   */
  const tabLabels = [
    t("ポートフォリオ", "Portfolio"),
    ...(user.hasImageWorks ? [t("画像", "Images")] : []),
    ...(user.hasNovelWorks ? [t("小説", "Novels")] : []),
    ...(user.hasColumnWorks ? [t("コラム", "Columns")] : []),
    ...(user.hasVideoWorks ? [t("動画", "Videos")] : []),
    ...(user.hasAlbums ? [t("シリーズ", "Series")] : []),
    ...(user.hasFolders ? [t("コレクション", "Collections")] : []),
    ...(user.hasPublicStickers ? [t("スタンプ", "Stamps")] : []),
  ]

  /**
   * TODO: 不要
   */
  const removeParentheses = (str: string) => {
    return str.replace(/\(([^)]+)\)/, "")
  }

  const activeTab = getActiveTab()

  return (
    <div className="grid grid-cols-3 gap-2">
      {tabLabels.map((label) => (
        <Button
          key={removeParentheses(label)}
          onClick={() => handleTabClick(removeParentheses(label))}
          variant="secondary"
          className={removeParentheses(label) === activeTab ? "opacity-50" : ""}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

export const UserTabsFragment = graphql(
  `fragment UserTabsFragment on UserNode {
    id
    login
    hasImageWorks
    hasNovelWorks
    hasVideoWorks
    hasColumnWorks
    hasFolders
    hasAlbums
    hasPublicStickers
  }`,
)
