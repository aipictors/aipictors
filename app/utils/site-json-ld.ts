import { config } from "~/config"

/**
 * トップページ用のサイト全体の構造化データ（WebSite / Organization）。
 * 検索エンジンのサイト名表示・サイト内検索ボックス・ナレッジパネルの手がかりになる。
 */
export function createSiteJsonLd(lang: "ja" | "en") {
  const siteUrl = config.siteURL
  const homeUrl = lang === "en" ? `${siteUrl}/en` : `${siteUrl}/`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: homeUrl,
        name: "Aipictors",
        alternateName: ["AIピクターズ", "Aipictors（AIピクターズ）"],
        description:
          lang === "en"
            ? "Aipictors is a Japanese community site to post, browse and generate AI illustrations, AI photos and prompts."
            : "Aipictors（AIピクターズ）は、AIイラスト・AIフォト・プロンプトを投稿・閲覧・生成できる日本のAI画像投稿サイトです。",
        inLanguage: ["ja", "en"],
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?tag={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Aipictors",
        alternateName: "AIピクターズ",
        url: `${siteUrl}/`,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icon.png`,
        },
        sameAs: [
          "https://x.com/AIPICTORS",
          "https://www.instagram.com/aipictors",
          "https://github.com/aipictors",
          "https://discord.gg/7jA2MmtvtR",
        ],
      },
    ],
  }
}
