/**
 * 4 周年の特設ページの作品画像（2026-11-21 に公開 API から集めた全年齢の作品を目で見て選んだもの。
 * 集め方は ~/Documents/aipictors-anniv4/rich/）
 */
export type Anniversary4thGalleryWork = {
  id: string
  title: string
  userName: string
  likes: number
  thumbnail: string
  largeThumbnail?: string
}

/** 月ごとにいいねがいちばん多かった作品（タイムライン用） */
export const ANNIVERSARY_4TH_MONTHLY_HIGHLIGHTS: {
  month: string
  work: Anniversary4thGalleryWork
}[] = [
  {
    month: "2022-11",
    work: {
      id: "130",
      title: "二人だけのウェディング",
      userName: "エルウェス＠AI絵始めました",
      likes: 17,
      thumbnail:
        "https://files.aipictors.com/b5da5188-9200-4d69-902f-12fc63c1e4d6",
      largeThumbnail:
        "https://files.aipictors.com/3d792f55-8298-4240-8205-2bfb8a8ab6f4",
    },
  },
  {
    month: "2022-12",
    work: {
      id: "3630",
      title: "スタンプ案！（基本設定 & Anything編）",
      userName: "Lu:Na:Clock",
      likes: 61,
      thumbnail:
        "https://files.aipictors.com/14da6390-a400-49d4-87bf-7ea54436310b",
      largeThumbnail:
        "https://files.aipictors.com/79b94171-4acf-492b-8de2-3b390a12427f",
    },
  },
  {
    month: "2023-01",
    work: {
      id: "11470",
      title: "kawaii pop angel",
      userName: "chili",
      likes: 39,
      thumbnail:
        "https://files.aipictors.com/2e1ea8a1-665f-409f-a370-bd3d5b857e22",
      largeThumbnail:
        "https://files.aipictors.com/7de03f84-e0b5-4b5a-bb87-c3278dbea9a2",
    },
  },
  {
    month: "2023-02",
    work: {
      id: "18347",
      title: "宇宙",
      userName: "なめこ",
      likes: 230,
      thumbnail:
        "https://files.aipictors.com/271471e5-5180-40bd-a1b1-93b3ea8c14ce",
      largeThumbnail:
        "https://files.aipictors.com/7b50f7ec-07d4-449f-b91b-fec01baf7820",
    },
  },
  {
    month: "2023-03",
    work: {
      id: "22619",
      title: "いちごクッション",
      userName: "沢渡みかげ＠休止中",
      likes: 68,
      thumbnail:
        "https://files.aipictors.com/744316cd-d8ea-4868-a8f8-7ade4736db75",
      largeThumbnail:
        "https://files.aipictors.com/3d3b6163-1e2d-48c2-ba9c-418accac9dea",
    },
  },
  {
    month: "2023-04",
    work: {
      id: "35776",
      title: "ふうせん",
      userName: "沢渡みかげ＠休止中",
      likes: 173,
      thumbnail:
        "https://files.aipictors.com/638240da-ec43-4db1-ad4f-eed129657968",
      largeThumbnail:
        "https://files.aipictors.com/41581d58-d997-474b-be2b-05e220532dea",
    },
  },
  {
    month: "2023-05",
    work: {
      id: "38193",
      title: "料理がたくさん！",
      userName: "なめこ",
      likes: 143,
      thumbnail:
        "https://files.aipictors.com/efa32b07-eb95-4991-962b-7311315b8496",
      largeThumbnail:
        "https://files.aipictors.com/22a6de14-c7e7-472d-87f1-6354dd6ba2c7",
    },
  },
  {
    month: "2023-06",
    work: {
      id: "63925",
      title: "月の国",
      userName: "No.i",
      likes: 76,
      thumbnail:
        "https://files.aipictors.com/a3b1939f-249f-4099-b1a1-62c6b2c71997",
      largeThumbnail:
        "https://files.aipictors.com/808cc408-f29d-41a3-bc9c-2d9e9146ab6f",
    },
  },
  {
    month: "2023-07",
    work: {
      id: "79722",
      title: "青の鳥の残滓",
      userName: "なかじ",
      likes: 67,
      thumbnail:
        "https://files.aipictors.com/1233fa4c-fa37-4e6d-a2a8-3ab674133e2f",
      largeThumbnail:
        "https://files.aipictors.com/aa940c0a-108d-4ead-b598-f422130ac8c1",
    },
  },
  {
    month: "2023-08",
    work: {
      id: "92804",
      title: "降り注ぐ色",
      userName: "animel7316",
      likes: 111,
      thumbnail:
        "https://files.aipictors.com/fd4f86d6-83f7-4e74-a9fc-9e905c7307b7",
      largeThumbnail:
        "https://files.aipictors.com/7a3e5d04-acc5-436f-aec0-f9444de0bb86",
    },
  },
  {
    month: "2023-09",
    work: {
      id: "121158",
      title: "稲荷屋のおいなりさん、いらんかね～！",
      userName: "掬月",
      likes: 135,
      thumbnail:
        "https://files.aipictors.com/a8a5fd0e-ee6f-4eea-96e3-fd7e3b371c0e",
      largeThumbnail:
        "https://files.aipictors.com/3cf97c41-cdc4-4e72-9768-39fb7b0fcda8",
    },
  },
  {
    month: "2023-10",
    work: {
      id: "144612",
      title: "Rainbow",
      userName: "沢渡みかげ＠休止中",
      likes: 124,
      thumbnail:
        "https://files.aipictors.com/8d7fff54-c61d-46b5-bb36-2357f1994df6",
      largeThumbnail:
        "https://files.aipictors.com/f6b53917-5286-4fdf-b71c-bc599cc93844",
    },
  },
  {
    month: "2023-11",
    work: {
      id: "189022",
      title: "ロリータファッション",
      userName: "なめこ",
      likes: 186,
      thumbnail:
        "https://files.aipictors.com/6d85e105-87a9-4a9a-b230-9050d77a90aa",
      largeThumbnail:
        "https://files.aipictors.com/fabdbe52-6931-4ec3-9aea-375d80d868d4",
    },
  },
  {
    month: "2023-12",
    work: {
      id: "209751",
      title: "双剣の小精霊",
      userName: "さかいきしお",
      likes: 154,
      thumbnail:
        "https://files.aipictors.com/657b03f0-90a8-4265-83f1-4e3d4cae84df",
      largeThumbnail:
        "https://files.aipictors.com/23f00626-67e9-49c8-b297-599fe71287da",
    },
  },
  {
    month: "2024-01",
    work: {
      id: "263933",
      title: "慈愛のまなざし",
      userName: "掬月",
      likes: 175,
      thumbnail:
        "https://files.aipictors.com/97d5f46d-db41-4dc7-bab7-195eedc74b0f",
      largeThumbnail:
        "https://files.aipictors.com/651c9d81-12ed-4086-aca4-4cb0bcd5fb02",
    },
  },
  {
    month: "2024-02",
    work: {
      id: "281933",
      title: "ゆめかわレインボー",
      userName: "沢渡みかげ＠休止中",
      likes: 178,
      thumbnail:
        "https://files.aipictors.com/b402ee73-0b01-4f1a-8595-805d982bdf7b",
      largeThumbnail:
        "https://files.aipictors.com/966d3eff-984a-4477-9c75-da69a446202a",
    },
  },
  {
    month: "2024-03",
    work: {
      id: "326297",
      title: "むしろ犬歯",
      userName: "みやび",
      likes: 155,
      thumbnail:
        "https://files.aipictors.com/660c7902-9929-4193-8c67-e940a7b20be6",
      largeThumbnail:
        "https://files.aipictors.com/e8be804b-7be4-4c96-b08e-9951e502d0c6",
    },
  },
  {
    month: "2024-04",
    work: {
      id: "344040",
      title: "私の夢は、あつあつのピザをいっぱい食べること！",
      userName: "MorumoruSan｜VTuberPlus",
      likes: 141,
      thumbnail:
        "https://files.aipictors.com/967f080f-d05c-41e8-a234-c05c7ce3b61c",
      largeThumbnail:
        "https://files.aipictors.com/27f15e2a-6480-4413-ad6c-dc887e1c1137",
    },
  },
  {
    month: "2024-05",
    work: {
      id: "356999",
      title: "魔法陣って触れるって知ってた？！",
      userName: "MorumoruSan｜VTuberPlus",
      likes: 131,
      thumbnail:
        "https://files.aipictors.com/41b471fc-c004-488e-96b0-edad02481e87",
      largeThumbnail:
        "https://files.aipictors.com/e5726c06-d26f-4867-a1a5-7bba32076941",
    },
  },
  {
    month: "2024-06",
    work: {
      id: "386694",
      title: "司令官ちゃん",
      userName: "アゲアゲのからあげ",
      likes: 142,
      thumbnail:
        "https://files.aipictors.com/a64f92b5-aff9-455c-a166-2b727ac28f86",
      largeThumbnail:
        "https://files.aipictors.com/8307cdc7-4542-4b25-8d6c-d888cc168814",
    },
  },
  {
    month: "2024-07",
    work: {
      id: "424176",
      title: "「イケてるディーラー」🃏",
      userName: "猫団子🐈‍⬛🍡",
      likes: 102,
      thumbnail:
        "https://files.aipictors.com/c9bb7209-cac4-44ac-9a50-6c55cfd50575",
      largeThumbnail:
        "https://files.aipictors.com/389e30a2-d85a-408c-9764-69e919ec6910",
    },
  },
  {
    month: "2024-08",
    work: {
      id: "445888",
      title: "「ぐっすり眠る猫」💤",
      userName: "猫団子🐈‍⬛🍡",
      likes: 131,
      thumbnail:
        "https://files.aipictors.com/37d047be-cd9e-4d38-b33a-e7cb513349c7",
      largeThumbnail:
        "https://files.aipictors.com/d58dd267-e703-46f8-bd4a-175a0cba55e0",
    },
  },
  {
    month: "2024-09",
    work: {
      id: "457837",
      title: "お月見始めるよー🌕",
      userName: "JACK",
      likes: 120,
      thumbnail:
        "https://files.aipictors.com/068fd232-664d-46f3-adca-7f053d085ee3",
      largeThumbnail:
        "https://files.aipictors.com/48682b10-6b63-47ff-9b69-1d9e4990ce9f",
    },
  },
  {
    month: "2024-10",
    work: {
      id: "472973",
      title: "「それぞれの私服」👕👗",
      userName: "猫団子🐈‍⬛🍡",
      likes: 110,
      thumbnail:
        "https://files.aipictors.com/5f25e40c-0e2b-4f6b-b85f-8eed89ad2994",
      largeThumbnail:
        "https://files.aipictors.com/60aa34f8-4c65-42c5-847f-2fa87962959b",
    },
  },
  {
    month: "2024-11",
    work: {
      id: "492262",
      title: "朝のコーヒー",
      userName: "沢渡みかげ＠休止中",
      likes: 107,
      thumbnail:
        "https://files.aipictors.com/d3246bce-d7e0-4319-935a-607a0dec4835",
      largeThumbnail:
        "https://files.aipictors.com/b16ac8d9-4889-45e8-96f7-ae3399bba884",
    },
  },
  {
    month: "2024-12",
    work: {
      id: "518531",
      title: "森をお散歩ニャ♪",
      userName: "うろんうろん -uron uron-",
      likes: 100,
      thumbnail:
        "https://files.aipictors.com/3592409e-4cb2-4a7a-92aa-f71ca5612117",
      largeThumbnail:
        "https://files.aipictors.com/fd34f156-f256-4ff3-ac95-9ea2e4302ec8",
    },
  },
  {
    month: "2025-01",
    work: {
      id: "528324",
      title: "投稿開始1周年になりました！",
      userName: "うろんうろん -uron uron-",
      likes: 104,
      thumbnail:
        "https://files.aipictors.com/e9b83510-5827-456d-a980-d5aab0b34aef",
      largeThumbnail:
        "https://files.aipictors.com/e1a5273c-b693-489e-aad8-fdcf68e2e998",
    },
  },
  {
    month: "2025-02",
    work: {
      id: "544784",
      title: "「にゃぁ～ん…　なのじゃ…」🐲🐈",
      userName: "猫団子🐈‍⬛🍡",
      likes: 97,
      thumbnail:
        "https://files.aipictors.com/7c3b79e2-18dd-4c2a-8cf8-84c26d10b130",
      largeThumbnail:
        "https://files.aipictors.com/24c8574e-7d82-4a05-87e9-0ea0fd745e97",
    },
  },
  {
    month: "2025-03",
    work: {
      id: "560258",
      title: "ラビットアイスクリームなのだぁ～♪",
      userName: "うろんうろん -uron uron-",
      likes: 76,
      thumbnail:
        "https://files.aipictors.com/27164953-c3b3-4319-baa4-f566f2421bfb",
      largeThumbnail:
        "https://files.aipictors.com/510201ae-540a-4891-a640-f88dee835fb2",
    },
  },
  {
    month: "2025-04",
    work: {
      id: "586332",
      title: "マラソンニャ！（イラスト版）",
      userName: "うろんうろん -uron uron-",
      likes: 70,
      thumbnail:
        "https://files.aipictors.com/2245b6ed-bee6-4006-9eb0-766b5e983960",
      largeThumbnail:
        "https://files.aipictors.com/21e595ac-85cf-4ef1-b13a-a4984dc59e3f",
    },
  },
  {
    month: "2025-05",
    work: {
      id: "600535",
      title: "『きゅいん』ですわ！",
      userName: "五月雨",
      likes: 85,
      thumbnail:
        "https://files.aipictors.com/866c528e-55a9-4862-88d8-ca7fa21e7c55",
      largeThumbnail:
        "https://files.aipictors.com/6d692aaa-5711-4cb2-a477-08bed3219e11",
    },
  },
  {
    month: "2025-06",
    work: {
      id: "608729",
      title: "シロチュンに乗って飛びますわ！",
      userName: "五月雨",
      likes: 91,
      thumbnail:
        "https://files.aipictors.com/361b5fab-322b-439b-8a33-013873714fb8",
      largeThumbnail:
        "https://files.aipictors.com/b4918f5d-68d7-4798-b402-d2dd35abb0d7",
    },
  },
  {
    month: "2025-07",
    work: {
      id: "622842",
      title: "ネイル",
      userName: "もみ",
      likes: 79,
      thumbnail:
        "https://files.aipictors.com/4d4f82ff-da51-449d-972d-9a7afb844c02",
      largeThumbnail:
        "https://files.aipictors.com/2c76315e-7c50-4212-957d-b06dfe318b14",
    },
  },
  {
    month: "2025-08",
    work: {
      id: "639331",
      title: "花火",
      userName: "もみ",
      likes: 116,
      thumbnail:
        "https://files.aipictors.com/4700fa13-8fe3-4006-953d-d42daedf526e",
      largeThumbnail:
        "https://files.aipictors.com/25b56974-fec9-4b3c-9a02-f80b5fb2e6d6",
    },
  },
  {
    month: "2025-09",
    work: {
      id: "645074",
      title: "サスペンダー",
      userName: "もみ",
      likes: 91,
      thumbnail:
        "https://files.aipictors.com/6c1078c0-50b4-4073-8fa5-605f86d71b87",
      largeThumbnail:
        "https://files.aipictors.com/c56312af-2cef-4d43-b6e6-83976e5055ea",
    },
  },
  {
    month: "2025-10",
    work: {
      id: "658109",
      title: "カセットテープ",
      userName: "もみ",
      likes: 70,
      thumbnail:
        "https://files.aipictors.com/c77c3ac5-57cf-4296-814c-a2e91264b07e",
      largeThumbnail:
        "https://files.aipictors.com/4658d77b-28c7-45f4-9117-ccb895c72e1d",
    },
  },
  {
    month: "2025-11",
    work: {
      id: "682343",
      title: "インナーカラー",
      userName: "もみ",
      likes: 67,
      thumbnail:
        "https://files.aipictors.com/ce8d67c1-5fcb-4d70-9cfa-fff76284cf67",
      largeThumbnail:
        "https://files.aipictors.com/bb2179e1-ffbd-4781-aa70-4e23cae6c36e",
    },
  },
  {
    month: "2025-12",
    work: {
      id: "689459",
      title: "おばあちゃん、毛糸のジャージはまだですか？",
      userName: "五月雨",
      likes: 73,
      thumbnail:
        "https://files.aipictors.com/330ac7a8-b803-41a6-96a8-e8d70f47bef1",
      largeThumbnail:
        "https://files.aipictors.com/1a6d23cf-39a6-4aca-b4ce-f21b15b5f979",
    },
  },
  {
    month: "2026-01",
    work: {
      id: "694836",
      title: "生成忘れてましたわ🤤",
      userName: "五月雨",
      likes: 69,
      thumbnail:
        "https://files.aipictors.com/5653bd96-986d-4114-a19b-8ba462a05e45",
      largeThumbnail:
        "https://files.aipictors.com/dff43f07-6380-43b6-bec6-1313417d85f3",
    },
  },
  {
    month: "2026-02",
    work: {
      id: "712319",
      title: "「なんじゃ、このきんぴかなものは？」🐲",
      userName: "猫団子🐈‍⬛🍡",
      likes: 83,
      thumbnail:
        "https://files.aipictors.com/03d67717-626e-409c-afff-9770276601d7",
      largeThumbnail:
        "https://files.aipictors.com/f3fa7e52-7cf7-4b7c-9188-048e061fdd12",
    },
  },
  {
    month: "2026-03",
    work: {
      id: "720942",
      title: "折り紙",
      userName: "もみ",
      likes: 123,
      thumbnail:
        "https://files.aipictors.com/4a9f4584-76d9-4613-8077-1acfc3ecaa3e",
      largeThumbnail:
        "https://files.aipictors.com/d16308c2-b9b0-4c42-a8bf-914d686dad9a",
    },
  },
  {
    month: "2026-04",
    work: {
      id: "741101",
      title: "女性警察官",
      userName: "もみ",
      likes: 129,
      thumbnail:
        "https://files.aipictors.com/e795fa2c-46d4-4329-88a7-784d9bb792f1",
      largeThumbnail:
        "https://files.aipictors.com/06f63f3a-d795-46f9-a284-bbc029703786",
    },
  },
  {
    month: "2026-05",
    work: {
      id: "742826",
      title: "働く人",
      userName: "もみ",
      likes: 92,
      thumbnail:
        "https://files.aipictors.com/2f4933d3-9672-42b2-9ae4-5a74ce1f1a17",
      largeThumbnail:
        "https://files.aipictors.com/92370bf4-2dd5-4b52-8dd0-f7a3b368d2d4",
    },
  },
  {
    month: "2026-06",
    work: {
      id: "767601",
      title: "超ウルトラ",
      userName: "もみ",
      likes: 82,
      thumbnail:
        "https://files.aipictors.com/58972f19-e8fe-4333-9e1c-a4676bb64911",
      largeThumbnail:
        "https://files.aipictors.com/c013a793-bd98-4f30-9b62-1e23baf3745f",
    },
  },
  {
    month: "2026-07",
    work: {
      id: "772991",
      title: "洋風",
      userName: "もみ",
      likes: 82,
      thumbnail:
        "https://files.aipictors.com/23c1c719-8c8c-406c-8a62-1c5dab617f8c",
      largeThumbnail:
        "https://files.aipictors.com/6d676fd8-d77a-411f-ac0b-3f1d9b232454",
    },
  },
  {
    month: "2026-08",
    work: {
      id: "786257",
      title: "かっこいい",
      userName: "もみ",
      likes: 83,
      thumbnail:
        "https://files.aipictors.com/4201be33-e3fe-4504-a8b1-a6ff995a1c5a",
      largeThumbnail:
        "https://files.aipictors.com/4d826abb-5978-4af1-9556-7330f9cf67e3",
    },
  },
  {
    month: "2026-09",
    work: {
      id: "799483",
      title: "秋桜",
      userName: "もみ",
      likes: 82,
      thumbnail:
        "https://files.aipictors.com/8aba6a5b-efd1-45b6-9d0d-dedff50f1b39",
      largeThumbnail:
        "https://files.aipictors.com/24f18d16-6cec-43be-8122-df350e467196",
    },
  },
  {
    month: "2026-10",
    work: {
      id: "820963",
      title: "ハロウィン",
      userName: "もみ",
      likes: 86,
      thumbnail:
        "https://files.aipictors.com/21398ae0-d2a7-432f-a4f8-8e3519597fdc",
      largeThumbnail:
        "https://files.aipictors.com/fc0a886d-17a3-4924-8e61-3020a0d9f65b",
    },
  },
  {
    month: "2026-11",
    work: {
      id: "828179",
      title: "紅葉の森を歩くくま耳少女と仲間",
      userName: "もみ",
      likes: 104,
      thumbnail:
        "https://files.aipictors.com/f6885ae0-ca8a-4445-af04-84f8b1284241",
      largeThumbnail:
        "https://files.aipictors.com/c9bfe271-5730-4d92-bad8-f20dd2448126",
    },
  },
]

