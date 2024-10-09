import { useNavigate } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"

type Props = {
  activeTab: string
  user: FragmentOf<typeof UserProfileIconFragment>
}

export function UserSensitiveTabs(props: Props) {
  const t = useTranslation() // useTranslationを使用

  const navigate = useNavigate()

  const handleTabClick = (value: string) => {
    if (value === t("ポートフォリオ", "Portfolio")) {
      navigate(`/r/users/${props.user.login}`)
    }
    if (value === t("画像", "Images")) {
      navigate(`/r/users/${props.user.login}/posts`)
    }
    if (value === t("小説", "Novels")) {
      navigate(`/r/users/${props.user.login}/novels`)
    }
    if (value === t("コラム", "Columns")) {
      navigate(`/r/users/${props.user.login}/notes`)
    }
    if (value === t("動画", "Videos")) {
      navigate(`/r/users/${props.user.login}/videos`)
    }
    if (value === t("シリーズ", "Series")) {
      navigate(`/r/users/${props.user.login}/albums`)
    }
    if (value === t("コレクション", "Collections")) {
      navigate(`/r/users/${props.user.login}/collections`)
    }
    if (value === t("スタンプ", "Stamps")) {
      navigate(`/r/users/${props.user.login}/stickers`)
    }
  }

  console.log("props.user.hasVideoWorks", props.user.hasVideoWorks)

  const tabList = () => {
    return [
      t("ポートフォリオ", "Portfolio"),
      ...(props.user.hasSensitiveImageWorks ? [t("画像", "Images")] : []),
      ...(props.user.hasSensitiveNovelWorks ? [t("小説", "Novels")] : []),
      ...(props.user.hasSensitiveColumnWorks ? [t("コラム", "Columns")] : []),
      ...(props.user.hasSensitiveVideoWorks ? [t("動画", "Videos")] : []),
      ...(props.user.hasAlbums ? [t("シリーズ", "Series")] : []),
      ...(props.user.hasFolders ? [t("コレクション", "Collections")] : []),
      ...(props.user.hasPublicStickers ? [t("スタンプ", "Stamps")] : []),
    ]
  }

  const removeParentheses = (str: string) => {
    return str.replace(/\(([^)]+)\)/, "")
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {tabList().map((tabValue: string) => (
        <Button
          key={removeParentheses(tabValue)}
          onClick={() => handleTabClick(removeParentheses(tabValue))}
          variant="secondary"
          className={
            removeParentheses(tabValue) === props.activeTab ? "opacity-50" : ""
          }
        >
          {tabValue}
        </Button>
      ))}
    </div>
  )
}
