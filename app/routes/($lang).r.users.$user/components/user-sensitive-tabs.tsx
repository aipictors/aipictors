import { useNavigate, useLocation } from "@remix-run/react"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  user: FragmentOf<typeof UserSensitiveTabsFragment>
}

export function UserSensitiveTabs(props: Props) {
  const user = readFragment(UserSensitiveTabsFragment, props.user)

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
      navigate(`/r/users/${user.login}`)
    }
    if (value === t("画像", "Images")) {
      navigate(`/r/users/${user.login}/posts`)
    }
    if (value === t("小説", "Novels")) {
      navigate(`/r/users/${user.login}/novels`)
    }
    if (value === t("コラム", "Columns")) {
      navigate(`/r/users/${user.login}/notes`)
    }
    if (value === t("動画", "Videos")) {
      navigate(`/r/users/${user.login}/videos`)
    }
    if (value === t("シリーズ", "Series")) {
      navigate(`/r/users/${user.login}/albums`)
    }
    if (value === t("コレクション", "Collections")) {
      navigate(`/r/users/${user.login}/collections`)
    }
    if (value === t("スタンプ", "Stamps")) {
      navigate(`/r/users/${user.login}/stickers`)
    }
  }

  /**
   * TODO: 配列を返す関数を定義して単体テストを追加
   */
  const tabLabels = [
    t("ポートフォリオ", "Portfolio"),
    ...(user.hasSensitiveImageWorks ? [t("画像", "Images")] : []),
    ...(user.hasSensitiveNovelWorks ? [t("小説", "Novels")] : []),
    ...(user.hasSensitiveColumnWorks ? [t("コラム", "Columns")] : []),
    ...(user.hasSensitiveVideoWorks ? [t("動画", "Videos")] : []),
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

export const UserSensitiveTabsFragment = graphql(
  `fragment UserSensitiveTabsFragment on UserNode {
    id
    login
    hasSensitiveImageWorks
    hasSensitiveNovelWorks
    hasSensitiveVideoWorks
    hasSensitiveColumnWorks
    hasFolders
    hasAlbums
    hasPublicStickers
  }`,
)
