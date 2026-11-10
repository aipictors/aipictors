import type { IntrospectionEnum } from "~/lib/introspection-enum"

export type GenreKey = "2d" | "2.5d" | "3d"

/** [日本語, English] */
type Text = readonly [string, string]

export type GenreSectionKey = "tastes" | "ranking" | "classics"

export type GenreConfig = {
  key: GenreKey
  /** R18 の入口か（リンク先・作品の条件・構造化データが変わる） */
  isSensitive: boolean
  path: string
  style: IntrospectionEnum<"ImageStyle">
  /** テイスト切り替えの表示名 */
  label: Text
  /** テイスト切り替えの補足（スマホでは出さない） */
  subLabel: Text
  /** パンくずと構造化データの名前 */
  name: Text
  h1: Text
  lead: Text
  /** ファーストビューの画像の並べ方 */
  heroLayout: "mosaic" | "stagger" | "filmstrip"
  /** 背景のぼかしの色（Tailwind のクラス） */
  blobs: readonly [string, string]
  /** 人気作品カードの縦横比（Tailwind のクラス） */
  cardAspect: string
  /** 上から順に出すセクション（ジャンルごとに見せたいものを先に置く） */
  sectionOrder: readonly GenreSectionKey[]
  tastesTitle: Text
  tastesLead: Text
  /** テイスト別の入口。タグ名は実際に作品があるものだけを選ぶ */
  tastes: readonly { tag: string; description: Text }[]
  rankingTitle: Text
  rankingLead: Text
  classicsTitle: Text
  classicsLead: Text
  newTitle: Text
  howToTitle: Text
  howToLead: Text
  steps: readonly { title: Text; body: Text }[]
  /** /generation?prompts= で開く、試しやすいプロンプト */
  samplePrompts: readonly { label: Text; prompt: string }[]
  aboutTitle: Text
  about: readonly Text[]
  faqs: readonly { question: Text; answer: Text }[]
}

const FREE_ANSWER: Text = [
  "はい。ログインすると毎日100フリーコインが届き、1日10枚まで無料で生成できます（1回1枚）。アプリのインストールは不要で、スマホ・PCのブラウザからそのまま使えます。",
  "Yes. After logging in you get 100 free coins every day, enough for 10 images a day (1 per run). No app is needed; it works in mobile and desktop browsers.",
]