/** 作品の壁（ヒーローと流れる帯） */
export const ANNIVERSARY_4TH_WALL_WORKS: Anniversary4thGalleryWork[] = [
  {
    id: "186700",
    title: "おどるにゃん",
    userName: "Azuki7",
    likes: 181,
    thumbnail:
      "https://files.aipictors.com/60dea5cc-d566-41e2-b77f-324a5c0460b2",
  },
  {
    id: "182937",
    title: "氷使いアリスと弓使いアリス",
    userName: "Alicia Stuart",
    likes: 168,
    thumbnail:
      "https://files.aipictors.com/52d17e65-3572-4185-81a2-937e89856ebd",
  },
  {
    id: "273844",
    title: "パステル・プリンセス",
    userName: "掬月",
    likes: 163,
    thumbnail:
      "https://files.aipictors.com/d014c449-650c-4082-9b16-c7587ce1f49b",
  },
  {
    id: "189172",
    title: "子供達の色",
    userName: "AI錬金術士＠クラフ",
    likes: 162,
    thumbnail:
      "https://files.aipictors.com/d0cbc493-28f7-4d2c-b7ae-206961757a4a",
  },
  {
    id: "189960",
    title: "グラフィティロリィタ",
    userName: "なかじ",
    likes: 160,
    thumbnail:
      "https://files.aipictors.com/68480097-287c-4485-acfa-6b11025ca7e2",
  },
  {
    id: "281963",
    title: "ゆめかわ～",
    userName: "blue jadeite",
    likes: 159,
    thumbnail:
      "https://files.aipictors.com/65197051-d449-4525-8d9c-19f1d9aee4df",
  },
  {
    id: "284294",
    title: "数えられる羊さんもきっと夢を見る🐏🐑",
    userName: "あまりりす",
    likes: 154,
    thumbnail:
      "https://files.aipictors.com/156823b8-24e6-414a-897a-fc9d82cdba9b",
  },
  {
    id: "284550",
    title: "魔法少女プリティードリーム",
    userName: "みやび",
    likes: 154,
    thumbnail:
      "https://files.aipictors.com/249280e3-0498-4b88-a29a-231a9685af6d",
  },
  {
    id: "287831",
    title: "ゲコ～時間",
    userName: "ころりちゃん",
    likes: 146,
    thumbnail:
      "https://files.aipictors.com/6a3a26c6-0f7f-4b04-8323-6701362a1f9b",
  },
  {
    id: "185340",
    title: "ローカル線で駅弁を",
    userName: "さかいきしお",
    likes: 145,
    thumbnail:
      "https://files.aipictors.com/18953d37-6ea8-4556-b42f-8d2df59183f6",
  },
  {
    id: "283722",
    title: "ケーキと巫女さん妹ら",
    userName: "さかいきしお",
    likes: 145,
    thumbnail:
      "https://files.aipictors.com/821919fd-6a79-4007-b1ac-5dcfa3e0c1e9",
  },
  {
    id: "256296",
    title: "ワタシハ、ズット…、トモダチダヨ！",
    userName: "Crabkanicancer",
    likes: 144,
    thumbnail:
      "https://files.aipictors.com/6b9e83f9-f246-49b8-aacf-b26bacf2ca9c",
  },
  {
    id: "286606",
    title: "なきがお",
    userName: "なめこ",
    likes: 141,
    thumbnail:
      "https://files.aipictors.com/b56c5c9a-ac04-4411-892c-b1698a3f230c",
  },
  {
    id: "257098",
    title: "金星の位置",
    userName: "なかじ",
    likes: 140,
    thumbnail:
      "https://files.aipictors.com/807b2d0c-81f2-441f-835b-bd0a6aa66893",
  },
  {
    id: "249087",
    title: "異世界初戦闘",
    userName: "みやび",
    likes: 139,
    thumbnail:
      "https://files.aipictors.com/9fa0249b-a5e0-4940-b176-b9893e897e3c",
  },
  {
    id: "341183",
    title: "水心",
    userName: "なかじ",
    likes: 139,
    thumbnail:
      "https://files.aipictors.com/5ba9424e-706f-4206-9852-be84895e2521",
  },
  {
    id: "301931",
    title: "誕生日ケーキ",
    userName: "アゲアゲのからあげ",
    likes: 136,
    thumbnail:
      "https://files.aipictors.com/9032ada9-5d4e-474d-a15f-0c9cef7372d1",
  },
  {
    id: "281910",
    title: "ゆめかわぁあ",
    userName: "夢職人",
    likes: 136,
    thumbnail:
      "https://files.aipictors.com/41bb9020-6159-4762-9a20-44094b139122",
  },
  {
    id: "252677",
    title: "逆光",
    userName: "Azuki7",
    likes: 135,
    thumbnail:
      "https://files.aipictors.com/6c29c2f4-9b1f-4f73-88a0-e57b24e5f9e8",
  },
  {
    id: "346229",
    title: "ねこねこ体操",
    userName: "アゲアゲのからあげ",
    likes: 133,
    thumbnail:
      "https://files.aipictors.com/f90e9486-8ba6-4273-87b6-dd673d6b0b59",
  },
  {
    id: "252559",
    title: "魅惑のほっぺた",
    userName: "blue jadeite",
    likes: 133,
    thumbnail:
      "https://files.aipictors.com/a5a814d9-9d9f-4126-b4c3-bb516b6f1fbb",
  },
  {
    id: "258916",
    title: "勉学に励むチビ達",
    userName: "AI錬金術士＠クラフ",
    likes: 132,
    thumbnail:
      "https://files.aipictors.com/ac59afb1-66aa-4968-999c-d8e079d10638",
  },
  {
    id: "264041",
    title: "花坂",
    userName: "ころりちゃん",
    likes: 130,
    thumbnail:
      "https://files.aipictors.com/db50c8ff-00ae-48b7-9ea0-58bb0e8c678a",
  },
  {
    id: "186369",
    title: "犬の散歩",
    userName: "wanwanwan",
    likes: 130,
    thumbnail:
      "https://files.aipictors.com/0d473545-3b0d-4151-bdce-1a3926ace4e6",
  },
  {
    id: "188804",
    title: "日傘の少女",
    userName: "東雲",
    likes: 129,
    thumbnail:
      "https://files.aipictors.com/17981b60-e90c-405f-bbcb-ef40f96949e4",
  },
  {
    id: "737722",
    title: "ジャージ",
    userName: "もみ",
    likes: 129,
    thumbnail:
      "https://files.aipictors.com/2dbad766-f64d-495b-91b9-e54b89d6b7ad",
  },
  {
    id: "325141",
    title: "Kimono Racer",
    userName: "掬月",
    likes: 128,
    thumbnail:
      "https://files.aipictors.com/1e1fea0d-520c-4074-ba97-ec24625e8049",
  },
  {
    id: "290969",
    title: "チアリーダー",
    userName: "沢渡みかげ＠休止中",
    likes: 128,
    thumbnail:
      "https://files.aipictors.com/f1cbbd47-ce2e-4138-88e8-12b6c4eec7e6",
  },
  {
    id: "194069",
    title: "ふわふわロングヘアー",
    userName: "沢渡みかげ＠休止中",
    likes: 127,
    thumbnail:
      "https://files.aipictors.com/7ad7f98d-cdcf-44a4-acf1-566c8282aed6",
  },
  {
    id: "299276",
    title: "お師匠さま",
    userName: "Azuki7",
    likes: 127,
    thumbnail:
      "https://files.aipictors.com/8ef342fa-589f-4a40-b9f5-2ac93e2faa45",
  },
  {
    id: "352102",
    title: "「もるもるちゃん、コスプレしよ💕」",
    userName: "MorumoruSan｜VTuberPlus",
    likes: 126,
    thumbnail:
      "https://files.aipictors.com/69c69200-364a-42c5-a00e-6b46c1bc0ae8",
  },
  {
    id: "339237",
    title: "【生成機能】思い詰めるまでもない無数の紙束",
    userName: "なかじ",
    likes: 125,
    thumbnail:
      "https://files.aipictors.com/42a6f09c-8277-4e64-bdd5-78db0f460a79",
  },
  {
    id: "306115",
    title: "大図書館",
    userName: "なめこ",
    likes: 125,
    thumbnail:
      "https://files.aipictors.com/05a5c046-35d8-4f2a-bde7-2e5405b05eab",
  },
  {
    id: "233576",
    title: "ゆめかわ鉄道",
    userName: "ころりちゃん",
    likes: 125,
    thumbnail:
      "https://files.aipictors.com/d4bb2d41-ca5b-4639-973d-faaf86637e75",
  },
  {
    id: "212435",
    title: "魔法少女",
    userName: "なめこ",
    likes: 124,
    thumbnail:
      "https://files.aipictors.com/c260bef8-271e-4d1b-b433-513619baec6f",
  },
  {
    id: "157093",
    title: "妖精国のハロウィンショップへようこそ🧚‍♀️",
    userName: "AI錬金術士＠クラフ",
    likes: 123,
    thumbnail:
      "https://files.aipictors.com/29550206-5ab4-4fa2-a8f0-aca6cdaaad85",
  },
  {
    id: "332811",
    title: "月夜の日本刀白うさちゃん",
    userName: "うろんうろん -uron uron-",
    likes: 123,
    thumbnail:
      "https://files.aipictors.com/67a158c6-5877-47f7-8060-ace356348b3d",
  },
  {
    id: "338153",
    title: "桜ミクさん",
    userName: "みやび",
    likes: 123,
    thumbnail:
      "https://files.aipictors.com/6f3c1224-693e-4b41-bb32-49410d8b599f",
  },
  {
    id: "227306",
    title: "クリスマス・イブの奇跡",
    userName: "AI錬金術士＠クラフ",
    likes: 123,
    thumbnail:
      "https://files.aipictors.com/63af1614-cf69-41ef-a2de-dcab22bbb492",
  },
  {
    id: "346117",
    title: "午後のティータイムwith天使さま",
    userName: "モニ*☺︎♪♯",
    likes: 123,
    thumbnail:
      "https://files.aipictors.com/d87ca715-6d84-4b1b-9520-1888d8fcdd57",
  },
  {
    id: "217389",
    title: "強風でオールバック",
    userName: "アゲアゲのからあげ",
    likes: 123,
    thumbnail:
      "https://files.aipictors.com/281be373-0773-4fdc-870b-07dc9b8c9853",
  },
  {
    id: "220922",
    title: "コック対ギガント・タラバガニ　【決戦！寒海の大怪獣】",
    userName: "なかじ",
    likes: 122,
    thumbnail:
      "https://files.aipictors.com/385d27fa-bda0-4e7a-8a41-524941010adf",
  },
  {
    id: "214793",
    title: "ジャンスカ",
    userName: "Azuki7",
    likes: 122,
    thumbnail:
      "https://files.aipictors.com/1b44ace1-eb38-413f-939d-527be52d5d24",
  },
  {
    id: "234741",
    title: "辰",
    userName: "沢渡みかげ＠休止中",
    likes: 122,
    thumbnail:
      "https://files.aipictors.com/909a0321-3b5b-4c30-bfcc-6a8b67ae44cb",
  },
  {
    id: "338771",
    title: "うさぎの森",
    userName: "沢渡みかげ＠休止中",
    likes: 122,
    thumbnail:
      "https://files.aipictors.com/8a8b11db-383e-4a65-9303-329b7a095a1d",
  },
  {
    id: "373925",
    title: "夕日",
    userName: "沢渡みかげ＠休止中",
    likes: 122,
    thumbnail:
      "https://files.aipictors.com/e96be3db-1257-4b8d-9996-7a1a6142f9c3",
  },
  {
    id: "208051",
    title: "彼岸ちゃん＆此岸ちゃん",
    userName: "深川東西南北",
    likes: 121,
    thumbnail:
      "https://files.aipictors.com/6fbd63ad-9b7b-4e25-81a2-0695b75d3ce2",
  },
  {
    id: "300499",
    title: "ペンギンふれあい広場",
    userName: "沢渡みかげ＠休止中",
    likes: 121,
    thumbnail:
      "https://files.aipictors.com/8cd96472-7ff9-44a4-9315-8b0f4b52c38f",
  },
  {
    id: "352811",
    title: "ここはゲームの中？！",
    userName: "アゲアゲのからあげ",
    likes: 121,
    thumbnail:
      "https://files.aipictors.com/f331b492-eae9-4d26-b335-436a86f15ed2",
  },
  {
    id: "156683",
    title: "月のあかりと街のあかり",
    userName: "はづき蓮季",
    likes: 120,
    thumbnail:
      "https://files.aipictors.com/c761191b-b373-4a2c-95a8-3dc6f41e645d",
  },
  {
    id: "454506",
    title: "うおりゃぁぁぁぁ！",
    userName: "JACK",
    likes: 120,
    thumbnail:
      "https://files.aipictors.com/31b1b7dc-9bea-4b17-af94-e9cf2aeb12cf",
  },
  {
    id: "345439",
    title:
      "小便は済ませたか？ 神様にお祈りは？ 部屋のスミでガタガタふるえて命ごいする心の準備はＯＫ？",
    userName: "掬月",
    likes: 120,
    thumbnail:
      "https://files.aipictors.com/147f3fdf-399b-4ffb-8ab5-04fe2fed92f0",
  },
  {
    id: "308022",
    title: "空想図書館",
    userName: "ころりちゃん",
    likes: 120,
    thumbnail:
      "https://files.aipictors.com/ef06b250-57df-4937-a821-e3d8f04193bf",
  },
  {
    id: "337237",
    title: "お団子かポニーテール",
    userName: "さかいきしお",
    likes: 120,
    thumbnail:
      "https://files.aipictors.com/5b47fcff-cd1f-4e82-8bb7-a6c60881e916",
  },
  {
    id: "336513",
    title: "アゲカラちゃんハートハンド",
    userName: "アゲアゲのからあげ",
    likes: 120,
    thumbnail:
      "https://files.aipictors.com/4f482574-2dbe-4090-bd6c-f8fc1f01c3d6",
  },
  {
    id: "231510",
    title: "長靴をはいている猫",
    userName: "なかじ",
    likes: 119,
    thumbnail:
      "https://files.aipictors.com/2334dce5-ddd4-4713-bd67-00a41ba00412",
  },
  {
    id: "323167",
    title: "まじょこさん",
    userName: "Azuki7",
    likes: 119,
    thumbnail:
      "https://files.aipictors.com/d4fb789d-456a-4ddb-a3d3-e42d0f89d0e6",
  },
  {
    id: "734808",
    title: "折り紙",
    userName: "もみ",
    likes: 118,
    thumbnail:
      "https://files.aipictors.com/91296219-2ae5-4e23-a9f1-3734b21dde57",
  },
  {
    id: "179992",
    title: "ouch!!",
    userName: "もこもこ",
    likes: 118,
    thumbnail:
      "https://files.aipictors.com/b1743d92-2ac9-4ac2-b12e-0786ed243daa",
  },
  {
    id: "356831",
    title: "すずらんの魔法使い",
    userName: "あまりりす",
    likes: 117,
    thumbnail:
      "https://files.aipictors.com/767206e2-ec2d-4bec-87a4-627b86ea5cf8",
  },
  {
    id: "452332",
    title: "アツアツコロッケVS猫舌ヘタレにゃんこ",
    userName: "うろんうろん -uron uron-",
    likes: 117,
    thumbnail:
      "https://files.aipictors.com/24bfe32f-7e84-4f82-9e6a-08fab40840a5",
  },
  {
    id: "466756",
    title: "😎「何処を撃たれたいですか？」",
    userName: "猫団子🐈‍⬛🍡",
    likes: 117,
    thumbnail:
      "https://files.aipictors.com/64bb85c9-05ef-44fe-badf-cd3c15aff4a5",
  },
  {
    id: "215544",
    title: "いつまでもずっと一緒。",
    userName: "シェェェンロン",
    likes: 116,
    thumbnail:
      "https://files.aipictors.com/4476a04a-1a05-4e0c-aec3-42dc20e5e98a",
  },
  {
    id: "214857",
    title: "強風の日",
    userName: "なめこ",
    likes: 116,
    thumbnail:
      "https://files.aipictors.com/27eff7c4-262d-4b33-a4da-750c5cc4889e",
  },
  {
    id: "328935",
    title: "捕まるブタ",
    userName: "アゲアゲのからあげ",
    likes: 115,
    thumbnail:
      "https://files.aipictors.com/c9db3420-9a92-4ba0-badc-cd3f391bb23f",
  },
  {
    id: "456141",
    title: "😎「髪型をちょっと変えました💞」",
    userName: "猫団子🐈‍⬛🍡",
    likes: 115,
    thumbnail:
      "https://files.aipictors.com/7cc7fd4c-5943-4de0-8e39-f52f0beb4e27",
  },
  {
    id: "356877",
    title: "フレア(FF)・メギドラオン(ペルソナ)スタンプ風",
    userName: "Crabkanicancer",
    likes: 115,
    thumbnail:
      "https://files.aipictors.com/75aca1bd-c377-4999-9701-dbbc45674abd",
  },
  {
    id: "444130",
    title: "「初代うちの子」🕶️",
    userName: "猫団子🐈‍⬛🍡",
    likes: 114,
    thumbnail:
      "https://files.aipictors.com/18680718-5633-4ef4-a407-3807e3a4e9f4",
  },
  {
    id: "369209",
    title: "Starry Night",
    userName: "No.i",
    likes: 114,
    thumbnail:
      "https://files.aipictors.com/7d0a75c1-383b-4fc2-947e-d0ddb741ccb6",
  },
  {
    id: "434895",
    title: "お花のサブスク",
    userName: "沢渡みかげ＠休止中",
    likes: 114,
    thumbnail:
      "https://files.aipictors.com/b3ca3117-2128-4239-8558-27fbb2be4cee",
  },
  {
    id: "456794",
    title: "ミュージック　ソロライブ",
    userName: "キョー",
    likes: 113,
    thumbnail:
      "https://files.aipictors.com/5548ecb2-f4d8-4580-93ed-4db380ca32ca",
  },
  {
    id: "329924",
    title: "お部屋に愛しき彩りを",
    userName: "みやび",
    likes: 113,
    thumbnail:
      "https://files.aipictors.com/e2bef46a-007e-4383-a135-03102ff565bd",
  },
  {
    id: "356898",
    title: "サイドテール",
    userName: "沢渡みかげ＠休止中",
    likes: 113,
    thumbnail:
      "https://files.aipictors.com/8f9d15b9-f9af-4129-b310-10974bb947f3",
  },
  {
    id: "387488",
    title: "スーパーデフォルメ",
    userName: "アゲアゲのからあげ",
    likes: 113,
    thumbnail:
      "https://files.aipictors.com/e813426c-9a63-43e5-aa9d-fe07cbc2e0f3",
  },
  {
    id: "358096",
    title: "ゴミはゴミ箱へ",
    userName: "アゲアゲのからあげ",
    likes: 112,
    thumbnail:
      "https://files.aipictors.com/8264c3c3-fd58-4011-98a8-e5afaec3e39f",
  },
  {
    id: "329474",
    title: "あの日の君はもういない",
    userName: "blue jadeite",
    likes: 112,
    thumbnail:
      "https://files.aipictors.com/49062a5d-7544-4505-81c0-fa790f1f40b8",
  },
  {
    id: "359624",
    title: "ネコミミプリンセス2",
    userName: "東雲",
    likes: 112,
    thumbnail:
      "https://files.aipictors.com/a7dfff6d-dd27-4710-afb6-ada887da25ba",
  },
  {
    id: "123582",
    title: "彼岸花と和服美人",
    userName: "AI錬金術士＠クラフ",
    likes: 111,
    thumbnail:
      "https://files.aipictors.com/cc7b7edd-486c-46c6-a79b-d6ab9823a96c",
  },
  {
    id: "377642",
    title: "もこもこハイソックス",
    userName: "沢渡みかげ＠休止中",
    likes: 111,
    thumbnail:
      "https://files.aipictors.com/b1299000-ee44-4232-bae3-1fdc0f16a3d5",
  },
  {
    id: "456936",
    title: "Untitled",
    userName: "CherryBlossom",
    likes: 111,
    thumbnail:
      "https://files.aipictors.com/5cff5627-c747-40b1-957e-e70e95dc5c31",
  },
  {
    id: "368896",
    title: "バスケ",
    userName: "沢渡みかげ＠休止中",
    likes: 110,
    thumbnail:
      "https://files.aipictors.com/65f2ee90-b959-41e9-855d-8702960cc0df",
  },
  {
    id: "365307",
    title: "ギター",
    userName: "沢渡みかげ＠休止中",
    likes: 110,
    thumbnail:
      "https://files.aipictors.com/e2372d1f-d27f-4841-9e5f-1006bd4809fd",
  },
  {
    id: "330732",
    title: "カメラの前の皆さん、こんちはっ！あ！こんにちわ！",
    userName: "MorumoruSan｜VTuberPlus",
    likes: 110,
    thumbnail:
      "https://files.aipictors.com/551061fe-8e9b-4cca-8386-e81b7121ec09",
  },
  {
    id: "453665",
    title: "「昼寝の天才」🌞💤",
    userName: "猫団子🐈‍⬛🍡",
    likes: 110,
    thumbnail:
      "https://files.aipictors.com/157a88e9-4bce-4379-8056-ef8b8d9ab85f",
  },
  {
    id: "386780",
    title: "幻想の花街の夜",
    userName: "なめこ",
    likes: 109,
    thumbnail:
      "https://files.aipictors.com/6d31b388-81c1-4ffc-be89-9d988597dabb",
  },
  {
    id: "363764",
    title: "つまみぐいは作った人の特権だよね！",
    userName: "MorumoruSan｜VTuberPlus",
    likes: 109,
    thumbnail:
      "https://files.aipictors.com/e8b4f4be-4aaa-4ea6-a348-b37d989fdc08",
  },
  {
    id: "372183",
    title: "海底王国",
    userName: "あまりりす",
    likes: 109,
    thumbnail:
      "https://files.aipictors.com/11805c8a-356f-4072-8dcc-6614bf3a816d",
  },
  {
    id: "375024",
    title: "低身長＝ちびキャラ？",
    userName: "アゲアゲのからあげ",
    likes: 109,
    thumbnail:
      "https://files.aipictors.com/12858d8d-ab52-42f0-89f9-efcb58434709",
  },
  {
    id: "739747",
    title: "なつふく",
    userName: "もみ",
    likes: 109,
    thumbnail:
      "https://files.aipictors.com/b2856e5d-6a9c-47e9-9552-a54e43c21d52",
  },
  {
    id: "483135",
    title: "「リボンと謎生物」😎⁉️",
    userName: "猫団子🐈‍⬛🍡",
    likes: 109,
    thumbnail:
      "https://files.aipictors.com/a9445747-1001-48fd-843c-accd5808f899",
  },
  {
    id: "328195",
    title: "妖精さん、捕まる",
    userName: "沢渡みかげ＠休止中",
    likes: 108,
    thumbnail:
      "https://files.aipictors.com/4307f4f9-9984-47b3-a09b-743bd7d8f7e1",
  },
  {
    id: "446891",
    title: "グミパラダイス",
    userName: "JACK",
    likes: 107,
    thumbnail:
      "https://files.aipictors.com/aa6df710-89c8-4cef-b022-10e94a845b18",
  },
  {
    id: "436951",
    title: "花",
    userName: "なめこ",
    likes: 107,
    thumbnail:
      "https://files.aipictors.com/057017fc-40d6-4962-8ee3-72271a51e393",
  },
  {
    id: "382064",
    title: "ポップなハイソックスJKちゃん",
    userName: "アゲアゲのからあげ",
    likes: 107,
    thumbnail:
      "https://files.aipictors.com/5b14a32f-7858-4578-b5e6-7e657cc039b3",
  },
  {
    id: "367493",
    title: "グラフィティ・ボール",
    userName: "なかじ",
    likes: 107,
    thumbnail:
      "https://files.aipictors.com/2d710bf5-1c2a-443a-8455-91ca5ddbfd0d",
  },
  {
    id: "466889",
    title: "Untitled",
    userName: "CherryBlossom",
    likes: 107,
    thumbnail:
      "https://files.aipictors.com/85220205-44fb-4d48-840c-085224c41e0d",
  },
  {
    id: "362048",
    title: "王宮の花園",
    userName: "みやび",
    likes: 106,
    thumbnail:
      "https://files.aipictors.com/4e021477-9289-49b8-9e62-69e2db1b99af",
  },
  {
    id: "437162",
    title: "うちの黒猫",
    userName: "沢渡みかげ＠休止中",
    likes: 106,
    thumbnail:
      "https://files.aipictors.com/01431b85-8221-46e5-9fe2-27d8f814e339",
  },
  {
    id: "399620",
    title: "お抹茶をどうぞ",
    userName: "沢渡みかげ＠休止中",
    likes: 106,
    thumbnail:
      "https://files.aipictors.com/8ecb2bf6-cb62-4048-a804-9d34daa19dbf",
  },
  {
    id: "729917",
    title: "入学式",
    userName: "もみ",
    likes: 106,
    thumbnail:
      "https://files.aipictors.com/cd95364b-4851-44a5-bc97-6ddfa519a8d4",
  },
  {
    id: "506881",
    title: "🐈‍⬛「今宵は宴NYA！」",
    userName: "猫団子🐈‍⬛🍡",
    likes: 105,
    thumbnail:
      "https://files.aipictors.com/5357f58e-0b46-409b-990a-ec954b68aaad",
  },
  {
    id: "487587",
    title: "「傘専門マガジン」☂️📚",
    userName: "猫団子🐈‍⬛🍡",
    likes: 105,
    thumbnail:
      "https://files.aipictors.com/3e0af88c-ed29-455b-8887-e78018054c7f",
  },
  {
    id: "382000",
    title: "ハイソックスメイドさん",
    userName: "JACK",
    likes: 105,
    thumbnail:
      "https://files.aipictors.com/2e1f49c7-9ef1-46cc-82ca-9f1f0b364ddd",
  },
  {
    id: "723727",
    title: "？？？「先輩！お久し振りッス！！」",
    userName: "猫団子🐈‍⬛🍡",
    likes: 105,
    thumbnail:
      "https://files.aipictors.com/2e8e5319-4426-47cf-bcfc-5a22bc01c4c5",
  },
  {
    id: "91001",
    title: "Tokyo Rainy Night",
    userName: "はづき蓮季",
    likes: 105,
    thumbnail:
      "https://files.aipictors.com/ad7d7d01-c89e-4b43-8f9a-ae8b8468fdb9",
  },
  {
    id: "364399",
    title: "タンクトップ女子",
    userName: "なめこ",
    likes: 105,
    thumbnail:
      "https://files.aipictors.com/a0b4274a-22ea-4ae5-a2af-2ba8bb43e40c",
  },
  {
    id: "470337",
    title: "休日の出会い",
    userName: "沢渡みかげ＠休止中",
    likes: 104,
    thumbnail:
      "https://files.aipictors.com/1c466296-5eee-4288-8446-4887fdad2d80",
  },
  {
    id: "387604",
    title: "どっちが本物？",
    userName: "さかいきしお",
    likes: 104,
    thumbnail:
      "https://files.aipictors.com/39f21a84-3a4f-4ffc-b6b0-b2ede94df376",
  },
  {
    id: "130772",
    title: "にゃー！",
    userName: "はづき蓮季",
    likes: 103,
    thumbnail:
      "https://files.aipictors.com/6e2bf18b-dfb5-4431-a173-7721a87dda29",
  },
  {
    id: "397580",
    title: "よく見ると…",
    userName: "アゲアゲのからあげ",
    likes: 103,
    thumbnail:
      "https://files.aipictors.com/cb666ef2-7aec-496b-a3a8-3fdf6df36ce7",
  },
  {
    id: "386683",
    title: "傘",
    userName: "沢渡みかげ＠休止中",
    likes: 103,
    thumbnail:
      "https://files.aipictors.com/a849b3a6-fc49-4fa4-ad3f-c2cc1e41749d",
  },
  {
    id: "477959",
    title: "超獣合体！クマうさ参上！",
    userName: "うろんうろん -uron uron-",
    likes: 103,
    thumbnail:
      "https://files.aipictors.com/f58cdf87-12cc-460f-9702-d18dc54d6fc6",
  },
  {
    id: "526934",
    title: "🎍「謹賀新年」🎍",
    userName: "猫団子🐈‍⬛🍡",
    likes: 102,
    thumbnail:
      "https://files.aipictors.com/6c01b0b5-310f-43c4-8e0d-a7dd0a218acb",
  },
  {
    id: "827660",
    title: "花園に佇む黒髪の花妖精",
    userName: "Rhinn",
    likes: 102,
    thumbnail:
      "https://files.aipictors.com/4fabd3dc-1bfc-4ef1-b8e7-f418ee302710",
  },
  {
    id: "423005",
    title: "イチゴのイヤリング🍓",
    userName: "JACK",
    likes: 102,
    thumbnail:
      "https://files.aipictors.com/3abc3cd4-45d7-41ad-b328-3ad666b12a2b",
  },
  {
    id: "159065",
    title: "フライドポテトだいすき",
    userName: "はづき蓮季",
    likes: 102,
    thumbnail:
      "https://files.aipictors.com/77da98fb-64d1-448d-acfa-4159ada4e139",
  },
  {
    id: "384184",
    title: "手ツインテして～",
    userName: "沢渡みかげ＠休止中",
    likes: 102,
    thumbnail:
      "https://files.aipictors.com/f55263e3-0e63-4445-a552-6ba232d83707",
  },
  {
    id: "404124",
    title: "アリスとチェシャ猫",
    userName: "沢渡みかげ＠休止中",
    likes: 101,
    thumbnail:
      "https://files.aipictors.com/b1e5f11d-5f23-4def-baa8-2ccedbafc88f",
  },
  {
    id: "404663",
    title: "不思議の国のアリス",
    userName: "なめこ",
    likes: 101,
    thumbnail:
      "https://files.aipictors.com/fecc2422-326f-4b9f-8cac-bde8e52ccaf1",
  },
  {
    id: "731037",
    title: "ねこまん",
    userName: "もみ",
    likes: 101,
    thumbnail:
      "https://files.aipictors.com/19da4ab2-11c7-4992-9eff-e86bf40c2b14",
  },
  {
    id: "828702",
    title: "白薔薇の魔王様",
    userName: "みやび",
    likes: 101,
    thumbnail:
      "https://files.aipictors.com/b1820356-902f-4850-8f6d-36dcb6865caa",
  },
  {
    id: "409535",
    title: "七夕の夜",
    userName: "キョー",
    likes: 101,
    thumbnail:
      "https://files.aipictors.com/fd093392-38ad-4d45-8455-562e17570aaf",
  },
  {
    id: "723322",
    title: "ホワイトデー",
    userName: "もみ",
    likes: 100,
    thumbnail:
      "https://files.aipictors.com/298dd1df-8893-4a7b-a8d9-7eb1b9a0bddc",
  },
  {
    id: "385400",
    title: "音",
    userName: "夢職人",
    likes: 100,
    thumbnail:
      "https://files.aipictors.com/ee304f9b-eef4-4fb2-bf43-e410e4cde75e",
  },
  {
    id: "163782",
    title: "抱きまックマ",
    userName: "なかじ",
    likes: 100,
    thumbnail:
      "https://files.aipictors.com/3b81afd9-e86e-44fe-adc1-78b45b0d54c7",
  },
  {
    id: "404913",
    title: "不思議の国のアリス",
    userName: "JACK",
    likes: 99,
    thumbnail:
      "https://files.aipictors.com/574a9758-b54c-4afb-b1fe-f9fef1a12ab6",
  },
  {
    id: "396567",
    title: "焼きマシュマロ♪",
    userName: "沢渡みかげ＠休止中",
    likes: 99,
    thumbnail:
      "https://files.aipictors.com/34019573-9c66-4022-8c25-d5e924ee9eea",
  },
  {
    id: "508998",
    title: "白バラの髪飾り",
    userName: "沢渡みかげ＠休止中",
    likes: 99,
    thumbnail:
      "https://files.aipictors.com/3e220ab6-06c7-460a-8fb9-cebf9672f5dd",
  },
  {
    id: "531945",
    title: "記念撮影",
    userName: "沢渡みかげ＠休止中",
    likes: 99,
    thumbnail:
      "https://files.aipictors.com/f5653680-12dc-47ff-846a-46d82c2003b3",
  },
  {
    id: "726017",
    title: "鎖骨",
    userName: "もみ",
    likes: 98,
    thumbnail:
      "https://files.aipictors.com/d8ec9169-6f60-4abf-a24d-bb746b594f2d",
  },
  {
    id: "830905",
    title: "学生",
    userName: "もみ",
    likes: 98,
    thumbnail:
      "https://files.aipictors.com/3e9a6388-58c4-44b9-bb72-e49bedfe1eb1",
  },
  {
    id: "407475",
    title: "アリスと白うさぎ",
    userName: "あまりりす",
    likes: 97,
    thumbnail:
      "https://files.aipictors.com/a2bde9cb-89eb-4250-b54e-5793d679774a",
  },
  {
    id: "157530",
    title: "一緒に食べませんか",
    userName: "のねぬになな",
    likes: 97,
    thumbnail:
      "https://files.aipictors.com/eae3970e-8e3c-49d8-884f-c3630b3a9f17",
  },
  {
    id: "417973",
    title: "木の実いっぱいありがと☆",
    userName: "沢渡みかげ＠休止中",
    likes: 97,
    thumbnail:
      "https://files.aipictors.com/d4c5e881-4e46-43c0-913d-cb40590138f7",
  },
  {
    id: "87823",
    title: "無道の悦",
    userName: "なかじ",
    likes: 97,
    thumbnail:
      "https://files.aipictors.com/28ff18d7-9d3b-4e54-8544-f025dd0ce95a",
  },
  {
    id: "532398",
    title: "カレーライス",
    userName: "沢渡みかげ＠休止中",
    likes: 97,
    thumbnail:
      "https://files.aipictors.com/bf9855b2-1c9a-4bb6-bd4d-d4edac025985",
  },
  {
    id: "435107",
    title: "「メイクアップ」💄🎨",
    userName: "猫団子🐈‍⬛🍡",
    likes: 97,
    thumbnail:
      "https://files.aipictors.com/08672cae-802f-457a-90cd-8f719feedaab",
  },
  {
    id: "402165",
    title: "😼「書類は出来ましたか？」",
    userName: "猫団子🐈‍⬛🍡",
    likes: 97,
    thumbnail:
      "https://files.aipictors.com/da1232f8-32d2-4e11-8942-81c5e07a12ab",
  },
  {
    id: "505110",
    title: "雪月花",
    userName: "JACK",
    likes: 96,
    thumbnail:
      "https://files.aipictors.com/7aeca210-fc97-4828-99c1-1ed92140c156",
  },
  {
    id: "421604",
    title: "水族館",
    userName: "沢渡みかげ＠休止中",
    likes: 96,
    thumbnail:
      "https://files.aipictors.com/47ae2304-8b23-40f7-b494-25be1344510e",
  },
  {
    id: "530436",
    title: "😎「お二人共準備できましたかぁ～💖」",
    userName: "猫団子🐈‍⬛🍡",
    likes: 96,
    thumbnail:
      "https://files.aipictors.com/273e9c6f-c77f-49ea-92f2-6602241cfa9a",
  },
  {
    id: "120706",
    title: "いなり",
    userName: "アゲアゲのからあげ",
    likes: 96,
    thumbnail:
      "https://files.aipictors.com/973f2215-b1ff-4f00-86ec-5e749d5928d6",
  },
  {
    id: "394596",
    title: "二刀流",
    userName: "ころりちゃん",
    likes: 96,
    thumbnail:
      "https://files.aipictors.com/ddf8db78-ba0e-4d0a-b10e-57a5fec0b39a",
  },
  {
    id: "400779",
    title: "星魔法の使い手",
    userName: "なかじ",
    likes: 96,
    thumbnail:
      "https://files.aipictors.com/aa45cd2b-41d2-44be-9b05-ba14d16a8342",
  },
]

