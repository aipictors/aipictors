import { toApproxUsdText } from "~/utils/to-approx-usd-text"

/** 日本語と英語の組。英語の画面では en を出す（金額は円にドルの目安を添える） */
export type HelpText = { ja: string; en: string }

/** 吹き出しの位置（コマの四隅と上の中央） */
export type HelpBubblePosition = "tl" | "tr" | "bl" | "br" | "tc"

export type HelpMangaPanel = {
  /** /images/help-manga/ の下のファイル名（拡張子なし） */
  image: string
  /** コマの説明（ナレーション）。画像の alt にも使う */
  caption: HelpText
  /** ナレーションを上に出すか下に出すか */
  captionAt?: "top" | "bottom"
  bubbles: Array<HelpText & { at: HelpBubblePosition }>
}

export type HelpFaq = { q: HelpText; a: HelpText }

export type HelpSection = {
  id: string
  group: HelpGroupId
  emoji: string
  title: HelpText
  /** 漫画の題 */
  mangaTitle: HelpText
  lead: HelpText
  panels: [HelpMangaPanel, HelpMangaPanel, HelpMangaPanel, HelpMangaPanel]
  points: HelpText[]
  links: Array<{ to: string; label: HelpText }>
  faqs: HelpFaq[]
  isNew?: boolean
}

export type HelpGroupId = "start" | "share" | "create" | "support" | "more"

export const HELP_GROUPS: Array<{ id: HelpGroupId; label: HelpText }> = [
  { id: "start", label: { ja: "はじめる", en: "Get started" } },
  { id: "share", label: { ja: "投稿・交流", en: "Share & connect" } },
  { id: "create", label: { ja: "AIで描く", en: "Create with AI" } },
  { id: "support", label: { ja: "応援・収益", en: "Support & earn" } },
  { id: "more", label: { ja: "もっと楽しむ", en: "More" } },
]

/** 英語の金額はドルで出し、請求・振込の通貨の円を添える（例: about $3.1 (¥500)） */
const usd = (yen: number) =>
  `${toApproxUsdText(yen)} (¥${yen.toLocaleString("en-US")})`

