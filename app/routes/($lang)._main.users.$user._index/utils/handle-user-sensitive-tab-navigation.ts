type Props = {
  userId: string
  type: string
  lang: string
  onNavigateCallback: (url: string) => void
}

export const handleUserSensitiveTabNavigation = (props: Props) => {
  const t = (jaText: string, enText: string) =>
    props.lang === "ja" ? jaText : enText

  if (props.type === t("ポートフォリオ", "Portfolio")) {
    props.onNavigateCallback(`/r/users/${props.userId}`)
  }
  if (props.type === t("画像", "Images")) {
    props.onNavigateCallback(`/r/users/${props.userId}/posts`)
  }
  if (props.type === t("小説", "Novels")) {
    props.onNavigateCallback(`/r/users/${props.userId}/novels`)
  }
  if (props.type === t("コラム", "Columns")) {
    props.onNavigateCallback(`/r/users/${props.userId}/notes`)
  }
  if (props.type === t("動画", "Videos")) {
    props.onNavigateCallback(`/r/users/${props.userId}/videos`)
  }
  if (props.type === t("シリーズ", "Series")) {
    props.onNavigateCallback(`/r/users/${props.userId}/albums`)
  }
  if (props.type === t("バッジ", "Badges")) {
    props.onNavigateCallback(`/r/users/${props.userId}/badges`)
  }
  if (props.type === t("コレクション", "Collections")) {
    props.onNavigateCallback(`/r/users/${props.userId}/collections`)
  }
  if (props.type === t("スタンプ", "Stickers")) {
    props.onNavigateCallback(`/r/users/${props.userId}/stickers`)
  }
}
