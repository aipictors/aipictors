"use client"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
  Icon,
  Stack,
  Text,
  Wrap,
} from "@chakra-ui/react"
import { FC } from "react"
import {
  TbClock,
  TbCreativeCommonsBy,
  TbDog,
  TbEye,
  TbFall,
  TbMoodSad,
  TbPencil,
  TbPhoto,
  TbShirt,
  TbUser,
} from "react-icons/tb"

export const MainGeneration: FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"画像生成"}
        </Text>
        <Accordion defaultIndex={[0]}>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbUser} />
                <Text>{"大人の女性"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"}>{"女の子"}</Button>
                <Button size={"xs"}>{"男の子"}</Button>
                <Button size={"xs"} colorScheme="primary">
                  {"大人の女性"}
                </Button>
                <Button size={"xs"}>{"大人の男性"}</Button>
                <Button size={"xs"}>{"ぴくたーちゃん"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbMoodSad} />
                <Text>{"ショートヘア"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"}>{"ツインテール"}</Button>
                <Button size={"xs"}>{"ポニーテール"}</Button>
                <Button size={"xs"}>{"ロング"}</Button>
                <Button size={"xs"} colorScheme="primary">
                  {"ショートヘア"}
                </Button>
                <Button size={"xs"}>{"ボブカット"}</Button>
                <Button size={"xs"}>{"みつあみ"}</Button>
                <Button size={"xs"}>{"濡れ髪"}</Button>
                <Button size={"xs"}>{"アホ毛"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbMoodSad} />
                <Text>{"金髪"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"} colorScheme="primary">
                  {"金髪"}
                </Button>
                <Button size={"xs"}>{"黒髪"}</Button>
                <Button size={"xs"}>{"銀髪"}</Button>
                <Button size={"xs"}>{"白髪"}</Button>
                <Button size={"xs"}>{"ピンク髪"}</Button>
                <Button size={"xs"}>{"緑髪"}</Button>
                <Button size={"xs"}>{"青髪"}</Button>
                <Button size={"xs"}>{"茶髪"}</Button>
                <Button size={"xs"}>{"赤髪"}</Button>
                <Button size={"xs"}>{"紫髪"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbShirt} />
                <Text>{"ミニスカート"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"}>{"麦わら帽子"}</Button>
                <Button size={"xs"}>{"Tシャツ"}</Button>
                <Button size={"xs"}>{"半袖"}</Button>
                <Button size={"xs"}>{"長袖"}</Button>
                <Button size={"xs"}>{"パフ"}</Button>
                <Button size={"xs"}>{"ジャージ"}</Button>
                <Button size={"xs"}>{"スカート"}</Button>
                <Button size={"xs"} colorScheme="primary">
                  {"ミニスカート"}
                </Button>
                <Button size={"xs"}>{"競泳水着"}</Button>
                <Button size={"xs"}>{"絶対領域"}</Button>
                <Button size={"xs"}>{"ガーターベルト"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbEye} />
                <Text>{"青目"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"} colorScheme="primary">
                  {"青目"}
                </Button>
                <Button size={"xs"}>{"赤目"}</Button>
                <Button size={"xs"}>{"碧目"}</Button>
                <Button size={"xs"}>{"黄色目"}</Button>
                <Button size={"xs"}>{"ピンク目"}</Button>
                <Button size={"xs"}>{"オッドアイ"}</Button>
                <Button size={"xs"}>{"ウィンク"}</Button>
                <Button size={"xs"}>{"緑目"}</Button>
                <Button size={"xs"}>{"紫目"}</Button>
                <Button size={"xs"}>{"黒目"}</Button>
                <Button size={"xs"}>{"オレンジ目"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbCreativeCommonsBy} />
                <Text>{"メイド"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"} colorScheme="primary">
                  {"メイド"}
                </Button>
                <Button size={"xs"}>{"天使"}</Button>
                <Button size={"xs"}>{"エルフ"}</Button>
                <Button size={"xs"}>{"女子高生"}</Button>
                <Button size={"xs"}>{"魔法少女"}</Button>
                <Button size={"xs"}>{"シスター"}</Button>
                <Button size={"xs"}>{"魔女"}</Button>
                <Button size={"xs"}>{"妖精"}</Button>
                <Button size={"xs"}>{"魔法使い"}</Button>
                <Button size={"xs"}>{"アイドル"}</Button>
                <Button size={"xs"}>{"妊婦"}</Button>
                <Button size={"xs"}>{"メスガキ"}</Button>
                <Button size={"xs"}>{"ロリビッチ"}</Button>
                <Button size={"xs"}>{"巫女"}</Button>
                <Button size={"xs"}>{"悪魔"}</Button>
                <Button size={"xs"}>{"女騎士"}</Button>
                <Button size={"xs"}>{"学生"}</Button>
                <Button size={"xs"}>{"OL"}</Button>
                <Button size={"xs"}>{"社長"}</Button>
                <Button size={"xs"}>{"ナース"}</Button>
                <Button size={"xs"}>{"姫"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbPencil} />
                <Text>{"水彩"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"} colorScheme="primary">
                  {"水彩"}
                </Button>
                <Button size={"xs"}>{"和風"}</Button>
                <Button size={"xs"}>{"ファンタジー"}</Button>
                <Button size={"xs"}>{"カラフル"}</Button>
                <Button size={"xs"}>{"ホラー"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbDog} />
                <Text>{"動物"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"} colorScheme="primary">
                  {"動物"}
                </Button>
                <Button size={"xs"}>{"猫"}</Button>
                <Button size={"xs"}>{"犬"}</Button>
                <Button size={"xs"}>{"うさぎ"}</Button>
                <Button size={"xs"}>{"ドラゴン"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbPhoto} />
                <Text>{"春"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"} colorScheme="primary">
                  {"春"}
                </Button>
                <Button size={"xs"}>{"夏"}</Button>
                <Button size={"xs"}>{"秋"}</Button>
                <Button size={"xs"}>{"冬"}</Button>
                <Button size={"xs"}>{"朝"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbClock} />
                <Text>{"買い物"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"}>{"お風呂"}</Button>
                <Button size={"xs"}>{"パンチラ"}</Button>
                <Button size={"xs"}>{"催眠"}</Button>
                <Button size={"xs"}>{"結婚式"}</Button>
                <Button size={"xs"}>{"デート"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <HStack flex="1">
                <Icon as={TbFall} />
                <Text>{"立ってる"}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap>
                <Button size={"xs"} colorScheme="primary">
                  {"立ってる"}
                </Button>
                <Button size={"xs"}>{"座ってる"}</Button>
                <Button size={"xs"}>{"しゃがんでる"}</Button>
                <Button size={"xs"}>{"ジャンプしてる"}</Button>
                <Button size={"xs"}>{"走ってる"}</Button>
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Button colorScheme={"primary"}>{"生成"}</Button>
      </Stack>
    </HStack>
  )
}
