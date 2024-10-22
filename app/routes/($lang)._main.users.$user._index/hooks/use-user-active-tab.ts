type Props = {
    url: string
    lang: string
}

export const useUserActiveTab = (props: Props) => {  
    return () => {
      if (props.url.endsWith("/posts")) return props.lang === "ja" ? "画像" : "Images"
      if (props.url.endsWith("/novels")) return props.lang === "ja" ? "小説" : "Novels"
      if (props.url.endsWith("/notes")) return props.lang === "ja" ? "コラム" : "Columns"
      if (props.url.endsWith("/videos")) return props.lang === "ja" ? "動画" : "Videos"
      if (props.url.endsWith("/albums")) return props.lang === "ja" ? "シリーズ" : "Series"
      if (props.url.endsWith("/collections"))
        return props.lang === "ja" ? "コレクション" : "Collections"
      if (props.url.endsWith("/stickers")) return props.lang === "ja" ? "スタンプ" : "Stickers"
      return props.lang === "ja" ? "ポートフォリオ" : "Portfolio"
    };
  }