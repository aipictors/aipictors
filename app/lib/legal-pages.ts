type LegalText = { ja: string; en: string }

type LegalPage = {
  path: string
  title: LegalText
  /**
   * ページの冒頭に出す「このページの要点」（本文の言い換え。新しい約束はしない。正文は本文）
   */
  points?: LegalText[]
  /**
   * ページの中身（本文・要点・ナビ）を最後に変えた日。サイトマップの lastmod にするので、変えたときだけ上げる
   */
  updatedAt: string
}

/**
 * 規約・ポリシーのページの一覧（ページの下の共通ナビ・ヘルプのリンク集・Search for Agents のサイトマップで使う）
 */
export const LEGAL_PAGES: LegalPage[] = [
  {
    path: "/terms",
    title: { ja: "利用規約", en: "Terms of Service" },
    points: [
      {
        ja: "Aipictors を使うすべての方に適用されるルールです（利用登録・閲覧・プロフィール・投稿・年齢制限・禁止事項など）。",
        en: "The rules for everyone using Aipictors (sign-up, browsing, profiles, posting, age limits, prohibited conduct and more).",
      },
      {
        ja: "複数アカウントの登録は禁止です。R18 用のサブアカウントを 1 つだけ作れます（サブアカウントでは生成機能を使えません）。",
        en: "Multiple accounts are not allowed, except one R18 sub-account (which may not use generation).",
      },
      {
        ja: "生成機能での禁止事項、児童ポルノと認定されるおそれのある内容、歌詞の掲載についての決まりがあります。",
        en: "It covers what's prohibited in generation, content that may be deemed child pornography, and posting lyrics.",
      },
      {
        ja: "有償のコイン・クリエイター報酬・有料リクエストについては、それぞれの規約もあわせて適用されます。",
        en: "Paid coins, creator rewards and paid requests are also governed by their own terms.",
      },
    ],
    updatedAt: "2026-11-27",
  },
  {
    path: "/terms/r18",
    title: { ja: "R18・R18G の追加規約", en: "R18 / R18G terms" },
    points: [
      {
        ja: "R-18・R-18G の作品を閲覧・投稿・生成するときの追加ルールで、利用規約とあわせて適用されます。",
        en: "Extra rules for viewing, posting and generating R-18 / R-18G works, applied together with the Terms of Service.",
      },
      {
        ja: "R-18・R-18G は 18 歳以上の方だけが閲覧・投稿・生成できます。年齢区分は内容に合わせて必ず設定し、迷ったら厳しいほうを選びます。",
        en: "Only people 18 or older may view, post or generate R-18 / R-18G. Always set a fitting age rating; if unsure, choose the stricter one.",
      },
      {
        ja: "性器や結合部などは、イラスト・リアルを問わず判別できないように修正（モザイク等）が必要です。",
        en: "Genitals, penetration and similar must be obscured (mosaic etc.) so they can't be made out, in both illustrations and realistic images.",
      },
      {
        ja: "児童の保護のため、年齢区分にかかわらず投稿・生成が禁止されている作品があります。",
        en: "To protect children, some content is prohibited to post or generate regardless of rating.",
      },
    ],
    updatedAt: "2026-11-27",
  },
  {
    path: "/guideline",
    title: { ja: "コミュニティガイドライン", en: "Community guidelines" },
    points: [
      {
        ja: "Aipictors を安全で創造的な場所にするための、基本ルール・投稿ルール・交流ルール・禁止事項・通報についてのガイドラインです。",
        en: "Guidelines on basic rules, posting, interaction, prohibited conduct and reporting, to keep Aipictors safe and creative.",
      },
      {
        ja: "利用規約・R18 の追加規約とあわせて読んでください。",
        en: "Read them together with the Terms of Service and the R18 terms.",
      },
    ],
    updatedAt: "2026-11-27",
  },
  {
    path: "/privacy",
    title: { ja: "プライバシーポリシー", en: "Privacy policy" },
    points: [
      {
        ja: "取得した個人情報の利用目的と、第三者に開示する場合についての方針です。",
        en: "How personal information is used and when it may be disclosed to third parties.",
      },
      {
        ja: "クリエイター報酬の支払いのための本人確認・口座などの情報は、決済代行事業者 Stripe が取り扱います。",
        en: "ID and bank details for creator reward payouts are handled by the payment provider Stripe.",
      },
      {
        ja: "Cookie とアクセス解析ツールの使用についても書かれています。",
        en: "It also covers cookies and analytics tools.",
      },
    ],
    updatedAt: "2026-11-27",
  },
  {
    path: "/generation/terms",
    title: { ja: "画像生成の利用規約", en: "Image generation terms" },
    points: [
      {
        ja: "画像生成機能で禁止されている使い方をまとめた規約です。",
        en: "What is prohibited when using image generation.",
      },
      {
        ja: "無修正の性的な画像、児童ポルノと誤認されるおそれのある画像、複数アカウントでの生成などが禁止されています。",
        en: "Prohibited uses include uncensored sexual images, images that could be mistaken for child pornography, and generating with multiple accounts.",
      },
      {
        ja: "生成結果は確認され、不適切な利用には利用停止の対応があります。",
        en: "Generated results are reviewed, and misuse can lead to suspension.",
      },
    ],
    updatedAt: "2026-11-27",
  },
  {
    path: "/premium-coins/policy",
    title: { ja: "プレミアムコイン規約", en: "Premium coin terms" },
    updatedAt: "2026-11-27",
  },
  {
    path: "/creator-rewards/terms",
    title: { ja: "クリエイター報酬規約", en: "Creator reward terms" },
    points: [
      {
        ja: "作品の人気・支持に応じて、運営が売上から参加者に報酬を支払うプログラムの条件です。",
        en: "Conditions of the program in which we pay participants rewards from our revenue based on their works' support.",
      },
      {
        ja: "参加できるのは 18 歳以上で、日本国内の銀行口座を持ち、Stripe で本人確認と口座登録をした方です。",
        en: "Participants must be 18+, have a bank account in Japan, and complete ID verification and bank registration with Stripe.",
      },
      {
        ja: "対象は全年齢（一般・R15）の作品を通じた、有料で購入されたプレミアムコインでの推しなどで、コイン 1,000 枚につき 500 円です。",
        en: "Rewards cover support with purchased premium coins on all-ages (General / R15) works and similar, at ¥500 per 1,000 coins.",
      },
      {
        ja: "保留・締め・支払い、税金、取消しについては本文を確認してください。",
        en: "See the full text for holding periods, closing dates, payouts, taxes and reversals.",
      },
    ],
    updatedAt: "2026-11-27",
  },
  {
    path: "/requests/terms",
    title: { ja: "有料リクエスト規約", en: "Paid request terms" },
    points: [
      {
        ja: "コインでクリエイターにイラストなどを依頼する有料リクエストの規約です。",
        en: "Terms for paid requests, where you commission creators with coins.",
      },
      {
        ja: "申し込むとコインを運営が預かり、お断り・期限切れ・キャンセル等のときは同じ種類のコインで全額返却します。",
        en: "Coins are held by us when you request; if declined, expired or cancelled, they're fully returned as the same kind of coin.",
      },
      {
        ja: "完了のときに手数料が差し引かれます。納品物の権利と利用の範囲、トラブルのときの扱いも定めています。",
        en: "A fee is deducted on completion. It also covers rights to deliverables and how disputes are handled.",
      },
    ],
    updatedAt: "2026-11-27",
  },
  {
    path: "/fan-works-policy",
    title: { ja: "二次創作と収益化について", en: "Fan works and earnings" },
    updatedAt: "2026-11-27",
  },
  {
    path: "/company",
    title: { ja: "運営会社", en: "Company" },
    updatedAt: "2026-11-27",
  },
]
