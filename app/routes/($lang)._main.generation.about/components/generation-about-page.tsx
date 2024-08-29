import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import { Separator } from "~/components/ui/separator"
import { Link } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"

/**
 * 画像生成についての説明
 */
export function GenerationAboutPage() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/generation">生成トップ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/generation/about">
              生成機能について
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <main className="container relative m-auto flex flex-col space-y-4 pt-8 md:space-y-8">
        <p className="text-left font-bold text-2xl md:text-center md:text-4xl">
          {"簡単、本格生成。"}
        </p>
        <p className="text-left font-bold text-2xl md:text-center md:text-4xl">
          {"高クオリティな作品を"}
          <br className="md:hidden" />
          {"「探せる」、「創れる」"}
          <br className="md:hidden" />
          {"画像生成。"}
        </p>
        <Link to={"/generation"} className={"m-auto block w-64 text-center"}>
          <Button className="m-auto">{"無料生成してみる！"}</Button>
        </Link>
        <p className="text-center font-bold text-xl">
          {"スマホ対応！"}
          <br className="md:hidden" />
          {"どこでもいつでも"}
          {"簡単に生成できる！"}
        </p>
        <p className="text-center font-bold text-xl">
          {"AI画像生成サービス"}
          <br className="md:hidden" />
          {"1日10枚無料！"}
        </p>
        <Link to="/generation">
          <img
            className="auto"
            alt="参考生成画面"
            src="https://assets.aipictors.com/generation-home-editor_11zon.webp"
          />
        </Link>
        <Separator />
        <div className="flex flex-col space-y-24">
          <section className="flex flex-col space-y-4">
            <p className="text-left font-bold text-4xl">
              {"投稿サイトと連動！"}
              <br />
              {"作品を検索して参照生成できる！"}
            </p>
            <div className="items-center md:flex md:space-x-4">
              <img
                alt="search"
                src="https://assets.aipictors.com/generation-search.webp"
              />
              <div className="flex flex-col space-y-4">
                <p className="text-xl leading-snug">
                  {
                    "みんなの投稿した作品を検索して、参考にしながら生成できます！もし、お気に入りの作品が完成したら、自分でも投稿してみましょう♪"
                  }
                </p>
                <Link to="/generation">
                  <Button className="m-auto">{"無料生成してみる！"}</Button>
                </Link>
              </div>
            </div>
          </section>
          <section className="flex flex-col space-y-4">
            <p className="text-left font-bold text-4xl">
              {"本格生成のための多様な設定が標準装備！"}
              <br />
              {"高クオリティな画像を手軽に生成できる！"}
            </p>
            <div className="items-center md:flex md:space-x-4">
              <div className="flex flex-col space-y-4">
                <p className="text-xl leading-snug">
                  {
                    "生成する画像の設定を細かく調整できるので、自分の好みに合わせた画像を生成できます！"
                  }
                </p>
                <Link to="/generation">
                  <Button className="m-auto">{"無料生成してみる！"}</Button>
                </Link>
              </div>
              <img
                alt="search"
                src="https://assets.aipictors.com/generation-sample.webp"
              />
            </div>
          </section>
          <section className="flex flex-col space-y-4">
            <p className="text-left font-bold text-4xl">
              {"多種多様なモデルが搭載済み！"}
              <br />
              {"グラビアからアニメ系まで！"}
            </p>
            <img
              alt="models"
              className="w-full"
              src="https://assets.aipictors.com/generation-models-2_11zon.webp"
            />
          </section>
        </div>
        <section className="p-2">
          <p className="text-left font-bold text-4xl">
            {"イラスト、リアル系まで生成できるジャンルは無限大！"}
          </p>
          <div className="rounded-md p-4">
            <Carousel className="m-auto">
              <CarouselContent>
                <CarouselItem className="basis-1/3">
                  <img
                    src="https://assets.aipictors.com/ff478cc0-35ad-12f8-d945-2511b5a49bd8_11zon.webp"
                    alt="参考画像1"
                    className="rounded-md"
                  />
                </CarouselItem>
                <CarouselItem className="basis-1/3">
                  <img
                    src="https://assets.aipictors.com/c068adee-e0c4-efa2-c7cf-739cc6df900c_11zon.webp"
                    alt="参考画像2"
                    className="rounded-md"
                  />
                </CarouselItem>
                <CarouselItem className="basis-1/3">
                  <img
                    src="https://assets.aipictors.com/5039b249-9672-b8a6-45f1-954c7a6512ae_11zon.webp"
                    alt="参考画像3"
                    className="rounded-md"
                  />
                </CarouselItem>
                <CarouselItem className="basis-1/3">
                  <img
                    src="https://assets.aipictors.com/b270cd3b-06a6-6e86-f74f-371800ecb57b_11zon.webp"
                    alt="参考画像4"
                    className="rounded-md"
                  />
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>
        </section>
        <Separator />
        <p className="text-center font-bold text-xl">{"よくあるご質問"}</p>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>{"料金プランが知りたい"}</AccordionTrigger>
            <AccordionContent>
              <Link to={"/generation/plans"}>{"料金プランの詳細はこちら"}</Link>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>{"LINE認証がうまくいかない"}</AccordionTrigger>
            <AccordionContent>
              {
                "LINE認証がうまくいかない場合は、お手数ですが、サポートまでお問い合わせください。"
              }
              <Link to="/support/chat">
                {"サポートへのお問い合わせはこちら"}
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-center gap-x-2 py-4">
          <Link to="/generation/terms">利用規約</Link>
          <Link to="/specified-commercial-transaction-act">
            特定商取引法に基づく表記
          </Link>
        </div>
      </main>
    </>
  )
}