export const GENRE_CONFIGS: Record<GenreKey, GenreConfig> = {
  "2d": {
    key: "2d",
    isSensitive: false,
    path: "/posts/2d",
    style: "ILLUSTRATION",
    label: ["2D", "2D"],
    subLabel: ["イラスト", "Illustration"],
    name: ["2D AIイラスト", "2D AI illustrations"],
    h1: [
      "2DのAIイラスト・アニメ調の作品",
      "2D AI illustrations and anime-style art",
    ],
    lead: [
      "アニメ調・イラスト調のAI作品を集めました。今週の人気作品やテイスト別のタグから好みの絵柄を見つけて、公開されているプロンプトを参考に自分でも作れます。",
      "A collection of anime and illustration-style AI art. Find a style you like from this week's popular works and tags, then make your own using the prompts creators have shared.",
    ],
    heroLayout: "mosaic",
    blobs: ["bg-pink-400/20", "bg-violet-400/20"],
    cardAspect: "aspect-square",
    sectionOrder: ["tastes", "ranking", "classics"],
    tastesTitle: ["絵柄・テーマから探す", "Browse by style and theme"],
    tastesLead: [
      "かわいい系からかっこいい系まで、タグごとに作品を見られます",
      "From cute to cool, see the works for each tag",
    ],
    tastes: [
      { tag: "ゆめかわ", description: ["パステルのふんわり", "Soft pastels"] },
      {
        tag: "ちびキャラ",
        description: ["デフォルメのかわいさ", "Cute and tiny"],
      },
      {
        tag: "猫耳",
        description: ["定番の人気モチーフ", "A classic favorite"],
      },
      {
        tag: "魔法少女",
        description: ["きらめく衣装と魔法", "Sparkling magic"],
      },
      {
        tag: "ファンタジー",
        description: ["剣と魔法の世界", "Worlds of magic"],
      },
      { tag: "着物", description: ["和の色合いと柄", "Japanese patterns"] },
      {
        tag: "風景",
        description: ["人物なしの背景も", "Scenery and backgrounds"],
      },
      { tag: "SF", description: ["未来都市と宇宙", "Future cities and space"] },
    ],
    rankingTitle: ["今週の人気 2D イラスト", "Popular 2D works this week"],
    rankingLead: [
      "この1週間に投稿された作品を、いいねの多い順に並べています（1人1作品）",
      "Works posted in the last 7 days, by likes (one per creator)",
    ],
    classicsTitle: ["これまでに人気の 2D イラスト", "All-time favorites"],
    classicsLead: [
      "投稿からの累計でいいねが多い作品です",
      "The most liked works of all time",
    ],
    newTitle: ["新着の 2D イラスト", "New 2D works"],
    howToTitle: [
      "アニメ調のAIイラストを作ってみる",
      "Make your own anime-style art",
    ],
    howToLead: [
      "絵柄はモデルで大きく変わります。まずはプロンプトを1つ試してみましょう。",
      "The model decides most of the look. Start by trying a prompt.",
    ],
    steps: [
      {
        title: ["アニメ系のモデルを選ぶ", "Pick an anime model"],
        body: [
          "SDXL・Illustrious 系のアニメモデルが選べます。迷ったら好きな作品のページで使われているモデルを見てみましょう。",
          "Choose from SDXL and Illustrious anime models. Not sure? See which model your favorite works used.",
        ],
      },
      {
        title: ["絵柄の言葉を足す", "Add style words"],
        body: [
          "「anime style」「pastel colors」など、絵柄や色を表す言葉を足すと狙いに近づきます。日本語の文章でも入力できます。",
          "Words like “anime style” or “pastel colors” get you closer. You can also write in Japanese.",
        ],
      },
      {
        title: ["テイスト「イラスト」で投稿する", "Post it as “Illustration”"],
        body: [
          "気に入った画像は、投稿画面でテイストを「イラスト」にして公開すると、このページに載ります。",
          "Choose the “Illustration” taste when posting and your work appears on this page.",
        ],
      },
    ],
    samplePrompts: [
      {
        label: ["パステルのちびドラゴン", "Pastel chibi dragon"],
        prompt:
          "cute chibi dragon, pastel colors, soft lighting, flower field, anime style, simple background",
      },
      {
        label: ["雲の上のお城", "Castle above the clouds"],
        prompt:
          "fantasy castle above the clouds, sunset sky, detailed background, anime style, no humans",
      },
      {
        label: ["桜と着物の女性", "Woman in a kimono"],
        prompt:
          "adult woman, cat ears, floral kimono, cherry blossoms, gentle smile, anime style, soft lighting",
      },
    ],
    aboutTitle: ["2DのAIイラストとは", "What are 2D AI illustrations?"],
    about: [
      [
        "このページの2Dは、投稿するときにテイスト「イラスト」が選ばれた作品です。線と塗りで描かれたアニメ調・イラスト調の画像が中心で、キャラクターから背景まで幅広く投稿されています。",
        "“2D” here means works posted with the “Illustration” taste: mostly anime and illustration-style images, from characters to backgrounds.",
      ],
      [
        "「P」のマークが付いた作品はプロンプトが公開されています。作品ページで使われた言葉やモデルを確認して、自分の生成の参考にできます。",
        "Works marked “P” share their prompts. Open the work to see the words and model used, and use them as a starting point.",
      ],
    ],
    faqs: [
      {
        question: [
          "2Dの作品はどうやって分けていますか？",
          "How are 2D works chosen?",
        ],
        answer: [
          "投稿者が投稿時に選んだテイスト（イラスト・セミリアル・リアル）で分けています。「イラスト」を選んだ作品がこのページに並びます。",
          "By the taste the creator selects when posting (Illustration, Semi-real or Real). Works marked Illustration appear here.",
        ],
      },
      {
        question: [
          "アニメ調のAIイラストはどう作りますか？",
          "How do I make anime-style AI art?",
        ],
        answer: [
          "画像生成ページでアニメ系のモデルを選び、作りたい内容をプロンプトに書いて生成します。公開されている作品のプロンプトを参考にすると近い絵柄を狙いやすくなります。",
          "Open the generator, pick an anime model and describe what you want. Prompts shared on other works are a good starting point.",
        ],
      },
      {
        question: ["プロンプトは見られますか？", "Can I see the prompts?"],
        answer: [
          "投稿者が公開している作品は、作品ページで見られます。一覧の絞り込みで「プロンプト公開」を選ぶと、公開されている作品だけを表示できます。",
          "Yes, when the creator has shared them. Use the “Prompt shared” filter to see only those works.",
        ],
      },
      {
        question: ["無料で作れますか？", "Is it free to make images?"],
        answer: FREE_ANSWER,
      },
    ],
  },
  "2.5d": {
    key: "2.5d",
    isSensitive: false,
    path: "/posts/2.5d",
    style: "SEMI_REAL",
    label: ["2.5D", "2.5D"],
    subLabel: ["セミリアル", "Semi-real"],
    name: ["2.5D AIイラスト", "2.5D AI art"],
    h1: ["2.5D・セミリアルのAIイラスト", "2.5D and semi-real AI art"],
    lead: [
      "アニメの表情と実写のような質感をあわせ持つ、2.5Dの作品を集めました。光や素材の描き込みが映える、絵画のような一枚を探せます。",
      "Works that combine anime expressions with lifelike texture. Find painterly pieces with rich light and materials.",
    ],
    heroLayout: "stagger",
    blobs: ["bg-amber-400/20", "bg-rose-400/20"],
    cardAspect: "aspect-[4/5]",
    sectionOrder: ["ranking", "tastes", "classics"],
    tastesTitle: ["世界観から探す", "Browse by world and mood"],
    tastesLead: [
      "質感が活きるテーマをタグごとに見られます",
      "Themes where texture really shines, by tag",
    ],
    tastes: [
      {
        tag: "ファンタジー",
        description: ["重厚な異世界", "Rich other worlds"],
      },
      { tag: "騎士", description: ["鎧の光沢と重み", "Gleaming armor"] },
      { tag: "魔女", description: ["妖しい魔法の気配", "A hint of magic"] },
      { tag: "着物", description: ["布の質感と和の美", "Texture of silk"] },
      {
        tag: "ダーク",
        description: ["光と影のコントラスト", "Light and shadow"],
      },
      {
        tag: "サイバーパンク",
        description: ["ネオンと機械", "Neon and machines"],
      },
      { tag: "異形", description: ["人ならざるものたち", "Strange beings"] },
      { tag: "風景", description: ["絵画のような景色", "Painterly scenery"] },
    ],
    rankingTitle: ["今週の人気 2.5D 作品", "Popular 2.5D works this week"],
    rankingLead: [
      "この1週間に投稿された作品を、いいねの多い順に並べています（1人1作品）",
      "Works posted in the last 7 days, by likes (one per creator)",
    ],
    classicsTitle: ["これまでに人気の 2.5D 作品", "All-time favorites"],
    classicsLead: [
      "投稿からの累計でいいねが多い作品です",
      "The most liked works of all time",
    ],
    newTitle: ["新着の 2.5D 作品", "New 2.5D works"],
    howToTitle: ["セミリアルの質感を出してみる", "Try a semi-real look"],
    howToLead: [
      "アニメ寄りとリアル寄りの間を探るのが2.5Dの楽しさです。",
      "The fun of 2.5D is finding the spot between anime and real.",
    ],
    steps: [
      {
        title: [
          "好きな作品のモデルを確かめる",
          "Check the model of a work you like",
        ],
        body: [
          "セミリアルはモデルごとの差が大きいので、好きな作品のページで使われているモデルを見て、同じものから試すのが近道です。",
          "Models vary a lot, so start with the one used by a work you like.",
        ],
      },
      {
        title: ["光と素材を言葉にする", "Describe light and materials"],
        body: [
          "「rim lighting」「silver armor」のように、光の当たり方や素材を書くと質感が出やすくなります。",
          "Words like “rim lighting” or “silver armor” bring out texture.",
        ],
      },
      {
        title: ["テイスト「セミリアル」で投稿する", "Post it as “Semi-real”"],
        body: [
          "投稿画面でテイストを「セミリアル」にすると、このページに載ります。",
          "Choose the “Semi-real” taste when posting and your work appears on this page.",
        ],
      },
    ],
    samplePrompts: [
      {
        label: ["銀の鎧の騎士", "Knight in silver armor"],
        prompt:
          "adult female knight, silver armor, rim lighting, cathedral, semi-realistic, painterly, detailed texture",
      },
      {
        label: ["夜の森の魔女", "Witch in a night forest"],
        prompt:
          "adult witch, dark forest at night, glowing lantern, mist, semi-realistic, cinematic lighting",
      },
      {
        label: ["ネオンの未来都市", "Neon future city"],
        prompt:
          "cyberpunk city street, neon signs, rain reflections, semi-realistic, cinematic, no humans",
      },
    ],
    aboutTitle: ["2.5D（セミリアル）とは", "What is 2.5D (semi-real)?"],
    about: [
      [
        "2.5Dは、2Dのイラストと実写の中間にある表現です。Aipictors では、投稿するときにテイスト「セミリアル」が選ばれた作品をこのページに集めています。",
        "2.5D sits between 2D illustration and photorealism. On Aipictors, works posted with the “Semi-real” taste are collected here.",
      ],
      [
        "肌や布、金属の質感を描き込みつつ、顔立ちはアニメに寄せた作品が多く、ファンタジーや和装のテーマとよく合います。",
        "Many works pair detailed skin, cloth and metal with anime-like faces, and suit fantasy and traditional themes.",
      ],
    ],
    faqs: [
      {
        question: [
          "2.5Dとセミリアルは同じですか？",
          "Are 2.5D and semi-real the same?",
        ],
        answer: [
          "Aipictors では同じものとして扱っています。投稿時のテイストで「セミリアル」が選ばれた作品が2.5Dとしてこのページに並びます。",
          "On Aipictors, yes. Works posted with the “Semi-real” taste are listed here as 2.5D.",
        ],
      },
      {
        question: [
          "2Dや3Dとの違いは何ですか？",
          "How is it different from 2D and 3D?",
        ],
        answer: [
          "2Dは線と塗りのイラスト、3Dは写真のようなリアルな表現が中心です。2.5Dはその間で、イラストの雰囲気を残しながら立体感や質感を強めた作品です。",
          "2D is drawn illustration and 3D is photo-like. 2.5D sits between them, keeping an illustrated feel with more depth and texture.",
        ],
      },
      {
        question: [
          "どのモデルを使えばいいですか？",
          "Which model should I use?",
        ],
        answer: [
          "決まった正解はありません。好きな作品のページで使われているモデルを確認するか、モデル一覧で作例を見比べて選ぶのがおすすめです。",
          "There is no single answer. Check the model used by a work you like, or compare examples in the model list.",
        ],
      },
      {
        question: ["無料で作れますか？", "Is it free to make images?"],
        answer: FREE_ANSWER,
      },
    ],
  },
  "3d": {
    key: "3d",
    isSensitive: false,
    path: "/posts/3d",
    style: "REAL",
    label: ["3D", "3D"],
    subLabel: ["リアル", "Real"],
    name: ["3D・実写風のAI画像", "3D and photorealistic AI images"],
    h1: ["3D・実写風のAI画像とAIフォト", "3D and photorealistic AI images"],
    lead: [
      "写真のようなAIフォトや3D調の作品を集めました。ポートレートやグラビア風、料理、夜景まで、光と空気感を楽しめる一枚を探せます。",
      "A collection of photo-like AI images and 3D-style works: portraits, gravure-style shots, food, night views and more.",
    ],
    heroLayout: "filmstrip",
    blobs: ["bg-sky-400/20", "bg-teal-400/15"],
    cardAspect: "aspect-[3/4]",
    sectionOrder: ["ranking", "classics", "tastes"],
    tastesTitle: ["被写体から探す", "Browse by subject"],
    tastesLead: [
      "人物だけでなく、料理や動物、街の写真風の作品もあります",
      "Not just people: food, animals and city scenes too",
    ],
    tastes: [
      {
        tag: "ポートレート",
        description: ["人物写真の定番", "Portrait shots"],
      },
      {
        tag: "グラビア",
        description: ["雑誌のような一枚", "Magazine-style shots"],
      },
      {
        tag: "コスプレ",
        description: ["衣装とキャラクター", "Costumes and characters"],
      },
      { tag: "和服", description: ["着物姿の写真風", "Japanese dress"] },
      { tag: "夜景", description: ["光がにじむ街", "Glowing cityscapes"] },
      { tag: "料理", description: ["おいしそうな質感", "Delicious textures"] },
      { tag: "猫", description: ["毛並みまでリアルに", "Lifelike fur"] },
      { tag: "制服", description: ["日常のひとコマ", "Everyday scenes"] },
    ],
    rankingTitle: ["今週の人気 AIフォト", "Popular AI photos this week"],
    rankingLead: [
      "この1週間に投稿された作品を、いいねの多い順に並べています（1人1作品）",
      "Works posted in the last 7 days, by likes (one per creator)",
    ],
    classicsTitle: ["これまでに人気の AIフォト", "All-time favorites"],
    classicsLead: [
      "投稿からの累計でいいねが多い作品です",
      "The most liked works of all time",
    ],
    newTitle: ["新着の AIフォト・3D作品", "New AI photos and 3D works"],
    howToTitle: [
      "写真のようなAI画像を作ってみる",
      "Make a photo-like AI image",
    ],
    howToLead: [
      "カメラで撮るつもりで、光とレンズを言葉にするのがコツです。",
      "Think like a photographer: describe the light and the lens.",
    ],
    steps: [
      {
        title: ["リアル系のモデルを選ぶ", "Pick a realistic model"],
        body: [
          "実写風はモデルで仕上がりが大きく変わります。人気の作品で使われているモデルを見て選ぶと失敗しにくくなります。",
          "The model matters a lot for realism. Check which models popular works used.",
        ],
      },
      {
        title: ["光とレンズを書く", "Describe light and lens"],
        body: [
          "「natural light」「35mm photo」「shallow depth of field」など、撮影の言葉を足すと写真らしさが出ます。",
          "Photo terms such as “natural light”, “35mm photo” and “shallow depth of field” add realism.",
        ],
      },
      {
        title: ["テイスト「リアル」で投稿する", "Post it as “Real”"],
        body: [
          "投稿画面でテイストを「リアル」にすると、このページに載ります。芸能人や実在の人物の無断使用は禁止されているので、ガイドラインも確認してください。",
          "Choose the “Real” taste when posting. Unauthorized use of celebrities or real people is prohibited; please read the guidelines.",
        ],
      },
    ],
    samplePrompts: [
      {
        label: ["雨の夜の街", "Rainy night street"],
        prompt:
          "city street at night, rain, neon reflections on wet asphalt, 35mm photo, cinematic, no humans",
      },
      {
        label: ["木のテーブルのパスタ", "Pasta on a wooden table"],
        prompt:
          "homemade pasta on a wooden table, natural window light, close up, shallow depth of field, food photography",
      },
      {
        label: ["ソファで眠る猫", "Cat asleep on a sofa"],
        prompt:
          "orange cat sleeping on a sofa, morning sunlight, soft fur detail, 50mm photo, shallow depth of field",
      },
    ],
    aboutTitle: [
      "3D・実写風のAI画像とは",
      "What are 3D and photorealistic AI images?",
    ],
    about: [
      [
        "このページの3Dは、投稿するときにテイスト「リアル」が選ばれた作品です。写真のように見えるAIフォトを中心に、3DCG調の作品も含まれます。",
        "“3D” here means works posted with the “Real” taste: mainly photo-like AI images, along with 3DCG-style works.",
      ],
      [
        "ここで見られるのは全年齢の作品だけです。ポートレートやAIグラビアのほか、料理や動物、街並みなど、人物以外の作品もタグから探せます。",
        "Only all-ages works are shown here. Along with portraits and gravure-style images, tags help you find food, animals and city scenes.",
      ],
    ],
    faqs: [
      {
        question: [
          "ここでの「3D」は3DCGのことですか？",
          "Does “3D” here mean 3DCG?",
        ],
        answer: [
          "3DCGだけではありません。投稿時にテイスト「リアル」が選ばれた作品をまとめているので、写真のようなAIフォトが多く、3DCG調の作品も含まれます。",
          "Not only. This page collects works posted with the “Real” taste, so most are photo-like images, with some 3DCG-style works.",
        ],
      },
      {
        question: [
          "AIグラビアの作品は見られますか？",
          "Can I find AI gravure images?",
        ],
        answer: [
          "全年齢の作品であれば、このページや「グラビア」「ポートレート」のタグから見られます。",
          "Yes, all-ages works are available on this page and under the “グラビア” and “ポートレート” tags.",
        ],
      },
      {
        question: [
          "写真のように作るコツはありますか？",
          "How do I make images look like photos?",
        ],
        answer: [
          "リアル系のモデルを選び、「natural light」「35mm photo」など光やカメラの言葉をプロンプトに足すと写真らしくなります。人気の作品で公開されているプロンプトも参考になります。",
          "Pick a realistic model and add light and camera terms such as “natural light” and “35mm photo”. Prompts shared on popular works help too.",
        ],
      },
      {
        question: [
          "実在の人物に似せた画像は投稿できますか？",
          "Can I post images of real people?",
        ],
        answer: [
          "芸能人や実在の人物の無断使用はガイドラインで禁止しています。投稿の前にガイドラインを確認してください。",
          "No. Unauthorized use of celebrities or real people is prohibited by our guidelines. Please read them before posting.",
        ],
      },
      {
        question: ["無料で作れますか？", "Is it free to make images?"],
        answer: FREE_ANSWER,
      },
    ],
  },
}

