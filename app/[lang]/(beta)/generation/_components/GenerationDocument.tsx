"use client"

import {
  Icon,
  IconButton,
  Image,
  List,
  ListItem,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
} from "@chakra-ui/react"
import { ImageModelsQuery } from "__generated__/apollo"
import { TbCheck } from "react-icons/tb"

type Props = {
  models: ImageModelsQuery["imageModels"]
}

export const GenerationDocument: React.FC<Props> = (props) => {
  const imageUrl =
    "https://www.aipictors.com/wp-content/themes/AISite/images/banner/aipictors-plus-banner.webp"
  return (
    <Stack overflow={"hidden"} px={4} spacing={4}>
      <Image borderRadius={"md"} src={imageUrl} />
      <Stack>
        <Text>{"投稿時は規約をご確認ください。"}</Text>
        <Text>{"複数アカウントでの生成は禁止です。"}</Text>
        <UnorderedList>
          <ListItem>
            {"赤十字マークは作品に含めないようご注意下さい。"}
          </ListItem>
          <ListItem>
            {
              "法的な観点より性器または性器を連想する部位、性器結合部位及び挿入部位、アヌス結合部位及び挿入部位の無修正画像（AIにより当該部位に修正がされたものを含む）の生成、投稿（モザイク加工を行っている作品も含む）はお控え下さい。"
            }
          </ListItem>
          <ListItem>
            {
              "複数アカウントでの生成、無修正画像の生成、児童ポルノと誤認される恐れのある画像の生成は禁止されています。"
            }
          </ListItem>
          <ListItem>
            {
              "生成された画像の投稿時には意図的に極端に破綻した作品の投稿は禁止されています。"
            }
          </ListItem>
          <ListItem>
            {
              "意図的な規約違反が検出された場合は生成機能がご利用いただけなくなります。"
            }
          </ListItem>
        </UnorderedList>
        <List>
          <ListItem>
            <IconButton
              aria-label={"メニュー"}
              borderRadius={"full"}
              icon={<Icon as={TbCheck} />}
              size={"sm"}
              color="green.500"
            />
            {"すべてのモデルについて個人利用可です。"}
          </ListItem>
          <ListItem>
            <IconButton
              aria-label={"メニュー"}
              borderRadius={"full"}
              icon={<Icon as={TbCheck} />}
              size={"sm"}
              color="green.500"
            />
            {"すべてのモデルについて商業利用可です。"}
          </ListItem>
        </List>
        <Text>
          {
            "Aipictors生成機で生成された旨の記載は可能であれば記載いただけると嬉しいです。"
          }
        </Text>
      </Stack>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>{"モデル"}</Th>
              <Th>{"参考可能作品"}</Th>
              <Th>{"SD"}</Th>
              <Th>{"テイスト"}</Th>
              <Th>{"ライセンス"}</Th>
              <Th>{"推奨プロンプト"}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.models.map((model) => (
              <Tr key={model.id}>
                <Td>{model.displayName}</Td>
                <Td>{}</Td>
                <Td>{}</Td>
                <Td>{model.style}</Td>
                <Td>{model.license}</Td>
                <Td>{model.prompts}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