/** 使い方ガイドの各章。章ごとにぴくたーちゃんの 4 コマと、ポイント・リンク・よくある質問 */
export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "quickstart",
    group: "start",
    emoji: "🚀",
    title: { ja: "はじめての方へ", en: "Getting started" },
    mangaTitle: { ja: "ようこそ Aipictors へ！", en: "Welcome to Aipictors!" },
    lead: {
      ja: "Aipictors（アイピクターズ）は、AIイラスト・AIフォトを投稿して、見て、AIで生成して、クリエイターを応援できる日本最大級の AI 画像投稿サイトです。見るだけならログインは要りません。",
      en: "Aipictors is one of Japan's largest sites for AI art: post AI illustrations and photos, browse, generate images with AI, and support creators. You can browse without signing in.",
    },
    panels: [
      {
        image: "start-1",
        caption: {
          ja: "Aipictors は AI イラストの投稿・生成・応援ができるサイト",
          en: "Aipictors: post, generate and support AI art",
        },
        bubbles: [
          {
            ja: "はじめまして！ぴくたーちゃんだよ〜",
            en: "Hi there! I'm Pictor-chan!",
            at: "tr",
          },
        ],
      },
      {
        image: "start-2",
        caption: {
          ja: "ログインしなくても作品を見られる",
          en: "Browse works without signing in",
        },
        bubbles: [
          {
            ja: "数十万の作品から好きな絵が見つかるよ",
            en: "Find favorites among hundreds of thousands of works",
            at: "tl",
          },
        ],
      },
      {
        image: "start-3",
        caption: {
          ja: "アカウント作成は無料・すぐ終わる",
          en: "Signing up is free and quick",
        },
        bubbles: [
          {
            ja: "登録すると、いいねも投稿も生成もできる！",
            en: "Sign up to like, post and generate!",
            at: "tr",
          },
        ],
      },
      {
        image: "start-4",
        caption: {
          ja: "プロフィールを書いたら準備 OK",
          en: "Fill in your profile and you're ready",
        },
        bubbles: [
          { ja: "さっそく始めよう♪", en: "Let's get started♪", at: "tl" },
        ],
      },
    ],
    points: [
      {
        ja: "作品・ランキング・タグは登録しなくても見られます。",
        en: "Works, rankings and tags can be viewed without an account.",
      },
      {
        ja: "登録は Google・X・メールアドレスなどから無料でできます。",
        en: "Sign up for free with Google, X or an email address.",
      },
      {
        ja: "アイコン・ヘッダー・自己紹介はプロフィール設定から。公開するメールアドレスは任意で、ログイン用のメールとは別です。",
        en: "Set your icon, header and bio in profile settings. A public contact email is optional and separate from your login email.",
      },
      {
        ja: "画面右上の「全年齢 / R18」で表示を切り替えます（R18 は年齢の確認があります）。",
        en: "Switch between All ages and R18 at the top right (R18 asks you to confirm your age).",
      },
      {
        ja: "英語の表示は、メニューの言語の切り替えから選べます。",
        en: "Switch the site language from the menu.",
      },
    ],
    links: [
      { to: "/posts", label: { ja: "作品を見る", en: "Browse works" } },
      {
        to: "/settings/profile",
        label: { ja: "プロフィールを設定", en: "Set up profile" },
      },
    ],
    faqs: [
      {
        q: { ja: "Aipictors は無料で使えますか？", en: "Is Aipictors free?" },
        a: {
          ja: "閲覧・投稿・いいね・コメントは無料です。画像生成も毎日のフリーコインで無料で使えます。たくさん生成したい方向けに有料プランもあります。",
          en: "Browsing, posting, likes and comments are free. Image generation is also free with daily free coins. Paid plans are available if you want to generate more.",
        },
      },
    ],
  },
  {
    id: "posting",
    group: "share",
    emoji: "🖼️",
    title: { ja: "作品を投稿する", en: "Posting your work" },
    mangaTitle: { ja: "はじめての投稿", en: "Your first post" },
    lead: {
      ja: "画像のほか、小説・コラム・動画も投稿できます。タグと年齢区分を正しく付けると、見てほしい人に届きやすくなります。",
      en: "Post images, novels, columns and videos. Accurate tags and age ratings help your work reach the right people.",
    },
    panels: [
      {
        image: "post-1",
        caption: {
          ja: "画像・小説・コラム・動画を投稿できる",
          en: "Post images, novels, columns or videos",
        },
        bubbles: [
          {
            ja: "できた作品をみんなに見てほしい！",
            en: "I want everyone to see my work!",
            at: "tr",
          },
        ],
      },
      {
        image: "post-2",
        caption: {
          ja: "タイトル・タグ・年齢区分を決める",
          en: "Add a title, tags and an age rating",
        },
        bubbles: [
          {
            ja: "タグを付けると見つけてもらいやすいよ",
            en: "Tags help people find you!",
            at: "tr",
          },
        ],
      },
      {
        image: "post-3",
        caption: {
          ja: "公開日時の予約や、プロンプトの公開も選べる",
          en: "Schedule posts and choose whether to show prompts",
        },
        bubbles: [
          {
            ja: "予約投稿もできるんだ〜",
            en: "You can even schedule posts~",
            at: "tl",
          },
        ],
      },
      {
        image: "post-4",
        caption: {
          ja: "投稿完了！新着やタグのページに並ぶ",
          en: "Done! It shows up in new works and tag pages",
        },
        bubbles: [
          {
            ja: "たくさん見てもらえますように！",
            en: "Hope lots of people see it!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "年齢区分は 全年齢・R15・R18・R18G から選びます。迷ったら厳しいほうを選んでください。",
        en: "Choose an age rating: All ages, R15, R18 or R18G. If unsure, pick the stricter one.",
      },
      {
        ja: "画像を生成したときのプロンプトやモデルは、公開・非公開を選べます。",
        en: "You can choose whether to show the prompt and model used to generate an image.",
      },
      {
        ja: "公開する日時を予約できます。投稿したあとも、作品ページの編集から直せます。",
        en: "Schedule the publish time. You can edit the work from its page after posting.",
      },
      {
        ja: "見てほしい作品は「宣伝枠」でホームに大きく出せます（下の「宣伝枠」を見てください）。",
        en: "Want more eyes on a work? Use a promotion slot to feature it on the home page (see Promotion below).",
      },
    ],
    links: [
      { to: "/new/image", label: { ja: "画像を投稿", en: "Post an image" } },
      {
        to: "/new/text",
        label: { ja: "小説・コラムを投稿", en: "Post a novel or column" },
      },
      {
        to: "/promotion",
        label: { ja: "宣伝枠について", en: "About promotion" },
      },
      { to: "/guideline", label: { ja: "ガイドライン", en: "Guidelines" } },
    ],
    faqs: [
      {
        q: {
          ja: "投稿できる作品に決まりはありますか？",
          en: "Are there rules for what I can post?",
        },
        a: {
          ja: "ガイドラインと利用規約に沿った作品を投稿してください。年齢区分の付け間違いや、他人の権利を侵害する作品は非公開になることがあります。",
          en: "Please follow the guidelines and terms. Works with wrong age ratings or that infringe others' rights may be hidden.",
        },
      },
    ],
  },
  {
    id: "features",
    group: "share",
    emoji: "💗",
    title: {
      ja: "いいね・フォロー・コメント",
      en: "Likes, follows & comments",
    },
    mangaTitle: { ja: "気持ちを届けよう", en: "Show some love" },
    lead: {
      ja: "好きな作品にはいいね、好きなクリエイターはフォロー。コメントやスタンプで感想を送ると、作者さんの励みになります。",
      en: "Like works you love, follow creators you like, and send comments or stickers — it means a lot to creators.",
    },
    panels: [
      {
        image: "react-1",
        caption: {
          ja: "好きな作品に「いいね」",
          en: "Like the works you love",
        },
        bubbles: [
          {
            ja: "いいねで気持ちが届く！",
            en: "A like says it all!",
            at: "tr",
          },
        ],
      },
      {
        image: "react-2",
        caption: {
          ja: "フォローやブックマークで後から見返せる",
          en: "Follow and bookmark to come back later",
        },
        bubbles: [
          {
            ja: "推しのクリエイターをフォロー♪",
            en: "Follow your favorite creators♪",
            at: "tr",
          },
        ],
      },
      {
        image: "react-3",
        caption: {
          ja: "コメントやスタンプで感想を送る",
          en: "Send comments and stickers",
        },
        bubbles: [
          {
            ja: "スタンプなら一瞬で伝わるよ",
            en: "Stickers say it in a second!",
            at: "tl",
          },
        ],
      },
      {
        image: "react-4",
        caption: {
          ja: "反応は通知でお知らせ",
          en: "Notifications tell you about reactions",
        },
        bubbles: [
          {
            ja: "反応が来るとうれしい〜！",
            en: "Getting reactions feels great!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "いいねは匿名にもできます（全年齢とセンシティブで別々に設定）。",
        en: "Likes can be anonymous (set separately for all-ages and sensitive works).",
      },
      {
        ja: "フォローしたクリエイターの新作は、ホームのフォロー中に並びます。",
        en: "New works from creators you follow appear in your Following feed.",
      },
      {
        ja: "コメントにはスタンプも送れます。よく使うスタンプはコメント欄に固定できます。",
        en: "Send stickers in comments, and pin your favorites to the comment box.",
      },
      {
        ja: "通知の種類ごとに、受け取るかどうかを設定できます。",
        en: "Choose which kinds of notifications you receive.",
      },
    ],
    links: [
      { to: "/my/likes", label: { ja: "いいねした作品", en: "Liked works" } },
      { to: "/my/bookmarks", label: { ja: "ブックマーク", en: "Bookmarks" } },
      {
        to: "/settings/notification",
        label: { ja: "通知の設定", en: "Notification settings" },
      },
      {
        to: "/promotion",
        label: { ja: "宣伝枠について", en: "About promotion" },
      },
    ],
    faqs: [],
  },
  {
    id: "search",
    group: "share",
    emoji: "🔍",
    title: { ja: "作品を探す・ランキング", en: "Search & rankings" },
    mangaTitle: { ja: "お気に入りを見つけよう", en: "Find your favorites" },
    lead: {
      ja: "キーワード・タグ・ユーザーで検索したり、ランキングや人気のタグから新しい作品に出会えます。",
      en: "Search by keyword, tag or user, or discover new works through rankings and popular tags.",
    },
    panels: [
      {
        image: "search-1",
        caption: {
          ja: "キーワード・タグ・ユーザーで検索",
          en: "Search by keyword, tag or user",
        },
        bubbles: [{ ja: "どこかな〜？", en: "Where is it~?", at: "tr" }],
      },
      {
        image: "search-2",
        caption: {
          ja: "デイリー・ウィークリー・マンスリーのランキング",
          en: "Daily, weekly and monthly rankings",
        },
        bubbles: [
          {
            ja: "上位の作品はやっぱりすごい！",
            en: "The top works are amazing!",
            at: "tr",
          },
        ],
      },
      {
        image: "search-3",
        caption: {
          ja: "人気のタグやお題から新しい作品に出会える",
          en: "Popular tags and daily themes lead to new finds",
        },
        bubbles: [
          {
            ja: "こんな絵もあるんだ…！",
            en: "Whoa, look at all these!",
            at: "tl",
          },
        ],
      },
      {
        image: "search-4",
        caption: {
          ja: "見たくない作品はミュートで隠せる",
          en: "Mute what you don't want to see",
        },
        bubbles: [
          {
            ja: "自分好みのタイムラインに！",
            en: "Make the feed your own!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "検索では、年齢区分・画風（イラスト / フォト）・プロンプトありなどで絞り込めます。",
        en: "Filter search results by age rating, style (illustration / photo), works with prompts and more.",
      },
      {
        ja: "ランキングは作品・ユーザー・推し・ルーキーなどの種類があります。",
        en: "Rankings cover works, users, support, rookies and more.",
      },
      {
        ja: "苦手なタグやユーザーはミュートすると一覧に出なくなります。",
        en: "Mute tags or users to hide them from lists.",
      },
    ],
    links: [
      { to: "/search", label: { ja: "検索", en: "Search" } },
      { to: "/rankings", label: { ja: "ランキング", en: "Rankings" } },
      { to: "/tags", label: { ja: "タグ一覧", en: "Tags" } },
    ],
    faqs: [],
  },
  {
    id: "generation",
    group: "create",
    emoji: "🎨",
    title: { ja: "AI で画像を生成する", en: "Generating images with AI" },
    mangaTitle: { ja: "AI でお絵かき", en: "Drawing with AI" },
    lead: {
      ja: "ブラウザだけで AI 画像を生成できます。毎日もらえるフリーコインで無料で試せて、できた画像はそのまま投稿できます。",
      en: "Generate AI images right in your browser. Try it for free with daily free coins, then post the results directly.",
    },
    panels: [
      {
        image: "gen-1",
        caption: {
          ja: "生成画面でプロンプト（呪文）を書く",
          en: "Write a prompt on the generation screen",
        },
        bubbles: [
          {
            ja: "どんな絵にしようかな…",
            en: "What should I draw…?",
            at: "tr",
          },
        ],
      },
      {
        image: "gen-2",
        caption: {
          ja: "モデルや LoRA を選んで「生成」",
          en: "Pick a model and LoRA, then hit Generate",
        },
        bubbles: [
          {
            ja: "絵柄はモデルで変わるよ！",
            en: "The model changes the style!",
            at: "tr",
          },
        ],
      },
      {
        image: "gen-3",
        caption: {
          ja: "毎日もらえるフリーコインで無料生成",
          en: "Generate for free with daily free coins",
        },
        bubbles: [
          { ja: "毎日タダで作れる！", en: "Free every day!", at: "tr" },
        ],
      },
      {
        image: "gen-4",
        caption: {
          ja: "できた画像はそのまま投稿できる",
          en: "Post your results straight away",
        },
        bubbles: [
          {
            ja: "いい感じにできた〜！",
            en: "This turned out great!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "プロンプトは「何を・どんな見た目で・どこで」を短い言葉で並べるのがコツです。日本語で書いても自動で変換されます。",
        en: "Tip: list what, how it looks and where in short phrases. Prompts written in Japanese are converted automatically.",
      },
      {
        ja: "ネガティブプロンプトには、出てほしくないもの（崩れた手など）を書きます。",
        en: "Use the negative prompt for things you don't want (like broken hands).",
      },
      {
        ja: "画像から生成・ControlNet で、ポーズや構図を指定することもできます。",
        en: "Use image-to-image and ControlNet to guide pose and composition.",
      },
      {
        ja: "毎日のフリーコインはその日の 24 時に消えます。生成ではフリーコインから先に使われます。",
        en: "Daily free coins expire at midnight (JST). Free coins are used first when generating.",
      },
    ],
    links: [
      {
        to: "/generation",
        label: { ja: "生成してみる", en: "Start generating" },
      },
      { to: "/guides", label: { ja: "作り方ガイド", en: "How-to guides" } },
      {
        to: "/generation/terms",
        label: { ja: "生成の利用規約", en: "Generation terms" },
      },
    ],
    faqs: [
      {
        q: {
          ja: "生成した画像は自分の作品として投稿できますか？",
          en: "Can I post images I generated?",
        },
        a: {
          ja: "はい。生成の履歴からそのまま投稿画面に送れます。ガイドラインと生成の利用規約に沿って投稿してください。",
          en: "Yes. Send them from your generation history straight to the post form. Please follow the guidelines and generation terms.",
        },
      },
    ],
  },
  {
    id: "coins",
    group: "support",
    emoji: "🪙",
    title: { ja: "コインと推し（応援）", en: "Coins & support" },
    mangaTitle: { ja: "コインで推そう", en: "Support with coins" },
    lead: {
      ja: "コインは画像生成と、クリエイターの応援（推し）に使えます。毎日もらえるフリーコインと、購入するプレミアムコインの 2 種類があります。",
      en: "Coins are used for image generation and for supporting creators. There are two kinds: free coins you get daily and premium coins you buy.",
    },
    panels: [
      {
        image: "coins-1",
        caption: {
          ja: "フリーコイン（毎日もらえる）とプレミアムコイン（購入）",
          en: "Free coins (daily) and premium coins (purchased)",
        },
        bubbles: [
          {
            ja: "コインは 2 種類あるよ",
            en: "There are two kinds of coins",
            at: "tr",
          },
        ],
      },
      {
        image: "coins-2",
        caption: {
          ja: "プレミアムコインは 100 枚 80 円から",
          en: `Premium coins from 100 for ${usd(80)}`,
        },
        bubbles: [
          {
            ja: "1,000 枚以上なら 1 割おまけ！",
            en: "Buy 1,000+ and get 10% extra!",
            at: "tr",
          },
        ],
      },
      {
        image: "coins-3",
        caption: {
          ja: "コインで作品やクリエイターを「推し」て応援",
          en: "Use coins to support works and creators",
        },
        bubbles: [
          { ja: "推しにエール！", en: "Cheering for my fave!", at: "tl" },
        ],
      },
      {
        image: "coins-4",
        caption: {
          ja: "推しは pt になってランキングに",
          en: "Support turns into pt and rankings",
        },
        bubbles: [
          {
            ja: "フリー 1 枚 1pt、プレミアム 1 枚 10pt",
            en: "Free coin = 1pt, premium coin = 10pt",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "購入したプレミアムコインは、購入日から 3 か月で失効します。",
        en: "Purchased premium coins expire 3 months after purchase.",
      },
      {
        ja: "フリーコインで推されると、受け取った人のフリーコインになります（受け取りから 30 日有効、1 日 300 枚まで。超えた分は pt だけ）。プレミアムコインで推された分はプレミアムコインになります。",
        en: "Free-coin support becomes the recipient's free coins (valid 30 days, up to 300 a day; beyond that it counts as pt only). Premium-coin support becomes premium coins.",
      },
      {
        ja: "推しにはメッセージを付けられます。枚数が多いほどコメント欄で目立つ色になります（スーパーチャットのように）。",
        en: "Add a message when you support. Bigger support gets a more eye-catching color in comments, like a Super Chat.",
      },
      {
        ja: "推しランキングは「どれだけ応援されたか」、貢献度ランキングは「どれだけ応援したか」の週ごとの順位です。",
        en: "The support ranking shows who was supported most; the contribution ranking shows who supported most, each week.",
      },
      {
        ja: "購入したプレミアムコインでの推しは、クリエイターの報酬（次の章）につながります。",
        en: "Support with purchased premium coins becomes creator rewards (see the next section).",
      },
    ],
    links: [
      {
        to: "/settings/points",
        label: { ja: "コインの残高・購入", en: "Coin balance & purchase" },
      },
      {
        to: "/coin-rankings",
        label: { ja: "推しランキング", en: "Support rankings" },
      },
      {
        to: "/premium-coins/policy",
        label: { ja: "プレミアムコイン規約", en: "Premium coin terms" },
      },
    ],
    faqs: [
      {
        q: {
          ja: "フリーコインとプレミアムコインの違いは？",
          en: "What's the difference between free and premium coins?",
        },
        a: {
          ja: "フリーコインは毎日やキャンペーンでもらえる無料のコインで、毎日の分はその日のうちに使います（フリーコインの推しで受け取った分は 30 日もちます）。プレミアムコインは購入するコインで、推しでは 1 枚 10pt になり、クリエイターの報酬につながります。",
          en: "Free coins are given daily or in campaigns; the daily ones expire the same day (free coins received as support last 30 days). Premium coins are purchased; each counts as 10pt when supporting and becomes creator rewards.",
        },
      },
    ],
  },
  {
    id: "creator-rewards",
    group: "support",
    emoji: "💴",
    isNew: true,
    title: { ja: "クリエイター報酬（換金）", en: "Creator rewards (cash out)" },
    mangaTitle: { ja: "推しが、報酬になる！", en: "Support becomes rewards!" },
    lead: {
      ja: "全年齢の作品に、購入したプレミアムコインで推しが届くと、その分がお金の報酬としてたまり、銀行口座に振り込まれます。口座の登録は世界中で使われている Stripe で行うので安心です。",
      en: "When people support your all-ages works with purchased premium coins, it builds up as cash rewards paid to your bank account. Bank details are handled securely by Stripe.",
    },
    panels: [
      {
        image: "rewards-1",
        caption: {
          ja: "全年齢の作品に、プレミアムコインの推しが届くと…",
          en: "When premium-coin support reaches your all-ages work…",
        },
        bubbles: [{ ja: "推しが届いたよ〜！", en: "I got support!", at: "tr" }],
      },
      {
        image: "rewards-2",
        caption: {
          ja: "1,000 コイン → 500 円の報酬に",
          en: `1,000 coins → ${usd(500)} reward`,
        },
        bubbles: [
          {
            ja: "応援が報酬としてたまっていく♪",
            en: "Support adds up as rewards♪",
            at: "tl",
          },
        ],
      },
      {
        image: "rewards-3",
        caption: {
          ja: "口座は Stripe が管理（Aipictors は保存しません）",
          en: "Stripe keeps your bank details (we never store them)",
        },
        captionAt: "bottom",
        bubbles: [
          {
            ja: "Stripe だから安心だよ！",
            en: "Stripe keeps it safe!",
            at: "tl",
          },
        ],
      },
      {
        image: "rewards-4",
        caption: {
          ja: "毎月 10 日・25 日締め・3,000 円から振込",
          en: `Paid on the 10th & 25th, from ${usd(3000)}`,
        },
        captionAt: "bottom",
        bubbles: [
          {
            ja: "振り込まれた〜！みんなありがとう！",
            en: "Paid! Thank you, everyone!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "参加は「設定 → 収益の受け取り」から。18 歳以上で、日本の銀行口座と住所が必要です。",
        en: "Join from Settings → Creator rewards. You must be 18+ and have a bank account and address in Japan (payouts are in JPY).",
      },
      {
        ja: "対象は全年齢（G / R15）の作品と、プロフィールへの推し・有料リクエストの報酬です。フリーコインの推しは対象外です。",
        en: "Covers support on all-ages (G / R15) works, profile support and paid request earnings. Free-coin support is not included.",
      },
      {
        ja: "推されてから 7 日の確認期間のあと、毎月 10 日と 25 日の締めでまとめて振り込みます。",
        en: "After a 7-day check period, rewards are paid out in batches closing on the 10th and 25th of each month.",
      },
      {
        ja: "振込のたびに手数料がかかり、個人の方は所得税が源泉徴収されます。くわしくは収益の受け取りのページで確認できます。",
        en: "A fee applies per payout, and income tax is withheld for individuals. See the Creator rewards page for details.",
      },
      {
        ja: "プレミアムコインでの推しを受け取りたくない場合は、設定でオフにできます。",
        en: "Don't want premium-coin support? You can turn it off in settings.",
      },
    ],
    links: [
      {
        to: "/settings/creator-rewards",
        label: { ja: "収益の受け取り", en: "Creator rewards" },
      },
      {
        to: "/creator-rewards/terms",
        label: { ja: "クリエイター報酬規約", en: "Creator reward terms" },
      },
    ],
    faqs: [
      {
        q: {
          ja: "推しはいくらの報酬になりますか？",
          en: "How much is support worth?",
        },
        a: {
          ja: "購入したプレミアムコイン 1,000 枚の推しで 500 円の報酬になります。3,000 円以上たまると振り込まれ、それまでは次回に持ち越されます。",
          en: `Support of 1,000 purchased premium coins equals a ${usd(500)} reward. Payouts happen once you reach ${usd(3000)}; smaller amounts carry over.`,
        },
      },
      {
        q: {
          ja: "口座の情報は安全ですか？",
          en: "Is my bank information safe?",
        },
        a: {
          ja: "口座や本人確認の情報は、送金サービスの Stripe が管理します。Aipictors は口座番号を保存しません。",
          en: "Your bank and ID details are kept by Stripe, a payment service. Aipictors never stores your bank number.",
        },
      },
      {
        q: {
          ja: "海外に住んでいても受け取れますか？",
          en: "Can I receive rewards from outside Japan?",
        },
        a: {
          ja: "いまは日本の銀行口座（円）への振込だけです。参加しない場合、推しは今までどおりコインで受け取ります。",
          en: "Currently payouts go only to Japanese bank accounts in JPY. If you don't join, support is received as coins as before.",
        },
      },
    ],
  },
  {
    id: "requests",
    group: "support",
    emoji: "✉️",
    isNew: true,
    title: { ja: "有料リクエスト", en: "Paid requests" },
    mangaTitle: { ja: "描いてほしいを頼もう", en: "Request a piece" },
    lead: {
      ja: "好きなクリエイターに、コインでイラストを依頼できます。コインは取引が終わるまで Aipictors が預かるので、依頼する側も受ける側も安心です。",
      en: "Commission art from creators you love with coins. Aipictors holds the coins until the deal is done, so both sides are protected.",
    },
    panels: [
      {
        image: "req-1",
        caption: {
          ja: "クリエイターのプランから、コインで依頼",
          en: "Pick a creator's plan and request with coins",
        },
        bubbles: [
          {
            ja: "この人に描いてほしい…！",
            en: "I'd love this artist to draw it…!",
            at: "tr",
          },
        ],
      },
      {
        image: "req-2",
        caption: {
          ja: "クリエイターが内容を見て承諾・制作",
          en: "The creator accepts and gets to work",
        },
        bubbles: [
          {
            ja: "リクエストありがとう！描くね",
            en: "Thanks for the request! On it!",
            at: "tr",
          },
        ],
      },
      {
        image: "req-3",
        caption: {
          ja: "納品された作品を受け取って完了",
          en: "Receive the delivered work to finish",
        },
        bubbles: [{ ja: "届いた〜！", en: "It's here!", at: "tr" }],
      },
      {
        image: "req-4",
        caption: {
          ja: "お断り・期限切れならコインは全額戻る",
          en: "Declined or overdue? Coins are fully refunded",
        },
        bubbles: [
          {
            ja: "安心して頼めるね",
            en: "Request with peace of mind",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "クリエイターは「設定 → リクエスト」で、料金や納期を決めたプランを作れます。",
        en: "Creators set up plans with prices and delivery times in Settings → Requests.",
      },
      {
        ja: "依頼の内容・参考画像・コインの確認は 1 画面で。コインが足りなければその場で購入できます。",
        en: "Enter details, reference images and confirm coins on one screen. Buy coins on the spot if you need more.",
      },
      {
        ja: "お断り、3 日以内に返事がない、納期を過ぎたときは、預けたコインが全額戻ります。",
        en: "If declined, unanswered for 3 days, or overdue, the coins are fully refunded.",
      },
      {
        ja: "受けた依頼の報酬は、クリエイター報酬として振込の対象になります。",
        en: "Earnings from requests count toward creator reward payouts.",
      },
    ],
    links: [
      {
        to: "/requests",
        label: { ja: "プランを探す", en: "Browse plans" },
      },
      {
        to: "/requests/my-plans",
        label: { ja: "プランを出品する", en: "List a plan" },
      },
      {
        to: "/requests/terms",
        label: { ja: "有料リクエスト規約", en: "Request terms" },
      },
    ],
    faqs: [
      {
        q: {
          ja: "依頼したのに返事がないときは？",
          en: "What if the creator doesn't respond?",
        },
        a: {
          ja: "3 日以内に返事がない場合や納期を過ぎた場合は、コインが全額戻ります。",
          en: "If there's no reply within 3 days or the deadline passes, your coins are fully refunded.",
        },
      },
    ],
  },
  {
    id: "promotion",
    group: "support",
    emoji: "📣",
    isNew: true,
    title: { ja: "宣伝枠", en: "Promotion slots" },
    mangaTitle: { ja: "作品をホームで宣伝！", en: "Feature your work!" },
    lead: {
      ja: "宣伝枠を使うと、自分の作品をホームの「クリエイターの宣伝」に 7 日間大きく出せます。作品集やショップへのリンクボタンも付きます。",
      en: "A promotion slot features your work in “From our creators” on the home page for 7 days, with a button to your portfolio or shop.",
    },
    panels: [
      {
        image: "promo-1",
        caption: {
          ja: "ホームの「クリエイターの宣伝」に作品を出せる",
          en: "Show your work in “From our creators” on the home page",
        },
        bubbles: [
          {
            ja: "わたしの作品を見て〜！",
            en: "Check out my work!",
            at: "tr",
          },
        ],
      },
      {
        image: "promo-2",
        caption: {
          ja: "有料プランの特典なら週 1 作品",
          en: "Paid plans include one work per week",
        },
        bubbles: [
          {
            ja: "プランに入ってたら追加料金なし！",
            en: "Included with your plan!",
            at: "tr",
          },
        ],
      },
      {
        image: "promo-3",
        caption: {
          ja: "プレミアムコイン 500 枚で 7 日間",
          en: `Or 500 premium coins (${usd(400)}) for 7 days`,
        },
        bubbles: [
          {
            ja: "作品ページの「宣伝する」から！",
            en: "Tap “Promote” on your work page!",
            at: "tr",
          },
        ],
      },
      {
        image: "promo-4",
        caption: {
          ja: "関連リンクのボタンで作品集やショップへ",
          en: "A link button leads to your portfolio or shop",
        },
        bubbles: [
          {
            ja: "たくさんの人に届きますように！",
            en: "Hope it reaches lots of people!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "宣伝できるのは、ひとりにつき全年齢と R18 で 1 作品ずつです。",
        en: "Each person can promote one all-ages and one R18 work at a time.",
      },
      {
        ja: "作品ページに宣伝の帯、一覧のサムネイルに PR のしるしが付きます。",
        en: "Your work page gets a promotion banner and thumbnails get a PR mark.",
      },
      {
        ja: "投稿画面の「宣伝作品」の欄で、ホームでの見え方をプレビューできます。",
        en: "Preview how it looks on the home page from the “Promoted work” field when posting.",
      },
      {
        ja: "コインで出すときは、無料のフリーコインは使えません。宣伝のルールは案内ページで確認してください。",
        en: "Free coins can't be used for promotion. Check the rules on the promotion page.",
      },
    ],
    links: [
      {
        to: "/promotion",
        label: { ja: "宣伝枠の案内", en: "Promotion guide" },
      },
      { to: "/plus", label: { ja: "プランを見る", en: "See plans" } },
    ],
    faqs: [
      {
        q: {
          ja: "宣伝枠はどこから使えますか？",
          en: "Where do I use a promotion slot?",
        },
        a: {
          ja: "プランの特典は投稿画面の「宣伝作品」から、コインの場合は自分の公開中の作品ページの「宣伝する」から使えます。",
          en: "With a plan, use the “Promoted work” field when posting. With coins, tap “Promote” on your published work's page.",
        },
      },
    ],
  },
  {
    id: "plus",
    group: "support",
    emoji: "👑",
    title: { ja: "有料プラン（Aipictors+）", en: "Paid plans (Aipictors+)" },
    mangaTitle: { ja: "もっと生成したいなら", en: "Want to generate more?" },
    lead: {
      ja: "たくさん生成したい方向けの有料プランです。1 日に生成できる枚数が増え、宣伝枠などの特典も付きます。いつでも解約できます。",
      en: "Paid plans for people who want to generate more: more daily generations plus perks like promotion slots. Cancel anytime.",
    },
    panels: [
      {
        image: "plus-1",
        caption: {
          ja: "もっと生成したい人向けの有料プラン",
          en: "Plans for people who want to generate more",
        },
        bubbles: [
          {
            ja: "ライト・スタンダード・プレミアムがあるよ",
            en: "Lite, Standard and Premium!",
            at: "tr",
          },
        ],
      },
      {
        image: "plus-2",
        caption: {
          ja: "1 日の生成枚数が増える",
          en: "More generations per day",
        },
        bubbles: [
          {
            ja: "上のプランは 1 回で 4 枚まとめて！",
            en: "Higher plans make 4 at once!",
            at: "tr",
          },
        ],
      },
      {
        image: "plus-3",
        caption: {
          ja: "宣伝枠など、投稿にうれしい特典も",
          en: "Perks like promotion slots",
        },
        bubbles: [
          {
            ja: "作品も見てもらいやすくなる♪",
            en: "More people see your work♪",
            at: "tl",
          },
        ],
      },
      {
        image: "plus-4",
        caption: {
          ja: "ライトは月 480 円から・いつでも解約",
          en: `Lite from ${usd(480)}/mo · cancel anytime`,
        },
        bubbles: [
          {
            ja: "まずは無料で試してみてね",
            en: "Try it free first!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "はじめての方は無料のお試し期間があります（期間中に解約すれば料金はかかりません）。",
        en: "First-timers get a free trial (cancel during the trial and you won't be charged).",
      },
      {
        ja: "カードのほか PayPay でも払えます（自動更新なしのパス）。",
        en: "Pay by card, or with PayPay as a non-renewing pass.",
      },
      {
        ja: "料金の請求は円です。英語の画面のドルの額は目安です。",
        en: "Charges are in JPY; dollar amounts are estimates.",
      },
    ],
    links: [
      { to: "/plus", label: { ja: "プランを比べる", en: "Compare plans" } },
    ],
    faqs: [],
  },
  {
    id: "events",
    group: "more",
    emoji: "🏆",
    title: { ja: "イベント・今日のお題", en: "Events & daily themes" },
    mangaTitle: { ja: "お題で腕だめし", en: "Take on a theme" },
    lead: {
      ja: "毎日の「今日のお題」や、公式・ユーザー企画のイベントに作品で参加できます。入賞作品には王冠が付きます。",
      en: "Join the daily theme or official and community events with your work. Winning works get a crown.",
    },
    panels: [
      {
        image: "event-1",
        caption: {
          ja: "毎日かわる「今日のお題」",
          en: "A new daily theme every day",
        },
        bubbles: [
          {
            ja: "今日のお題はなにかな？",
            en: "What's today's theme?",
            at: "tr",
          },
        ],
      },
      {
        image: "event-2",
        caption: {
          ja: "お題やイベントのタグを付けて投稿するだけで参加",
          en: "Join by posting with the theme or event tag",
        },
        bubbles: [
          { ja: "よーし、描くぞ！", en: "Alright, let's draw!", at: "tr" },
        ],
      },
      {
        image: "event-3",
        caption: {
          ja: "入賞すると王冠が付く",
          en: "Winners get a crown",
        },
        bubbles: [{ ja: "入賞しちゃった…！", en: "I won…!", at: "tr" }],
      },
      {
        image: "event-4",
        caption: {
          ja: "自分でイベントを企画することもできる",
          en: "You can host your own event too",
        },
        bubbles: [
          {
            ja: "みんなで盛り上がろう！",
            en: "Let's have fun together!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "イベント一覧では、開催中・もうすぐ・終了を切り替えて見られます。",
        en: "Browse events by ongoing, upcoming and ended.",
      },
      {
        ja: "お題の提案もできます（採用されると今日のお題になります）。",
        en: "You can suggest themes too — chosen ones become the daily theme.",
      },
    ],
    links: [
      { to: "/events", label: { ja: "イベント一覧", en: "Events" } },
      {
        to: "/events/new",
        label: { ja: "イベントを作る", en: "Create an event" },
      },
    ],
    faqs: [],
  },
  {
    id: "stickers",
    group: "more",
    emoji: "💬",
    isNew: true,
    title: { ja: "スタンプ", en: "Stickers" },
    mangaTitle: { ja: "スタンプで伝えよう", en: "Say it with stickers" },
    lead: {
      ja: "コメントに送れるスタンプは、自分の絵から作ったり、ほかの人のスタンプを保存したりできます。最初から使えるスタンプも新しくなりました。",
      en: "Make stickers from your own art or save others' to use in comments. The default stickers have been refreshed, too.",
    },
    panels: [
      {
        image: "sticker-1",
        caption: {
          ja: "自分の絵からスタンプを作れる",
          en: "Make stickers from your own art",
        },
        bubbles: [{ ja: "かわいくできた♪", en: "So cute♪", at: "tr" }],
      },
      {
        image: "sticker-2",
        caption: {
          ja: "みんなのスタンプを保存して使える",
          en: "Save and use others' stickers",
        },
        bubbles: [{ ja: "これ使いたい！", en: "I want this one!", at: "tr" }],
      },
      {
        image: "sticker-3",
        caption: {
          ja: "よく使うスタンプはコメント欄に固定（12 個まで）",
          en: "Pin favorites to the comment box (up to 12)",
        },
        bubbles: [
          {
            ja: "ワンタップで送れる！",
            en: "Send with one tap!",
            at: "tr",
          },
        ],
      },
      {
        image: "sticker-4",
        caption: {
          ja: "新しいデフォルトのスタンプ（Thanks! など）",
          en: "New default stickers (Thanks! and more)",
        },
        bubbles: [
          {
            ja: "前のスタンプも設定で使えるよ",
            en: "Old ones are in settings, too",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "スタンプの一覧では、保存したスタンプが先頭に、最初から入っているスタンプが後ろに並びます。",
        en: "In the sticker list, your saved stickers come first and the defaults come after.",
      },
      {
        ja: "以前のデフォルトのスタンプ（Love / Good など）は、スタンプの設定で「以前のデフォルトのスタンプも使う」をオンにすると出ます。",
        en: "Turn on “Use previous default stickers” in sticker settings to bring back the old ones (Love, Good, etc.).",
      },
    ],
    links: [
      { to: "/stickers", label: { ja: "スタンプ広場", en: "Sticker gallery" } },
      {
        to: "/settings/sticker",
        label: { ja: "スタンプの設定", en: "Sticker settings" },
      },
    ],
    faqs: [],
  },
  {
    id: "pictor-chan",
    group: "more",
    emoji: "🌈",
    title: { ja: "ぴくたーちゃん", en: "Pictor-chan" },
    mangaTitle: {
      ja: "ぴくたーちゃんと遊ぼう",
      en: "Hang out with Pictor-chan",
    },
    lead: {
      ja: "ぴくたーちゃんは Aipictors の公式キャラクター。ロビーでみんなとおしゃべりしたり、ミニゲームで遊んだりできます。",
      en: "Pictor-chan is Aipictors' official mascot. Chat with everyone in the lobby or play the mini game.",
    },
    panels: [
      {
        image: "pic-1",
        caption: {
          ja: "Aipictors の公式キャラクター",
          en: "Aipictors' official mascot",
        },
        bubbles: [
          {
            ja: "改めてよろしくね！",
            en: "Nice to meet you again!",
            at: "tr",
          },
        ],
      },
      {
        image: "pic-2",
        caption: {
          ja: "ロビーでみんなとチャット",
          en: "Chat with everyone in the lobby",
        },
        bubbles: [
          {
            ja: "おしゃべりしよ〜",
            en: "Let's chat~",
            at: "tr",
          },
        ],
      },
      {
        image: "pic-3",
        caption: {
          ja: "無料で遊べる 3D ゲーム「ぴくたーちゃんラン」",
          en: "Play the free 3D game “Pictor-chan Run”",
        },
        bubbles: [
          { ja: "どこまで走れるかな？", en: "How far can I go?", at: "tr" },
        ],
      },
      {
        image: "pic-4",
        caption: {
          ja: "Discord でも質問に答えているよ",
          en: "I answer questions on Discord, too",
        },
        bubbles: [
          {
            ja: "困ったら気軽に聞いてね！",
            en: "Ask me anytime!",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "ぴくたーちゃんのイラストは、ライセンスの範囲で二次創作に使えます。",
        en: "You can use Pictor-chan in fan works within the license.",
      },
      {
        ja: "Discord では要望や不具合の報告も受け付けています。",
        en: "Feature requests and bug reports are welcome on Discord.",
      },
    ],
    links: [
      {
        to: "/pictor-chan",
        label: { ja: "ぴくたーちゃんのページ", en: "Pictor-chan page" },
      },
      {
        to: "/pictor-chan/run",
        label: { ja: "ぴくたーちゃんラン", en: "Pictor-chan Run" },
      },
      {
        to: "/pictor-chan/license",
        label: { ja: "ライセンス", en: "License" },
      },
    ],
    faqs: [],
  },
  {
    id: "safety",
    group: "more",
    emoji: "🛡️",
    title: { ja: "安心して使うための設定", en: "Safety & privacy settings" },
    mangaTitle: { ja: "自分にあった設定で", en: "Make it comfortable" },
    lead: {
      ja: "ブロック・ミュート、センシティブな画像のぼかし、匿名のいいねなど、気持ちよく使うための設定がそろっています。",
      en: "Block and mute, blur sensitive images, anonymous likes — settings to keep things comfortable.",
    },
    panels: [
      {
        image: "safe-1",
        caption: {
          ja: "設定でアカウントを守ろう",
          en: "Protect your account in settings",
        },
        bubbles: [
          {
            ja: "安心して使いたいよね",
            en: "Feel safe while you browse",
            at: "tr",
          },
        ],
      },
      {
        image: "safe-2",
        caption: {
          ja: "苦手なユーザーはブロック・ミュート",
          en: "Block or mute users",
        },
        bubbles: [
          { ja: "見えなくできるよ", en: "Hide them from view", at: "tr" },
        ],
      },
      {
        image: "safe-3",
        caption: {
          ja: "いいねは匿名にもできる",
          en: "Likes can be anonymous",
        },
        bubbles: [{ ja: "こっそり応援♪", en: "Cheer quietly♪", at: "tr" }],
      },
      {
        image: "safe-4",
        caption: {
          ja: "困ったら通報・お問い合わせ",
          en: "Report or contact us if something's wrong",
        },
        bubbles: [
          {
            ja: "運営がちゃんと見てるよ",
            en: "Our team is on it",
            at: "tr",
          },
        ],
      },
    ],
    points: [
      {
        ja: "センシティブな画像をぼかして表示する設定があります。",
        en: "You can blur sensitive images.",
      },
      {
        ja: "ミュートした相手のコメントは表示されなくなります（設定で表示に戻すこともできます）。",
        en: "Comments from muted users are hidden (you can show them again in settings).",
      },
      {
        ja: "ルールに反する作品やコメントは、作品ページの通報から知らせてください。",
        en: "Report works or comments that break the rules from the work page.",
      },
    ],
    links: [
      {
        to: "/settings/blocked/users",
        label: { ja: "ブロック中のユーザー", en: "Blocked users" },
      },
      {
        to: "/settings/muted/users",
        label: { ja: "ミュート中のユーザー", en: "Muted users" },
      },
      { to: "/guideline", label: { ja: "ガイドライン", en: "Guidelines" } },
      { to: "/contact", label: { ja: "お問い合わせ", en: "Contact" } },
    ],
    faqs: [
      {
        q: {
          ja: "退会したいときは？",
          en: "How do I delete my account?",
        },
        a: {
          ja: "アカウント設定の退会から手続きできます。退会の前に注意点を確認してください。",
          en: "Use account withdrawal in account settings. Please review the notes before deleting.",
        },
      },
    ],
  },
]

/** 以前のタブの名前（?tab=）から章へ */
export const LEGACY_TAB_TO_SECTION: Record<string, string> = {
  quickstart: "quickstart",
  overview: "quickstart",
  registration: "quickstart",
  posting: "posting",
  features: "features",
  generation: "generation",
  community: "events",
  "pictor-chan": "pictor-chan",
  coins: "coins",
}