export const GENRE_KEYS: readonly GenreKey[] = ["2d", "2.5d", "3d"]

const R18_RANKING_LEAD: Text = [
  "この1週間に投稿された作品を、いいねの多い順に並べています（1人1作品）",
  "Works posted in the last 7 days, by likes (one per creator)",
]

const R18_CLASSICS_LEAD: Text = [
  "投稿からの累計でいいねが多い作品です",
  "The most liked works of all time",
]

const R18_TASTES_LEAD: Text = [
  "人気の作品によく付いているタグから探せます",
  "Tags that often appear on popular works",
]

const R18_FAQS: GenreConfig["faqs"] = [
  {
    question: ["このページは誰が見られますか？", "Who can view this page?"],
    answer: [
      "18歳以上の方だけがご覧いただけます。18歳未満の方はご利用いただけません。",
      "Only people aged 18 and over. If you are under 18, please do not use this section.",
    ],
  },
  {
    question: [
      "人前で開くときに画像を隠せますか？",
      "Can I hide images in public?",
    ],
    answer: [
      "画面右下の目のボタンで、作品の画像をまとめてぼかせます。設定はこの端末に記憶されます。",
      "Yes. The eye button at the bottom right blurs all work images, and the setting is remembered on this device.",
    ],
  },
  {
    question: ["投稿のときに気をつけることは？", "What should I check before posting?"],
    answer: [
      "年齢区分を正しく設定してください。児童の性的搾取を示唆する内容や、実在の人物の無断使用は禁止しています。詳しくはR18規約とガイドラインをご確認ください。",
      "Set the correct age rating. Content suggesting the sexual exploitation of children and unauthorized use of real people are prohibited. See the R18 terms and guidelines.",
    ],
  },
]

