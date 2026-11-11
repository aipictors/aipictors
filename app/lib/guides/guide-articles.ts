import type { GuideSlug } from "~/lib/guides/guide-summaries"

/**
 * 解説記事の本文（日本語のみ）
 * 書くときの決まり: Aipictors の画面の名前は実際の表示に合わせる。数値は変わりやすいので
 * プランのページ（/plus）や生成機能の説明（/generation/about）へのリンクに任せる。ほかのサービスとは比べない
 */

export type GuideBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; text: string; caption?: string }
  | { type: "tip"; text: string }
  | { type: "links"; title?: string; items: { label: string; to: string }[] }

export type GuideArticle = {
  slug: GuideSlug
  title: string
  description: string
  publishedAt: string
  updatedAt: string
  blocks: GuideBlock[]
}

const PUBLISHED_AT = "2026-11-12"

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "prompt-basics",
    title: "AIイラストの呪文（プロンプト）の書き方｜基本と例",
    description:
      "AIイラストの呪文（プロンプト）の書き方を、語の並べ方・強調・品質の指定・ネガティブプロンプトまで例つきで解説。人気作品で実際に使われている呪文の集計も紹介します。",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    blocks: [
      {
        type: "p",
        text: "画像生成AIに「何を描いてほしいか」を伝える文を、プロンプトや呪文と呼びます。同じモデルでも呪文が変わると絵は大きく変わります。ここでは、Stable Diffusion 系のモデルを中心に、最初に知っておくと迷わない書き方をまとめます。",
      },
      { type: "h2", text: "基本は「何を・どんな様子で・どんな画で」" },
      {
        type: "p",
        text: "呪文は短い語をカンマ（,）で区切って並べるのが基本です。描くもの（人物・動物・風景）、その様子（髪型・服・表情・ポーズ）、場面（場所・時間・天気）、画の雰囲気（光・色・構図）の順に考えると書きやすくなります。",
      },
      {
        type: "code",
        caption: "例: 桜の下の女の子",
        text: "1girl, long hair, brown hair, school uniform, smile, cherry blossoms, spring, outdoors, soft lighting, upper body",
      },
      {
        type: "list",
        items: [
          "描くもの: 1girl（女の子 1 人）、cat（猫）、scenery（風景）など",
          "見た目: long hair、blue eyes、white dress など",
          "様子: smile、looking at viewer、sitting など",
          "場面: cherry blossoms、night sky、cafe など",
          "画の雰囲気: soft lighting、depth of field、watercolor など",
        ],
      },
      {
        type: "p",
        text: "アニメ調のモデルの多くは、イラスト投稿サイトのタグに近い英単語で学習しているため、英語の短い語のほうが意図どおりに効きやすい傾向があります。日本語や長い文章が得意なモデル（Gemini や FLUX など）もあるので、モデルの説明もあわせて確認しましょう。",
      },
      { type: "h2", text: "語の順番と強調" },
      {
        type: "p",
        text: "前のほうに書いた語ほど強く反映されやすいので、いちばん大事なものを先頭に置きます。特に効かせたい語は、Stable Diffusion 系では (語:1.2) のように括弧と数字で強めることができます。1.0 が通常で、1.1〜1.3 くらいが目安です。強くしすぎると絵が崩れやすくなります。",
      },
      {
        type: "code",
        text: "(cherry blossoms:1.2), 1girl, smile, (looking at viewer:1.1)",
      },
      {
        type: "tip",
        text: "括弧の書き方は生成ツールによって違うことがあります。効いていないと感じたら、括弧を外して語を前に移すだけでも変化を確かめられます。",
      },
      { type: "h2", text: "品質・画風の指定" },
      {
        type: "p",
        text: "masterpiece、best quality、highly detailed などの「品質の語」を先頭に入れる書き方がよく使われます。モデルによって推奨される語が違い、たとえば Animagine XL 系では masterpiece, best quality, very aesthetic, absurdres のような並びが紹介されています。まずはモデルの配布ページや、そのモデルで作られた人気作品の呪文を参考にするのが近道です。",
      },
      { type: "h2", text: "ネガティブプロンプトもセットで" },
      {
        type: "p",
        text: "描いてほしくないもの（崩れた手、文字、低画質など）を書く欄がネガティブプロンプトです。worst quality, low quality, bad hands, text, watermark などがよく使われます。詳しくはネガティブプロンプトの記事で紹介しています。",
      },
      { type: "h2", text: "人気作品の呪文から学ぶ" },
      {
        type: "p",
        text: "Aipictors では、投稿者が生成情報を公開している作品で呪文を見られます。呪文まとめのページでは、キャラクター・タグ・モデルごとに、人気作品でよく使われている語を割合つきで集計しています。気になる作品の呪文をコピーして、語を 1 つずつ入れ替えながら試すと、どの語が何に効いているのかがつかめます。",
      },
      {
        type: "links",
        title: "呪文まとめから探す",
        items: [
          { label: "呪文まとめの一覧", to: "/prompts" },
          { label: "初音ミクの呪文まとめ", to: "/prompts/tags/初音ミク" },
          { label: "風景の呪文まとめ", to: "/prompts/tags/風景" },
          { label: "猫耳の呪文まとめ", to: "/prompts/tags/猫耳" },
        ],
      },
      { type: "h2", text: "うまくいかないときのチェック" },
      {
        type: "list",
        items: [
          "語が多すぎないか（30〜40 語を超えると、後ろの語が効きにくくなります）",
          "矛盾した語が入っていないか（short hair と long hair など）",
          "モデルに合った書き方か（タグ形式が得意か、文章が得意か）",
          "同じ設定で何枚か作って比べたか（1 枚ごとの偶然の差も大きいです）",
        ],
      },
    ],
  },
  {
    slug: "negative-prompt",
    title: "ネガティブプロンプトとは？よく使う語と入れ方",
    description:
      "ネガティブプロンプトの意味と使い方を解説。崩れた手・低画質・文字などを避ける定番の語と、入れすぎたときの注意点をまとめました。",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    blocks: [
      {
        type: "p",
        text: "ネガティブプロンプトは「描いてほしくないもの」を伝える欄です。Stable Diffusion 系のモデルでは、ここに書いた語の特徴から遠ざかるように画像が作られます。手の崩れや低画質、画像に入り込む文字などを減らすのによく使われます。",
      },
      { type: "h2", text: "よく使われる語" },
      {
        type: "code",
        caption: "定番の例",
        text: "worst quality, low quality, normal quality, lowres, bad anatomy, bad hands, extra fingers, missing fingers, text, signature, watermark, blurry",
      },
      {
        type: "list",
        items: [
          "画質: worst quality, low quality, lowres, blurry, jpeg artifacts",
          "体の崩れ: bad anatomy, bad hands, extra fingers, missing fingers, extra limbs",
          "余計なもの: text, signature, watermark, logo, username",
          "画風を外す: 3d, realistic（アニメ調にしたいとき）や anime（写真調にしたいとき）",
        ],
      },
      { type: "h2", text: "入れすぎに注意" },
      {
        type: "p",
        text: "ネガティブプロンプトは長くすればよいわけではありません。語が多いと、本来描きたい要素まで弱まったり、絵の雰囲気が平板になったりすることがあります。まずは上の定番の語から始め、気になる崩れが出たときに 1 語ずつ足すのがおすすめです。",
      },
      {
        type: "tip",
        text: "モデルによっては、作者がネガティブプロンプトの推奨例を公開しています。モデルの説明や、そのモデルで作られた人気作品の設定を見てみましょう。",
      },
      { type: "h2", text: "ネガティブプロンプトが効かないモデル" },
      {
        type: "p",
        text: "文章で指示するタイプのモデル（Gemini など）では、ネガティブプロンプトの欄がなかったり、効き方が違ったりします。その場合は「文字を入れない」「背景はシンプルに」のように、本文の指示に含めて伝えます。",
      },
      {
        type: "links",
        title: "あわせて読む",
        items: [
          { label: "呪文（プロンプト）の書き方", to: "/guides/prompt-basics" },
          { label: "モデルの選び方", to: "/guides/choose-model" },
          { label: "呪文まとめの一覧", to: "/prompts" },
        ],
      },
    ],
  },
  {
    slug: "choose-model",
    title: "AIイラストのモデルの選び方｜アニメ調・リアル・背景",
    description:
      "画像生成AIのモデルの選び方を解説。SD1.5・SDXL・FLUX・Gemini などの違い、アニメ調・セミリアル・背景向けなど描きたいものに合わせた探し方を紹介します。",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    blocks: [
      {
        type: "p",
        text: "同じ呪文でも、使うモデルによって絵柄はまったく変わります。モデル選びは「どんな絵を作りたいか」を決めることでもあります。ここでは、Aipictors の生成機能で選べるモデルの種類を例に、選び方の考え方をまとめます。",
      },
      { type: "h2", text: "モデルの系統" },
      {
        type: "list",
        items: [
          "SD1.5 系: 軽くて種類が多い世代。アニメ調・セミリアルなど、作者ごとに個性の強いモデルがそろっています",
          "SDXL 系: より大きな画像で細部まで描ける世代。Animagine XL や Illustrious 系など、アニメ調で人気のモデルが多く、タグ形式の呪文がよく効きます",
          "FLUX 系: 文章での指示や、画像の中の文字の再現が得意な系統です",
          "Gemini 系（Nano Banana）: 日本語の文章で指示でき、参考画像を使った編集にも向いています",
        ],
      },
      {
        type: "p",
        text: "系統によって呪文の書き方も変わります。SD1.5・SDXL ではカンマ区切りの英単語、FLUX や Gemini では自然な文章が向いています。モデルを変えたら、呪文の書き方も合わせて調整しましょう。",
      },
      { type: "h2", text: "描きたいものから選ぶ" },
      {
        type: "list",
        items: [
          "アニメ調の女の子・キャラクター: SDXL のアニメ系モデル（animagine、Illustrious 系など）や、SD1.5 のイラスト系モデル",
          "写真のようなリアルな人物: セミリアル・リアル系のモデル。光やカメラの語（natural light, 35mm photo など）が効きます",
          "背景・風景: 背景向けのモデルや、風景の作例が多いモデル",
          "文章で細かく指示したい・画像を参考にしたい: FLUX や Gemini 系",
        ],
      },
      { type: "h2", text: "作例を見て決めるのがいちばん早い" },
      {
        type: "p",
        text: "モデルの説明だけでは、実際にどんな絵になるかは分かりにくいものです。Aipictors では、作品に使われたモデルが記録されているので、モデルごとの作品や、よく使われている呪文を見比べられます。気に入った作品のモデルと呪文をそのまま試してみるのがおすすめです。",
      },
      {
        type: "links",
        title: "モデルごとの呪文まとめ",
        items: [
          { label: "モデルの一覧（呪文まとめ）", to: "/prompts#models" },
          {
            label: "animagine-xl-3.0 の呪文まとめ",
            to: "/prompts/models/animagine-xl-3.0",
          },
          {
            label: "blue_pencil-v10 の呪文まとめ",
            to: "/prompts/models/blue_pencil-v10",
          },
          {
            label: "GeminiNanoBanana の呪文まとめ",
            to: "/prompts/models/GeminiNanoBanana",
          },
        ],
      },
      { type: "h2", text: "料金と生成枚数" },
      {
        type: "p",
        text: "Aipictors の生成機能は無料のアカウントでも毎日使えます。モデルや画像の大きさによって 1 枚あたりに使う量が違い、サブスクに加入すると 1 日に作れる枚数や使える機能が増えます。最新の内容はプランのページで確認してください。",
      },
      {
        type: "links",
        items: [
          { label: "生成機能について", to: "/generation/about" },
          { label: "プランと特典", to: "/plus" },
        ],
      },
    ],
  },
  {
    slug: "character-prompts",
    title: "キャラクターを安定して描く呪文のコツ",
    description:
      "AIイラストでキャラクターを安定して描くための呪文のコツ。名前・髪型・目の色・衣装の書き方と、同じキャラクターを続けて描くための工夫を解説します。",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    blocks: [
      {
        type: "p",
        text: "好きなキャラクターや自分のオリジナルキャラクター（うちの子）を描くとき、毎回見た目が変わってしまうのはよくある悩みです。呪文の書き方を少し工夫するだけで、ぶれをかなり減らせます。",
      },
      { type: "h2", text: "名前だけに頼らない" },
      {
        type: "p",
        text: "よく知られたキャラクターは、名前（英語表記が使われることが多いです）だけで描けるモデルもあります。ただし、モデルが覚えている度合いはさまざまなので、髪型・髪の色・目の色・衣装・小物など、見た目の特徴も一緒に書くと安定します。",
      },
      {
        type: "code",
        caption: "例: 特徴を足した書き方",
        text: "1girl, twintails, aqua hair, aqua eyes, very long hair, detached sleeves, necktie, headset, smile",
      },
      { type: "h2", text: "オリジナルキャラクターは「設定の呪文」を固定する" },
      {
        type: "list",
        items: [
          "髪型・色・目の色・体格・衣装を決め、毎回同じ語・同じ順番で書く",
          "その日の場面（場所・ポーズ・表情）は後ろにまとめ、ここだけを入れ替える",
          "モデルも固定する（モデルを変えると同じ呪文でも顔立ちが変わります）",
          "気に入った 1 枚ができたら、その呪文と設定を保存しておく",
        ],
      },
      {
        type: "tip",
        text: "Aipictors の生成機能では、生成した画像の設定が生成履歴に残ります。気に入った 1 枚から設定を呼び出して、場面の語だけを変えると続きを作りやすくなります。",
      },
      { type: "h2", text: "二次創作のときの注意" },
      {
        type: "p",
        text: "既存のキャラクターを描くときは、公式のガイドラインや投稿先のルールを確認しましょう。Aipictors では、作品にキャラクター名や作品名のタグを付けると、同じキャラクターが好きな人に見つけてもらいやすくなります。",
      },
      {
        type: "links",
        title: "キャラクターの呪文まとめ",
        items: [
          { label: "キャラクター・作品の一覧", to: "/prompts#characters" },
          { label: "初音ミク", to: "/prompts/tags/初音ミク" },
          { label: "原神", to: "/prompts/tags/原神" },
          { label: "ホロライブ", to: "/prompts/tags/ホロライブ" },
          { label: "うちの子", to: "/prompts/tags/うちの子" },
        ],
      },
    ],
  },
  {
    slug: "generate-and-post",
    title: "Aipictorsで生成して投稿するまでの手順",
    description:
      "Aipictors の無料の画像生成で AI イラストを作り、呪文（生成情報）つきで作品を投稿するまでの手順を、画面の流れにそって紹介します。",
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
    blocks: [
      {
        type: "p",
        text: "Aipictors は、AIイラストを投稿・閲覧できるサイトと、画像生成の機能が一緒になったサービスです。ここでは、生成した画像を作品として投稿するまでの流れを紹介します。",
      },
      { type: "h2", text: "1. アカウントを作る" },
      {
        type: "p",
        text: "登録は無料です。メールアドレスや SNS のアカウントで登録できます。登録すると、生成のほか、いいね・コメント・フォローなども使えるようになります。",
      },
      { type: "h2", text: "2. 生成画面で画像を作る" },
      {
        type: "list",
        ordered: true,
        items: [
          "生成画面（www.aipictors.com/generation）を開く",
          "使いたいモデルを選ぶ",
          "プロンプト（呪文）とネガティブプロンプトを入力する",
          "画像の大きさなどを調整して生成する",
          "できた画像は生成履歴に残るので、気に入ったものを選ぶ",
        ],
      },
      {
        type: "tip",
        text: "作品ページで生成情報が公開されている作品は、その呪文を参考にできます。呪文まとめの「この呪文で生成」からも、呪文を入れた状態で生成画面を開けます。",
      },
      { type: "h2", text: "3. 作品として投稿する" },
      {
        type: "list",
        ordered: true,
        items: [
          "投稿画面（画像）を開き、「生成履歴から選ぶ」で生成した画像を選ぶ（手元の画像を選ぶこともできます）",
          "タイトルと説明を書く",
          "年齢制限（全年齢・R15・R18 など）を選ぶ",
          "タグを付ける（10 個まで。タグの自動生成も使えます）",
          "生成情報（呪文など）を公開するかを選ぶ",
          "すぐに公開するか、予約投稿にするかを選んで投稿する",
        ],
      },
      {
        type: "p",
        text: "生成情報を公開すると、作品ページで呪文やモデルが見られるようになり、ほかの人の参考になります。公開した呪文は、呪文まとめの集計にも使われることがあります。",
      },
      { type: "h2", text: "4. 見てもらうための工夫" },
      {
        type: "list",
        items: [
          "キャラクター名・作品名・描いたもの（猫耳、風景など）のタグを付ける",
          "今日のお題やイベントに参加する",
          "AI評価を使うと、作品にコメントや点数がつきます",
        ],
      },
      {
        type: "links",
        title: "次に読む",
        items: [
          { label: "呪文（プロンプト）の書き方", to: "/guides/prompt-basics" },
          { label: "生成機能について", to: "/generation/about" },
          { label: "使い方ガイド（ヘルプ）", to: "/help" },
          { label: "今日のお題", to: "/themes" },
        ],
      },
    ],
  },
]

export const findGuideArticle = (slug: string) =>
  GUIDE_ARTICLES.find((article) => article.slug === slug) ?? null
