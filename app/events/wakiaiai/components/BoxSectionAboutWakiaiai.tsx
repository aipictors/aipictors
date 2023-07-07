"use client"
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
import { FC, useEffect } from "react"
import { TbBrandTwitterFilled, TbExternalLink, TbMail } from "react-icons/tb"
import { BoxEventImage } from "app/components/BoxEventImage"
import { EventUser } from "app/events/types/eventUser"
import { CardEventCreator } from "app/events/wakiaiai/components/CardEventCreator"

export const BoxSectionAboutWakiaiai: FC = () => {
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
        "https://www.aipictors.com/wp-content/uploads/2023/05/Ma3fkcA5pKesmRzw4tYdvbTQWZxULy.webp",
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
        "https://www.aipictors.com/wp-content/uploads/2023/03/C0ZRP83zurijeapfLhHtwcQk7NxTAV.webp",
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
        "https://www.aipictors.com/wp-content/uploads/2023/06/Xv4Sba6TdwBY3VP9iMxHkmz8QE0fpt.webp",
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
        "https://www.aipictors.com/wp-content/uploads/2023/06/Gz5A2LYtvTVKJcsrpR71dFguha3NbX.webp",
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
        "https://www.aipictors.com/wp-content/uploads/2023/01/LXE5ZA7iN40JcgCBP8SpHzKhUarDQv.webp",
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
        "https://www.aipictors.com/wp-content/uploads/2023/06/0UB1s4xZgPjVwJArGK7u8ym2hYa96Q.webp",
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
        "https://www.aipictors.com/wp-content/uploads/2023/01/zvQGcNU7FrVpqD1StneuTkEZ39My2P.webp",
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
      name: "七瀬葵",
      types: ["SHOP", "SPONSOR"],
      message: null,
      iconImageURL:
        "https://www.aipictors.com/wp-content/uploads/2023/01/PiGZzeRnBxvr9hmgV4WbadEqLFDNws.webp",
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
      name: "水マン(waterman)",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://pbs.twimg.com/profile_images/1569128546085523458/PG5Eek-7.jpg",
      twitterId: "waterman_jp",
      aipictorsId: null,
      siteURL: "https://blog.deepfort.net/",
      siteTitle: "Deepfort",
      links: [],
    },
    {
      name: "ヤマガワ_AIイラスト",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://pbs.twimg.com/profile_images/1660414065360146432/aWrH9JNA.jpg",
      twitterId: "yamagawaAI",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "らけしで",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://pbs.twimg.com/profile_images/1613822020793532417/gIRgYr-E.jpg",
      twitterId: "lakeside529",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "R5（アルゴ）",
      types: ["SHOP"],
      message: null,
      iconImageURL:
        "https://pbs.twimg.com/profile_images/1675172677445894144/VjHjjas2.jpg",
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
        "https://pbs.twimg.com/profile_images/1466358874227634178/Mabyf6RS.jpg",
      twitterId: "KARA_Beee",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "ざくろ舞",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://pbs.twimg.com/profile_images/1583198176718176256/kTL24Zxt.jpg",
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
        "https://pbs.twimg.com/profile_images/1582615902209871874/JEchMeE4.jpg",
      twitterId: "kiri_des",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "おたひ",
      types: ["EXHIBIT"],
      message: null,
      iconImageURL:
        "https://pbs.twimg.com/profile_images/1642063282277326848/HpjTd-mM.jpg",
      twitterId: "otahiiiiiiiiii",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "nawashi",
      types: ["EXHIBIT", "SPONSOR"],
      message: null,
      iconImageURL:
        "https://www.aipictors.com/wp-content/uploads/2023/05/xRv4Z8QV2NXKrnj5UGYHiCuq3A9Dzb.webp",
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
        "https://pbs.twimg.com/profile_images/1499865775246815232/jRximB_o.jpg",
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
        "https://pbs.twimg.com/profile_images/1634239205441421313/kIJ4YNSN.png",
      twitterId: "AiKawasu1000",
      aipictorsId: null,
      siteURL: null,
      siteTitle: null,
      links: [],
    },
    {
      name: "Wood.Pecker",
      types: ["EXHIBIT"],
      message: "@7/8 広島タゲマル T01",
      iconImageURL:
        "https://pbs.twimg.com/profile_images/344513261572758271/9e700a83697f19067c075a9d5d758ffc.jpeg",
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
        "https://pbs.twimg.com/profile_images/1633702330825842688/qmpzVDfR.jpg",
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
        "https://pbs.twimg.com/profile_images/1617456375944343552/GfSIFiDf.jpg",
      twitterId: "Hifumi_AID",
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
        "https://pbs.twimg.com/profile_images/1636699451145486337/az0tlecX.jpg",
      twitterId: "promptonio",
      aipictorsId: null,
      siteURL: "https://prompton.io",
      siteTitle: "プロンプトン",
      links: [],
    },

    {
      name: "AI PICTORS",
      types: ["SPONSOR"],
      message: null,
      aipictorsId: "https://www.aipictors.com/user/?id=admin",
      twitterId: "AIPICTORS",
      iconImageURL:
        "https://www.aipictors.com/wp-content/uploads/2023/04/aTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp",
      siteURL: "https://www.aipictors.com",
      siteTitle: "AIピクターズ",
      links: [],
    },
    {
      name: "アワートAI",
      types: ["SPONSOR"],
      message: null,
      iconImageURL:
        "https://pbs.twimg.com/profile_images/1607206944548454400/Fp4tYxj2.png",
      twitterId: "ourt_ai",
      aipictorsId: null,
      siteURL: "https://ourt-ai.work",
      siteTitle: "アワートAI",
      links: [],
    },
  ]

  const shops = users.filter((user) => {
    return user.types.includes("SHOP")
  })

  const exhibits = users.filter((user) => {
    return user.types.includes("EXHIBIT") || user.types.includes("SPONSOR")
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
          <BoxEventImage
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
            <Heading size={"4xl"} color={"blue.300"}>
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
                logEvent(getAnalytics(), "share", {
                  content_type: "link",
                  method: "twitter",
                  item_id: "",
                })
              }}
            >
              {"Twitterでシェアする"}
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
        {shops.map((user, index) => (
          <CardEventCreator key={index} user={user} />
        ))}
      </SimpleGrid>
      <BoxEventImage
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
        {exhibits.map((user, index) => (
          <CardEventCreator key={index} user={user} />
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
      <Card variant={"filled"}>
        <Stack spacing={6} p={{ base: 4, md: 8 }}>
          <Heading size={"md"}>{"お問い合わせはこちらまで"}</Heading>
          <HStack>
            <Button
              as={"a"}
              variant={"solid"}
              colorScheme={"blue"}
              borderRadius={"full"}
              leftIcon={<Icon as={TbExternalLink} />}
              target={"_blank"}
              rel={"noopener"}
              href={"https://kotobanoaya2023.blog.fc2.com"}
            >
              {"ことばのあや"}
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
          </HStack>
        </Stack>
      </Card>
    </Stack>
  )
}