const R18_STEPS: GenreConfig["steps"] = [
  {
    title: ["好きな作品のモデルを確かめる", "Check the model of a work you like"],
    body: [
      "作品ページで使われているモデルやプロンプトが公開されていれば、同じものから試せます。",
      "If a work shares its model and prompt, you can start from the same ones.",
    ],
  },
  {
    title: ["生成して選ぶ", "Generate and choose"],
    body: [
      "何枚か作って、気に入ったものを選びましょう。ガイドラインに沿った内容で作成してください。",
      "Make a few and pick your favorite. Please stay within the guidelines.",
    ],
  },
  {
    title: ["年齢区分を R18 にして投稿する", "Post it with the R18 rating"],
    body: [
      "投稿画面で年齢区分を R18 に、テイストを選んで公開すると、このページに載ります。",
      "Choose the R18 rating and a taste when posting, and your work appears on this page.",
    ],
  },
]

/** R18 の入口の文章。タグは作品のデータから選ぶので固定で持たない */
const toR18GenreConfig = (
  key: GenreKey,
  texts: Pick<
    GenreConfig,
    | "name"
    | "h1"
    | "lead"
    | "rankingTitle"
    | "classicsTitle"
    | "newTitle"
    | "aboutTitle"
    | "about"
  >,
): GenreConfig => ({
  ...GENRE_CONFIGS[key],
  ...texts,
  isSensitive: true,
  blobs: ["bg-rose-500/15", "bg-fuchsia-500/15"],
  sectionOrder: ["ranking", "tastes", "classics"],
  tastes: [],
  tastesTitle: ["人気のタグから探す", "Browse popular tags"],
  tastesLead: R18_TASTES_LEAD,
  rankingLead: R18_RANKING_LEAD,
  classicsLead: R18_CLASSICS_LEAD,
  howToTitle: ["自分でも作ってみる", "Make your own"],
  howToLead: [
    "公開されているモデルやプロンプトを参考にできます。",
    "You can learn from the models and prompts creators have shared.",
  ],
  steps: R18_STEPS,
  samplePrompts: [],
  faqs: R18_FAQS,
})