/** 年ごとの人気作品の続き（上位 8 作品の後に並べる。1 人 1 作品） */
export const ANNIVERSARY_4TH_YEARLY_MORE_WORKS: {
  year: number
  works: Anniversary4thGalleryWork[]
}[] = [
  {
    year: 2022,
    works: [
      {
        id: "3562",
        title: "スタンプ研究",
        userName: "chili",
        likes: 35,
        thumbnail:
          "https://files.aipictors.com/f5a4c7bf-7115-4b1e-9fdf-86ec77a4ff26",
      },
      {
        id: "3445",
        title: "花の髪飾り",
        userName: "水色群青",
        likes: 26,
        thumbnail:
          "https://files.aipictors.com/313e60ac-b711-4cd8-9477-f60846b21582",
      },
      {
        id: "2495",
        title: "わたしのほっぺ触りたいの？",
        userName: "makomi",
        likes: 26,
        thumbnail:
          "https://files.aipictors.com/040e4f5f-e0e0-4710-8cf9-d16d37699632",
      },
      {
        id: "1031",
        title: "かわいい",
        userName: "Lunia",
        likes: 25,
        thumbnail:
          "https://files.aipictors.com/c0732f2d-6428-41c0-b393-cd98a363ff69",
      },
      {
        id: "1877",
        title: "快晴の下フレダちゃん",
        userName: "korocon",
        likes: 24,
        thumbnail:
          "https://files.aipictors.com/73487ded-9eda-4e59-8ccd-42030640401d",
      },
      {
        id: "1823",
        title: "金髪少女の超高解像度テスト その1",
        userName: "zzz AIお絵描き",
        likes: 24,
        thumbnail:
          "https://files.aipictors.com/42203dd6-4f3d-4c18-8fd5-188ce675cb72",
      },
      {
        id: "2368",
        title: "ちっちゃなネズミのお姫様",
        userName: "でんでん",
        likes: 24,
        thumbnail:
          "https://files.aipictors.com/e1cf31ee-0c6c-453b-9f36-292726798189",
      },
      {
        id: "4889",
        title: "親友",
        userName: "blue.pen5805",
        likes: 23,
        thumbnail:
          "https://files.aipictors.com/dbb8d407-f9ca-45b7-8508-185fcf5e133c",
      },
      {
        id: "4881",
        title: "🐹ガジ…",
        userName: "佐藤91号",
        likes: 23,
        thumbnail:
          "https://files.aipictors.com/bff6fc9e-baea-498a-a991-109d156e0bc4",
      },
      {
        id: "2672",
        title: "茂みにお住まいのドライアドさん",
        userName: "なかじ",
        likes: 23,
        thumbnail:
          "https://files.aipictors.com/c318dad0-e0f3-437c-ad3b-e64a595dbe9a",
      },
      {
        id: "2185",
        title: "いい夢見せて！夢子ちゃん💕",
        userName: "shirotaka",
        likes: 23,
        thumbnail:
          "https://files.aipictors.com/9fea51c7-f6ba-4748-81f8-98facfdfe11e",
      },
      {
        id: "2497",
        title: "ほっぺ  x  ほっぺ",
        userName: "京すけ",
        likes: 22,
        thumbnail:
          "https://files.aipictors.com/270d007c-057c-4bfe-8bcc-4e27fc551cfd",
      },
      {
        id: "2697",
        title: "あどけない若葉",
        userName: "ライ / rais corr.",
        likes: 22,
        thumbnail:
          "https://files.aipictors.com/2401b747-2d43-4fc6-ad49-528fc3e7572c",
      },
      {
        id: "130",
        title: "二人だけのウェディング",
        userName: "エルウェス＠AI絵始めました",
        likes: 17,
        thumbnail:
          "https://files.aipictors.com/b5da5188-9200-4d69-902f-12fc63c1e4d6",
      },
      {
        id: "350",
        title: "私の雷、食らってみる？",
        userName: "ミルクコーヒー",
        likes: 15,
        thumbnail:
          "https://files.aipictors.com/366a573a-4fca-4911-a137-08c6bc51b4c1",
      },
      {
        id: "41",
        title: "和服姿でこんにちは。",
        userName: "雪だるま",
        likes: 12,
        thumbnail:
          "https://files.aipictors.com/a2bf0c66-c9db-4bf9-8adb-551c8fb623e8",
      },
      {
        id: "97",
        title: "Sci-fi girl",
        userName: "工面ボード",
        likes: 12,
        thumbnail:
          "https://files.aipictors.com/12a64736-9f12-49cf-b1bf-44f2ca98378d",
      },
    ],
  },
  {
    year: 2023,
    works: [
      {
        id: "189022",
        title: "ロリータファッション",
        userName: "なめこ",
        likes: 186,
        thumbnail:
          "https://files.aipictors.com/6d85e105-87a9-4a9a-b230-9050d77a90aa",
      },
      {
        id: "35776",
        title: "ふうせん",
        userName: "沢渡みかげ＠休止中",
        likes: 173,
        thumbnail:
          "https://files.aipictors.com/638240da-ec43-4db1-ad4f-eed129657968",
      },
      {
        id: "209751",
        title: "双剣の小精霊",
        userName: "さかいきしお",
        likes: 154,
        thumbnail:
          "https://files.aipictors.com/657b03f0-90a8-4265-83f1-4e3d4cae84df",
      },
      {
        id: "121158",
        title: "稲荷屋のおいなりさん、いらんかね～！",
        userName: "掬月",
        likes: 135,
        thumbnail:
          "https://files.aipictors.com/a8a5fd0e-ee6f-4eea-96e3-fd7e3b371c0e",
      },
      {
        id: "186369",
        title: "犬の散歩",
        userName: "wanwanwan",
        likes: 130,
        thumbnail:
          "https://files.aipictors.com/0d473545-3b0d-4151-bdce-1a3926ace4e6",
      },
      {
        id: "188804",
        title: "日傘の少女",
        userName: "東雲",
        likes: 129,
        thumbnail:
          "https://files.aipictors.com/17981b60-e90c-405f-bbcb-ef40f96949e4",
      },
      {
        id: "233576",
        title: "ゆめかわ鉄道",
        userName: "ころりちゃん",
        likes: 125,
        thumbnail:
          "https://files.aipictors.com/d4bb2d41-ca5b-4639-973d-faaf86637e75",
      },
      {
        id: "157093",
        title: "妖精国のハロウィンショップへようこそ🧚‍♀️",
        userName: "AI錬金術士＠クラフ",
        likes: 123,
        thumbnail:
          "https://files.aipictors.com/29550206-5ab4-4fa2-a8f0-aca6cdaaad85",
      },
      {
        id: "217389",
        title: "強風でオールバック",
        userName: "アゲアゲのからあげ",
        likes: 123,
        thumbnail:
          "https://files.aipictors.com/281be373-0773-4fdc-870b-07dc9b8c9853",
      },
      {
        id: "220922",
        title: "コック対ギガント・タラバガニ　【決戦！寒海の大怪獣】",
        userName: "なかじ",
        likes: 122,
        thumbnail:
          "https://files.aipictors.com/385d27fa-bda0-4e7a-8a41-524941010adf",
      },
      {
        id: "214793",
        title: "ジャンスカ",
        userName: "Azuki7",
        likes: 122,
        thumbnail:
          "https://files.aipictors.com/1b44ace1-eb38-413f-939d-527be52d5d24",
      },
      {
        id: "208051",
        title: "彼岸ちゃん＆此岸ちゃん",
        userName: "深川東西南北",
        likes: 121,
        thumbnail:
          "https://files.aipictors.com/6fbd63ad-9b7b-4e25-81a2-0695b75d3ce2",
      },
      {
        id: "156683",
        title: "月のあかりと街のあかり",
        userName: "はづき蓮季",
        likes: 120,
        thumbnail:
          "https://files.aipictors.com/c761191b-b373-4a2c-95a8-3dc6f41e645d",
      },
      {
        id: "179992",
        title: "ouch!!",
        userName: "もこもこ",
        likes: 118,
        thumbnail:
          "https://files.aipictors.com/b1743d92-2ac9-4ac2-b12e-0786ed243daa",
      },
      {
        id: "215544",
        title: "いつまでもずっと一緒。",
        userName: "シェェェンロン",
        likes: 116,
        thumbnail:
          "https://files.aipictors.com/4476a04a-1a05-4e0c-aec3-42dc20e5e98a",
      },
      {
        id: "92804",
        title: "降り注ぐ色",
        userName: "animel7316",
        likes: 111,
        thumbnail:
          "https://files.aipictors.com/fd4f86d6-83f7-4e74-a9fc-9e905c7307b7",
      },
      {
        id: "157530",
        title: "一緒に食べませんか",
        userName: "のねぬになな",
        likes: 97,
        thumbnail:
          "https://files.aipictors.com/eae3970e-8e3c-49d8-884f-c3630b3a9f17",
      },
      {
        id: "36733",
        title: "旅に出るのでGWはお題投稿お休みします",
        userName: "ぬかづけ",
        likes: 93,
        thumbnail:
          "https://files.aipictors.com/76cf3409-6d71-4252-be10-5005cd19eef1",
      },
      {
        id: "132423",
        title: "パソコン教室",
        userName: "なごみ",
        likes: 91,
        thumbnail:
          "https://files.aipictors.com/8cef596f-7b28-4423-8a00-8e66f45f0bf3",
      },
      {
        id: "115704",
        title: "猫に埋まる",
        userName: "STIS",
        likes: 90,
        thumbnail:
          "https://files.aipictors.com/b27e8239-0a27-4228-a20d-99c2731b45f5",
      },
      {
        id: "63925",
        title: "月の国",
        userName: "No.i",
        likes: 76,
        thumbnail:
          "https://files.aipictors.com/a3b1939f-249f-4099-b1a1-62c6b2c71997",
      },
      {
        id: "62906",
        title: "紫陽花と制服少女",
        userName: "Stella",
        likes: 67,
        thumbnail:
          "https://files.aipictors.com/cf880b4d-ea4d-45fa-beb1-c2bbcb481ba4",
      },
      {
        id: "65390",
        title: "水の都",
        userName: "しらたま🍡@AIイラスト",
        likes: 65,
        thumbnail:
          "https://files.aipictors.com/04981284-0c62-4ebc-aa7d-3331dab49df6",
      },
      {
        id: "13171",
        title: "スキーウェア特集",
        userName: "Lu:Na:Clock",
        likes: 65,
        thumbnail:
          "https://files.aipictors.com/271816a8-b4b3-4035-afa2-e20a29845aec",
      },
    ],
  },
  {
    year: 2024,
    works: [
      {
        id: "273844",
        title: "パステル・プリンセス",
        userName: "掬月",
        likes: 163,
        thumbnail:
          "https://files.aipictors.com/d014c449-650c-4082-9b16-c7587ce1f49b",
      },
      {
        id: "281963",
        title: "ゆめかわ～",
        userName: "blue jadeite",
        likes: 159,
        thumbnail:
          "https://files.aipictors.com/65197051-d449-4525-8d9c-19f1d9aee4df",
      },
      {
        id: "326297",
        title: "むしろ犬歯",
        userName: "みやび",
        likes: 155,
        thumbnail:
          "https://files.aipictors.com/660c7902-9929-4193-8c67-e940a7b20be6",
      },
      {
        id: "256296",
        title: "ワタシハ、ズット…、トモダチダヨ！",
        userName: "Crabkanicancer",
        likes: 144,
        thumbnail:
          "https://files.aipictors.com/6b9e83f9-f246-49b8-aacf-b26bacf2ca9c",
      },
      {
        id: "386694",
        title: "司令官ちゃん",
        userName: "アゲアゲのからあげ",
        likes: 142,
        thumbnail:
          "https://files.aipictors.com/a64f92b5-aff9-455c-a166-2b727ac28f86",
      },
      {
        id: "286606",
        title: "なきがお",
        userName: "なめこ",
        likes: 141,
        thumbnail:
          "https://files.aipictors.com/b56c5c9a-ac04-4411-892c-b1698a3f230c",
      },
      {
        id: "344040",
        title: "私の夢は、あつあつのピザをいっぱい食べること！",
        userName: "MorumoruSan｜VTuberPlus",
        likes: 141,
        thumbnail:
          "https://files.aipictors.com/967f080f-d05c-41e8-a234-c05c7ce3b61c",
      },
      {
        id: "257098",
        title: "金星の位置",
        userName: "なかじ",
        likes: 140,
        thumbnail:
          "https://files.aipictors.com/807b2d0c-81f2-441f-835b-bd0a6aa66893",
      },
      {
        id: "281910",
        title: "ゆめかわぁあ",
        userName: "夢職人",
        likes: 136,
        thumbnail:
          "https://files.aipictors.com/41bb9020-6159-4762-9a20-44094b139122",
      },
      {
        id: "252677",
        title: "逆光",
        userName: "Azuki7",
        likes: 135,
        thumbnail:
          "https://files.aipictors.com/6c29c2f4-9b1f-4f73-88a0-e57b24e5f9e8",
      },
      {
        id: "258916",
        title: "勉学に励むチビ達",
        userName: "AI錬金術士＠クラフ",
        likes: 132,
        thumbnail:
          "https://files.aipictors.com/ac59afb1-66aa-4968-999c-d8e079d10638",
      },
      {
        id: "445888",
        title: "「ぐっすり眠る猫」💤",
        userName: "猫団子🐈‍⬛🍡",
        likes: 131,
        thumbnail:
          "https://files.aipictors.com/37d047be-cd9e-4d38-b33a-e7cb513349c7",
      },
      {
        id: "264041",
        title: "花坂",
        userName: "ころりちゃん",
        likes: 130,
        thumbnail:
          "https://files.aipictors.com/db50c8ff-00ae-48b7-9ea0-58bb0e8c678a",
      },
      {
        id: "290969",
        title: "チアリーダー",
        userName: "沢渡みかげ＠休止中",
        likes: 128,
        thumbnail:
          "https://files.aipictors.com/f1cbbd47-ce2e-4138-88e8-12b6c4eec7e6",
      },
      {
        id: "332811",
        title: "月夜の日本刀白うさちゃん",
        userName: "うろんうろん -uron uron-",
        likes: 123,
        thumbnail:
          "https://files.aipictors.com/67a158c6-5877-47f7-8060-ace356348b3d",
      },
      {
        id: "346117",
        title: "午後のティータイムwith天使さま",
        userName: "モニ*☺︎♪♯",
        likes: 123,
        thumbnail:
          "https://files.aipictors.com/d87ca715-6d84-4b1b-9520-1888d8fcdd57",
      },
      {
        id: "454506",
        title: "うおりゃぁぁぁぁ！",
        userName: "JACK",
        likes: 120,
        thumbnail:
          "https://files.aipictors.com/31b1b7dc-9bea-4b17-af94-e9cf2aeb12cf",
      },
      {
        id: "337237",
        title: "お団子かポニーテール",
        userName: "さかいきしお",
        likes: 120,
        thumbnail:
          "https://files.aipictors.com/5b47fcff-cd1f-4e82-8bb7-a6c60881e916",
      },
      {
        id: "356831",
        title: "すずらんの魔法使い",
        userName: "あまりりす",
        likes: 117,
        thumbnail:
          "https://files.aipictors.com/767206e2-ec2d-4bec-87a4-627b86ea5cf8",
      },
      {
        id: "369209",
        title: "Starry Night",
        userName: "No.i",
        likes: 114,
        thumbnail:
          "https://files.aipictors.com/7d0a75c1-383b-4fc2-947e-d0ddb741ccb6",
      },
      {
        id: "456794",
        title: "ミュージック　ソロライブ",
        userName: "キョー",
        likes: 113,
        thumbnail:
          "https://files.aipictors.com/5548ecb2-f4d8-4580-93ed-4db380ca32ca",
      },
      {
        id: "359624",
        title: "ネコミミプリンセス2",
        userName: "東雲",
        likes: 112,
        thumbnail:
          "https://files.aipictors.com/a7dfff6d-dd27-4710-afb6-ada887da25ba",
      },
      {
        id: "456936",
        title: "Untitled",
        userName: "CherryBlossom",
        likes: 111,
        thumbnail:
          "https://files.aipictors.com/5cff5627-c747-40b1-957e-e70e95dc5c31",
      },
    ],
  },
  {
    year: 2025,
    works: [
      {
        id: "639331",
        title: "花火",
        userName: "もみ",
        likes: 116,
        thumbnail:
          "https://files.aipictors.com/4700fa13-8fe3-4006-953d-d42daedf526e",
      },
      {
        id: "526934",
        title: "🎍「謹賀新年」🎍",
        userName: "猫団子🐈‍⬛🍡",
        likes: 102,
        thumbnail:
          "https://files.aipictors.com/6c01b0b5-310f-43c4-8e0d-a7dd0a218acb",
      },
      {
        id: "532398",
        title: "カレーライス",
        userName: "沢渡みかげ＠休止中",
        likes: 97,
        thumbnail:
          "https://files.aipictors.com/bf9855b2-1c9a-4bb6-bd4d-d4edac025985",
      },
      {
        id: "608729",
        title: "シロチュンに乗って飛びますわ！",
        userName: "五月雨",
        likes: 91,
        thumbnail:
          "https://files.aipictors.com/361b5fab-322b-439b-8a33-013873714fb8",
      },
      {
        id: "551224",
        title: "魔法使い",
        userName: "キョー(2代目)",
        likes: 85,
        thumbnail:
          "https://files.aipictors.com/55a4971e-d847-471d-8b6a-4f0a5cd15c9e",
      },
      {
        id: "538463",
        title: "黄色だからレモンを食べよ～♪",
        userName: "うろんうろん -uron uron-",
        likes: 84,
        thumbnail:
          "https://files.aipictors.com/a6d348c7-b29f-4cbe-a692-44ab6642349b",
      },
      {
        id: "646661",
        title: "Untitled",
        userName: "CherryBlossom",
        likes: 78,
        thumbnail:
          "https://files.aipictors.com/c7a9f953-d8be-4df0-9ca5-846b82937d93",
      },
      {
        id: "573859",
        title: "(2枚)　「良かった！もう会えないかと思っちゃいました」",
        userName: "Jutaro009",
        likes: 68,
        thumbnail:
          "https://files.aipictors.com/58517b8a-6981-43b2-819e-1f69b29c4983",
      },
      {
        id: "582142",
        title: "メイド喫茶へようこそ～♪",
        userName: "みやび",
        likes: 66,
        thumbnail:
          "https://files.aipictors.com/de9771cc-98d6-4ede-a956-ea4df082d877",
      },
    ],
  },
  {
    year: 2026,
    works: [
      {
        id: "741101",
        title: "女性警察官",
        userName: "もみ",
        likes: 129,
        thumbnail:
          "https://files.aipictors.com/e795fa2c-46d4-4329-88a7-784d9bb792f1",
      },
      {
        id: "723727",
        title: "？？？「先輩！お久し振りッス！！」",
        userName: "猫団子🐈‍⬛🍡",
        likes: 105,
        thumbnail:
          "https://files.aipictors.com/2e8e5319-4426-47cf-bcfc-5a22bc01c4c5",
      },
      {
        id: "830901",
        title: "走れぴくたーちゃん！",
        userName: "みやび",
        likes: 93,
        thumbnail:
          "https://files.aipictors.com/49fcda05-c52e-494a-a332-f8e2b3d501dd",
      },
      {
        id: "829993",
        title: "最高におバカな生き物",
        userName: "岩顎",
        likes: 89,
        thumbnail:
          "https://files.aipictors.com/a5642aed-3b7a-415d-8054-ef16da0db811",
      },
      {
        id: "831198",
        title: "社長で小学生",
        userName: "TORIS-GARINO",
        likes: 87,
        thumbnail:
          "https://files.aipictors.com/a34790a9-7526-4692-91dc-a1b4f8d525e5",
      },
      {
        id: "821794",
        title: "兎派ミサ参加特典🥕ニャ♪",
        userName: "うろんうろん -uron uron-",
        likes: 82,
        thumbnail:
          "https://files.aipictors.com/aed5e549-0cf5-436e-9d03-f18efc5300ef",
      },
      {
        id: "768974",
        title:
          "超生命機神オルフェウス『放課後、ひとつの甘さを分け合って………。』",
        userName: "Rin",
        likes: 70,
        thumbnail:
          "https://files.aipictors.com/245fbc63-cea0-433f-949d-d79557f3262b",
      },
      {
        id: "694836",
        title: "生成忘れてましたわ🤤",
        userName: "五月雨",
        likes: 69,
        thumbnail:
          "https://files.aipictors.com/5653bd96-986d-4114-a19b-8ba462a05e45",
      },
      {
        id: "791082",
        title: "最初の師匠は、お母さん",
        userName: "琴美ちゃん",
        likes: 68,
        thumbnail:
          "https://files.aipictors.com/890e2361-74b3-438e-9250-28a6284d45f3",
      },
      {
        id: "796320",
        title: "お題「生クリーム」",
        userName: "なおたそ",
        likes: 68,
        thumbnail:
          "https://files.aipictors.com/00a502c8-0aa8-4b26-89bc-8c0bdfe3dbaf",
      },
      {
        id: "805023",
        title: "キレイな月…",
        userName: "もぐっち",
        likes: 65,
        thumbnail:
          "https://files.aipictors.com/dc42afae-03ef-4ac1-8aa7-4deb9c452771",
      },
      {
        id: "783395",
        title: "夜逃げ作戦",
        userName: "LuneHeart",
        likes: 63,
        thumbnail:
          "https://files.aipictors.com/86c857b5-2279-45c7-a216-48d4da016d17",
      },
      {
        id: "745972",
        title: "ムシムシした日にはチョコミントだね",
        userName: "にししん",
        likes: 63,
        thumbnail:
          "https://files.aipictors.com/a8d035df-54a4-4ff5-b478-684454e8870b",
      },
      {
        id: "698955",
        title: "Untitled",
        userName: "CherryBlossom",
        likes: 58,
        thumbnail:
          "https://files.aipictors.com/08acb26c-d187-4ae9-81f2-42fe9d4dc7e8",
      },
      {
        id: "774318",
        title: "水遊び",
        userName: "ippei",
        likes: 56,
        thumbnail:
          "https://files.aipictors.com/ee41cd13-416c-4293-a57e-0f340f1ecbe5",
      },
      {
        id: "775494",
        title: "看板にゃん！",
        userName: "ai大好き1192",
        likes: 54,
        thumbnail:
          "https://files.aipictors.com/f36fc75c-c53d-4f78-858e-f5d8313650dc",
      },
    ],
  },
]
