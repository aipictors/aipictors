"use client"

import type { EventUser } from "@/app/[lang]/events/_types/event-user"
import { EventCreatorCard } from "@/app/[lang]/events/wakiaiai/_components/event-creator-card"
import { EventImage } from "@/app/[lang]/events/wakiaiai/_components/event-image"
import { Config } from "@/config"
import {
  Box,
  Button,
  Card,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react"
import { getAnalytics, logEvent } from "firebase/analytics"
import { useEffect } from "react"
import { TbBrandTwitterFilled, TbExternalLink, TbMail } from "react-icons/tb"

export const SectionAboutWakiaiai: React.FC = () => {
  const { setColorMode } = useColorMode()

  useEffect(() => {
    setColorMode("light")
  })

  const users: EventUser[] = [
    {
      name: "褐色眼鏡工房",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FMa3fkcA5pKesmRzw4tYdvbTQWZxULy.webp?alt=media&token=87b3cc5d-c7b7-47ae-8929-7196700d368f",
      twitterId: "novelai_oekaki",
      aipictorsId: "katsumega",
      siteURL: "https://lit.link/katsumega",
      siteTitle: null,
      links: [],
    },
    {
      name: "Kakko🌸🌈AI漫画",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FC0ZRP83zurijeapfLhHtwcQk7NxTAV.webp?alt=media&token=0a5b8175-150b-42c1-a770-e951c7826144",
      twitterId: "kakowara365",
      aipictorsId: "6220",
      siteURL: "https://prompton.io/kakowara",
      siteTitle: "プロンプトン",
      links: [],
    },
    {
      name: "YUMA",
      types: ["SHOP"],
      message: "AIイラスト兼AI副業｜YUMA FACTORY運営",
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FOstlsYYo.jpg?alt=media&token=187cbe22-bf55-4702-a067-2d1bed601d5b",
      twitterId: "yumanosekai",
      aipictorsId: "yumaillustai",
      siteTitle: null,
      siteURL: null,
      links: [],
    },
    {
      name: "ふしめろ",
      types: ["SHOP"],
      message: "C102/2日目 東フ16b",
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FGz5A2LYtvTVKJcsrpR71dFguha3NbX.webp?alt=media&token=3b06143a-18f7-49bd-a8b7-92192e5f52a2",
      twitterId: "hushinomiya",
      aipictorsId: null,
      siteURL: "https://enzbn3f3zn.tooon.site/",
      siteTitle: "オオサキケンイチ",
      links: [],
    },
    {
      name: "シャヒデイー",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FLXE5ZA7iN40JcgCBP8SpHzKhUarDQv.webp?alt=media&token=25f613da-4352-4777-bd20-b8330e3c899d",
      twitterId: "SayashiShahidee",
      aipictorsId: "24674",
      siteURL: "https://linktr.ee/sayashishahidee",
      siteTitle: null,
      links: [],
    },
    {
      name: "あまつかりん",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2F0UB1s4xZgPjVwJArGK7u8ym2hYa96Q.webp?alt=media&token=31b27874-496a-4072-b886-df6169988e9d",
      twitterId: "Amatsukarin",
      aipictorsId: null,
      siteURL: "https://note.com/amatsukarin/",
      siteTitle: null,
      links: [],
    },
    {
      name: "滝川 海老郎",
      types: ["SHOP", "SPONSOR"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FzvQGcNU7FrVpqD1StneuTkEZ39My2P.webp?alt=media&token=3571d5cb-f11e-4ab2-8642-fcb23b8ee49c",
      twitterId: "syuribox",
      aipictorsId: null,
      siteURL: "https://www.foriio.com/syuribox",
      siteTitle: null,
      links: [
        {
          type: "amazon",
          siteURL: "https://www.amazon.co.jp/~/e/B0BVR2XDF5",
          siteTitle: null,
        },
      ],
    },
    {
      name: "水マン(waterman)",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FPG5Eek-7.jpg?alt=media&token=d9c07d3c-99d3-4964-ba6b-ebf30743a31f",
      twitterId: "waterman_jp",
      aipictorsId: null,
      siteURL: "https://blog.deepfort.net/",
      siteTitle: "Deepfort",
      links: [],
    },
    {
      name: "R5（アルゴ）",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FVjHjjas2.jpg?alt=media&token=e4d9654b-4991-41cd-8fe8-da597c517e3d",
      twitterId: "R5Revo",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "殻Bee(からびー)@AIart🐏",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FMabyf6RS.jpg?alt=media&token=5fb4764d-6e4f-432f-89c5-a844dad6f596",
      twitterId: "KARA_Beee",
      aipictorsId: null,
      siteURL: "https://lit.link/karabee",
      siteTitle: null,
      links: [],
    },

    {
      name: "NOAH",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FUx21ytQb.jpg?alt=media&token=7a5096b7-73c5-4c54-883d-c813da2cd93b",
      twitterId: "NOAH_AI_illust",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },

    {
      name: "エリマキ",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FCqcQZjfP.jpg?alt=media&token=1048b8a8-66fe-4e34-a24c-6fe8323d3a54",
      twitterId: "mogech6",
      aipictorsId: "@mogech6",
      siteURL: null,
      siteTitle: null,
      links: [],
    },

    {
      name: "くらいむ",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FHpxjE3ng.jpg?alt=media&token=7ebd12a0-a3ec-4a89-9bba-eadade4e626f",
      twitterId: "kura_starwing",
      aipictorsId: null,
      siteURL: "https://www.youtube.com/user/kuraimu0513",
      siteTitle: "Youtube",
      links: [],
    },

    {
      name: "よしだゆうき",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FJ6fMvCUY.jpg?alt=media&token=5cb917c6-4398-45f2-8cfe-2fd605445ac7",
      twitterId: "Yuki__Yoshida__",
      aipictorsId: null,
      siteURL: "https://yuki-yoshida.myportfolio.com/",
      siteTitle: null,
      links: [],
    },

    {
      name: "ざくろ舞",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FkTL24Zxt.jpg?alt=media&token=501b1cc9-89c0-4041-9893-31cc18dd0055",
      twitterId: "Zacro_inn",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "kiri",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FJEchMeE4.jpg?alt=media&token=bd12c7d3-1f9d-4471-9139-6e5f4a8d1ab7",
      twitterId: "kiri_des",
      aipictorsId: null,
      siteURL: "https://lit.link/kirides",
      siteTitle: null,
      links: [],
    },
    {
      name: "おたひ",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FHpjTd-mM.jpg?alt=media&token=0e52db11-ca38-480c-b917-962c61ba9d62",
      twitterId: "otahiiiiiiiiii",
      aipictorsId: null,
      siteURL: "https://www.nicovideo.jp/user/127981069",
      siteTitle: "ニコニコ動画",
      links: [],
    },
    {
      name: "nawashi",
      types: ["EXHIBIT", "SPONSOR"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FxRv4Z8QV2NXKrnj5UGYHiCuq3A9Dzb.webp?alt=media&token=74dd5f6c-c413-4807-ba76-3a641edb004c",
      twitterId: null,
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "852話",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FjRximB_o.jpg?alt=media&token=136f32c7-dbb1-472d-9650-3dae318b0ed8",
      twitterId: "8co28",
      aipictorsId: null,
      siteURL: "https://lit.link/8528",
      siteTitle: null,
      links: [
        {
          type: "booth",
          siteURL: "https://meola.booth.pm/items",
          siteTitle: null,
        },
      ],
    },
    {
      name: "川瀬",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FkIJ4YNSN.png?alt=media&token=ef8b3364-0e90-49d1-a0a0-f5a3f76edc69",
      twitterId: "AiKawasu1000",
      aipictorsId: null,
      siteURL: "https://ai-kawasu-1000.blog.jp/",
      siteTitle: null,
      links: [],
    },
    {
      name: "Wood.Pecker",
      types: ["EXHIBIT"],
      message: "@7/8 広島タゲマル T01",
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2F9e700a83697f19067c075a9d5d758ffc.jpeg?alt=media&token=e96ef304-b62a-4e18-a0ee-a24165ac374a",
      twitterId: "Wood_Pecker_",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "なかむらしっぽ/中邑七宝",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FqmpzVDfR.jpg?alt=media&token=2b416da4-c222-473d-b42c-488cf0357a63",
      twitterId: "Nakamurashippo",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "ひふみ『debuff：none』",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FGfSIFiDf.jpg?alt=media&token=24564934-cce4-4da7-949b-78b40bd2b93f",
      twitterId: "Hifumi_AID",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },

    {
      name: "呉 春華",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FWhik0rb7.jpg?alt=media&token=84a7e5c5-fef0-4b8e-9c68-750956ef7067",
      twitterId: "ShunkaCule",
      aipictorsId: "162",
      siteURL: null,
      siteTitle: null,
      links: [],
    },

    {
      name: "ナコち",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2Fieq6NwwL.jpg?alt=media&token=e74caa8c-7e7f-42c9-b152-96c687147d50",
      twitterId: "ai_anima_nun",
      aipictorsId: "@ai_anima_nun",
      siteURL: "https://lit.link/aianimanun",
      siteTitle: null,
      links: [],
    },

    {
      name: "エルセンナ",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2F99f6SxJv.jpg?alt=media&token=b5c4b251-b67b-4467-a888-cee88e11e3c1",
      twitterId: "elessenar",
      aipictorsId: "@elessenar",
      siteURL: null,
      siteTitle: null,
      links: [],
    },

    {
      name: "さつき＠AIお絵描き(うさぎ好き）",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FlH-oxwC9.jpg?alt=media&token=201c0080-4b0c-4717-998a-2270d00f72bc",
      twitterId: "masukarasulove",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },

    {
      name: "プロンプトン",
      types: ["EXHIBIT"],
      message: "イラスト依頼サイト",
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2Faz0tlecX.jpg?alt=media&token=2218b7c1-70f2-487d-a9a7-4c6f5a0b4e13",
      twitterId: "promptonio",
      aipictorsId: null,
      siteURL: "https://prompton.io",
      siteTitle: "プロンプトン",
      links: [],
    },

    {
      name: "七瀬葵",
      types: ["EXHIBIT", "SPONSOR"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FPiGZzeRnBxvr9hmgV4WbadEqLFDNws.webp?alt=media&token=d7f4c500-ccfc-4fe8-b224-80ec362a0d96",
      twitterId: "aoi_nanase3",
      aipictorsId: "@aoi_nanase3",
      siteURL: "https://lit.link/aoinanase",
      siteTitle: null,
      links: [
        {
          type: "youtube",
          siteURL: "https://www.youtube.com/@Aoi_nanase3",
          siteTitle: null,
        },
      ],
    },
    {
      name: "花葩レイミ",
      types: ["EXHIBIT", "SPONSOR"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2F7jx_6B3W.jpg?alt=media&token=c2dd30f7-16f2-4055-a69e-14c65c8cada8",
      twitterId: "hanahirareimi",
      aipictorsId: "1240",
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "らけしで",
      types: ["SPONSOR"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FgIRgYr-E.jpg?alt=media&token=2ad435ee-b385-428c-be46-cca2c884e651",
      twitterId: "lakeside529",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "Aipictors",
      types: ["SPONSOR"],
      message: null,
      aipictorsId: "admin",
      twitterId: "AIPICTORS",
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FaTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp?alt=media&token=e7da37fe-0a77-4b08-b48f-8fcd33d555a8",
      siteURL: "https://www.aipictors.com",
      siteTitle: "Aipictors",
      links: [],
    },
    {
      name: "アワートAI",
      types: ["SPONSOR"],
      message: null,
      iconImageURL:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2FFp4tYxj2.png?alt=media&token=95cbdbf1-2d44-4e74-af51-7d91c2929921",
      twitterId: "ourt_ai",
      aipictorsId: null,
      siteURL: "https://ourt-ai.work",
      siteTitle: "アワートAI",
      links: [],
    },
  ]

  const length = Math.floor(users.length / 3)

  const aUsers = users.filter((_, index) => {
    return index <= length
  })

  const bUsers = users.filter((_, index) => {
    return length < index && index <= length * 2
  })

  const cUsers = users.filter((_, index) => {
    return length * 2 < index && index < users.length
  })

  return (
    <Stack
      minH={"100vh"}
      spacing={2}
      pt={2}
      px={2}
      maxW={"container.xl"}
      mx={"auto"}
    >
      <Stack direction={{ base: "column", md: "row" }} alignItems={"center"}>
        <Box flex={3}>
          <EventImage
            alt={"和気あいAI"}
            imageURL={
              "https://www.aipictors.com/wp-content/uploads/2023/07/XVzvtp28cfh6CQaMT9Rk0yJFA4rsgN.webp"
            }
            linkURL={"https://www.aipictors.com/works/66168/"}
            linkTitle={"Aipictors"}
            borderTopRadius={"md"}
            borderBottomLeftRadius={"md"}
            borderBottomRightRadius={"3xl"}
          />
        </Box>
        <Stack flex={2} px={{ base: 4, md: 8 }} py={8} spacing={8}>
          <Stack spacing={4}>
            <Heading size={"lg"} color={"blue.300"}>
              {"2023年9月30日"}
            </Heading>
            <Heading as="h1" size={"4xl"} color={"blue.300"}>
              {"和気あいAI"}
            </Heading>
          </Stack>
          <Text lineHeight={1.5} fontSize={"1.2rem"}>
            {
              "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会"
            }
          </Text>
          <HStack>
            <Button
              as={"a"}
              target={"_blank"}
              rel={"noopener"}
              href={
                "https://twitter.com/share?url=app.aipictors.com/events/wakiaiai"
              }
              borderRadius={"full"}
              leftIcon={
                <Icon as={TbBrandTwitterFilled} color={"twitter.500"} />
              }
              aria-label={"Twitter"}
              onClick={() => {
                logEvent(getAnalytics(), Config.logEvent.share, {
                  content_type: "link",
                  method: "twitter",
                  item_id: "",
                })
              }}
            >
              {"X（Twitter）でシェアする"}
            </Button>
          </HStack>
        </Stack>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} w={"100%"}>
        <Card variant={"filled"} bg={"gray.100"} color={"gray.800"}>
          <Stack spacing={4} p={{ base: 4, md: 8 }}>
            <Heading size={"lg"}>{"9月30日（土） 10時〜16時"}</Heading>
            <Text>
              {
                "一般参加は無料！本イベントは、主に画像生成AIを利用したイラストの展示及び即売会となります。本イベントにおけるデモンストレーションや展示を通じて、AIを利用した創作の楽しさ、利便性、注意すべき点などをAI利用者、一般参加者ともに周知することを考え、企画致しました。"
              }
            </Text>
          </Stack>
        </Card>
        <Card
          variant={"filled"}
          bg={"gray.100"}
          color={"gray.800"}
          borderTopRightRadius={{ base: "md", md: "3xl" }}
        >
          <Stack spacing={4} p={{ base: 4, md: 8 }}>
            <Heading size={"lg"}>{"名古屋鉄道太田川駅から1分"}</Heading>
            <Text>
              {
                "お車でお越しの際は、東海市芸術劇場併設の駐車場又は近隣商業施設の駐車場をご利用ください。"
              }
            </Text>
            <Text>
              {"即売会：太田川駅西広場 大屋根広場（愛知県東海市大田町下浜田）"}
            </Text>
            <Text>
              {
                "展示：東海市芸術劇場 4階ギャラリー（愛知県東海市大田町下浜田137）"
              }
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>
      <Box
        borderRadius={"md"}
        as={"iframe"}
        src={
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d173236.96306047565!2d136.8223456376915!3d35.06173419127466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60037fbd4e27a501%3A0xced4a78d8bbf60fe!2z5aSq55Sw5bed6aeF6KW_5bqD5aC077yI5aSn5bGL5qC55bqD5aC077yJ!5e0!3m2!1sja!2sjp!4v1688692547024!5m2!1sja!2sjp"
        }
        width={"100%"}
        height={400}
        style={{ border: 0 }}
        allowFullScreen={true}
        loading={"lazy"}
        referrerPolicy={"no-referrer-when-downgrade"}
      />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={2} w={"100%"}>
        {aUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </SimpleGrid>
      <EventImage
        alt={"和気あいAI"}
        imageURL={
          "https://www.aipictors.com/wp-content/uploads/2023/07/2NSLUKmgXQni6HaM18FAVTbtd4xscq.webp"
        }
        linkURL={"https://www.aipictors.com/works/66093/"}
        linkTitle={"Aipictors"}
        borderTopRadius={"md"}
        borderBottomLeftRadius={"md"}
        borderBottomRightRadius={"3xl"}
      />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={2} w={"100%"}>
        {bUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </SimpleGrid>
      <Box
        borderRadius={"md"}
        as={"iframe"}
        width={"100%"}
        height={400}
        src={"https://www.youtube.com/embed/_VCTJxdKs3w"}
        title={"和気あいAI、会場紹介動画"}
        style={{ border: 0 }}
        allow={
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        }
        allowFullScreen={true}
      />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={2} w={"100%"}>
        {cUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </SimpleGrid>

      <Card variant={"filled"}>
        <Stack spacing={4} p={{ base: 4, md: 8 }}>
          <Heading size={"md"}>
            {"クラウドファンディング応援スポンサーさま✨"}
          </Heading>
          <Stack direction={{ base: "column", md: "row" }}>
            <Text>
              {
                "AI TEC AI PICTURES様、erot様、haru@t2i(@3724_haru)様、KAMO@AI様、KarmaNeko様、nawashi様、Ozmo/AIart様、roiyaruRIZ様、sk panda様、STIS様、うほうほめもたろう様、える様、がーすー様、かけうどん様、かすみ様、さとー様、せぴぃ様、のとろ様、ミカエル翔@ShoSecAI様、花笠万夜様、街のパン屋さん様、甘党坊主様、京すけ様、呉春華様、今日桔梗様、沙乱・さみだれNFT様、神音様、猫黒夏躯様、白うさ王国観光課様、緋鏡悠様、碧燕工房様"
              }
            </Text>
          </Stack>
        </Stack>
      </Card>

      <EventImage
        alt={"和気あいAI"}
        imageURL={
          "https://www.aipictors.com/wp-content/uploads/2023/06/FDfUikjd67cARVC30vePmGJMn4zL81.webp"
        }
        linkURL={"https://www.aipictors.com/works/59815/"}
        linkTitle={"Aipictors"}
        borderTopRadius={"md"}
        borderBottomLeftRadius={"md"}
        borderBottomRightRadius={"3xl"}
      />
      <Card variant={"filled"}>
        <Stack spacing={4} p={{ base: 4, md: 8 }}>
          <Heading size={"md"}>{"お問い合わせはこちらまで"}</Heading>
          <Stack direction={{ base: "column", md: "row" }}>
            <Button
              as={"a"}
              variant={"solid"}
              colorScheme={"blue"}
              borderRadius={"full"}
              leftIcon={<Icon as={TbExternalLink} />}
              target={"_blank"}
              rel={"noopener"}
              href={"https://twitter.com/waki_ai_ai_kot"}
            >
              {"X（Twitter）"}
            </Button>
            <Button
              as={"a"}
              variant={"solid"}
              colorScheme={"blue"}
              borderRadius={"full"}
              leftIcon={<Icon as={TbMail} />}
              href={"mailto:kotoba.no.aya.2022@gmail.com"}
            >
              {"メール"}
            </Button>
            <Button
              as={"a"}
              variant={"solid"}
              colorScheme={"blue"}
              borderRadius={"full"}
              leftIcon={<Icon as={TbExternalLink} />}
              target={"_blank"}
              rel={"noopener"}
              href={"https://discord.gg/vAmWY6MCAX"}
            >
              {"相談Discord"}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
