type Props = {
  hasImageWorks: boolean
  hasNovelWorks: boolean
  hasColumnWorks: boolean
  hasVideoWorks: boolean
  hasAlbums: boolean
  hasFolders: boolean
  hasPublicStickers: boolean
  hasBadges: boolean
  lang: string
}

export const useUserTabLabels = (props: Props) => {
  const t = (jaText: string, enText: string) =>
    props.lang === "ja" ? jaText : enText

  return [
    t("ポートフォリオ", "portfolio"),
    ...(props.hasImageWorks ? [t("画像", "Images")] : []),
    ...(props.hasNovelWorks ? [t("小説", "Novels")] : []),
    ...(props.hasColumnWorks ? [t("コラム", "Columns")] : []),
    ...(props.hasVideoWorks ? [t("動画", "Videos")] : []),
    ...(props.hasAlbums ? [t("シリーズ", "Series")] : []),
    ...(props.hasFolders ? [t("コレクション", "Collections")] : []),
    ...(props.hasPublicStickers ? [t("スタンプ", "Stickers")] : []),
    ...(props.hasBadges ? [t("バッジ", "Badges")] : []),
  ]
}