const R18_GENRE_CONFIGS: Record<GenreKey, GenreConfig> = {
  "2d": toR18GenreConfig("2d", {
    name: ["R18 2D AIイラスト", "R18 2D AI illustrations"],
    h1: ["R18 2DのAIイラスト", "R18 2D AI illustrations"],
    lead: [
      "18歳以上の方向けの、アニメ調・イラスト調の作品を集めました。今週の人気作品やタグから探せます。",
      "Anime and illustration-style works for people aged 18 and over. Explore this week's popular works and tags.",
    ],
    rankingTitle: ["今週の人気 R18 イラスト", "Popular R18 illustrations this week"],
    classicsTitle: ["これまでに人気の R18 イラスト", "All-time favorites"],
    newTitle: ["新着の R18 イラスト", "New R18 illustrations"],
    aboutTitle: ["このページについて", "About this page"],
    about: [
      [
        "投稿するときに年齢区分 R18、テイスト「イラスト」が選ばれた作品を集めています。",
        "This page collects works posted with the R18 rating and the “Illustration” taste.",
      ],
      [
        "「P」のマークが付いた作品はプロンプトが公開されています。投稿にはガイドラインとR18規約が適用されます。",
        "Works marked “P” share their prompts. All posts are subject to the guidelines and R18 terms.",
      ],
    ],
  }),
  "2.5d": toR18GenreConfig("2.5d", {
    name: ["R18 2.5D AIイラスト", "R18 2.5D AI art"],
    h1: ["R18 2.5D・セミリアルのAIイラスト", "R18 2.5D and semi-real AI art"],
    lead: [
      "18歳以上の方向けの、イラストと実写の中間にあるセミリアルの作品を集めました。今週の人気作品やタグから探せます。",
      "Semi-real works between illustration and photorealism, for people aged 18 and over. Explore this week's popular works and tags.",
    ],
    rankingTitle: ["今週の人気 R18 2.5D 作品", "Popular R18 2.5D works this week"],
    classicsTitle: ["これまでに人気の R18 2.5D 作品", "All-time favorites"],
    newTitle: ["新着の R18 2.5D 作品", "New R18 2.5D works"],
    aboutTitle: ["このページについて", "About this page"],
    about: [
      [
        "投稿するときに年齢区分 R18、テイスト「セミリアル」が選ばれた作品を集めています。",
        "This page collects works posted with the R18 rating and the “Semi-real” taste.",
      ],
      [
        "「P」のマークが付いた作品はプロンプトが公開されています。投稿にはガイドラインとR18規約が適用されます。",
        "Works marked “P” share their prompts. All posts are subject to the guidelines and R18 terms.",
      ],
    ],
  }),
  "3d": toR18GenreConfig("3d", {
    name: ["R18 AIフォト", "R18 AI photos"],
    h1: ["R18 3D・実写風のAI画像", "R18 3D and photorealistic AI images"],
    lead: [
      "18歳以上の方向けの、写真のようなAIフォトや3D調の作品を集めました。登場するのはAIが作った架空の人物です。今週の人気作品やタグから探せます。",
      "Photo-like AI images and 3D-style works for people aged 18 and over, featuring fictional AI-made people. Explore this week's popular works and tags.",
    ],
    rankingTitle: ["今週の人気 R18 AIフォト", "Popular R18 AI photos this week"],
    classicsTitle: ["これまでに人気の R18 AIフォト", "All-time favorites"],
    newTitle: ["新着の R18 AIフォト・3D作品", "New R18 AI photos and 3D works"],
    aboutTitle: ["このページについて", "About this page"],
    about: [
      [
        "投稿するときに年齢区分 R18、テイスト「リアル」が選ばれた作品を集めています。",
        "This page collects works posted with the R18 rating and the “Real” taste.",
      ],
      [
        "芸能人や実在の人物の無断使用は禁止しています。見つけた場合は作品ページから通報してください。",
        "Unauthorized use of celebrities or real people is prohibited. Please report such works from the work page.",
      ],
    ],
  }),
}

export const toGenreConfig = (key: GenreKey, isSensitive: boolean) =>
  isSensitive ? R18_GENRE_CONFIGS[key] : GENRE_CONFIGS[key]
