import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import { Separator } from "~/components/ui/separator"
import { Link } from "react-router"
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
import { useTranslation } from "~/hooks/use-translation"

/**
 * 画像生成についての説明
 */
export function GenerationAboutPage() {
  const t = useTranslation()

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/generation">
              {t("生成トップ", "Top")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/generation/about">
              {t("生成機能について", "About Image Generation")}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <main className="container relative m-auto flex flex-col space-y-4 pt-8 md:space-y-8">
        <p className="text-left font-bold text-2xl md:text-center md:text-4xl">
          {t("簡単、本格生成。", "Simple, Professional Generation.")}
        </p>
        <p className="text-left font-bold text-2xl md:text-center md:text-4xl">
          {t("高クオリティな作品を", "High-quality creations")}
          <br className="md:hidden" />
          {t("「探せる」、「創れる」", "You can 'Find' and 'Create'")}
          <br className="md:hidden" />
          {t("画像生成。", "with Image Generation.")}
        </p>
        <Link to={"/generation"} className={"m-auto block w-64 text-center"}>
          <Button className="m-auto">
            {t("無料生成してみる！", "Try Generating for Free!")}
          </Button>
        </Link>
        <p className="text-center font-bold text-xl">
          {t("スマホ対応！", "Mobile Friendly!")}
          <br className="md:hidden" />
          {t("どこでもいつでも", "Generate anytime, anywhere")}
          {t("簡単に生成できる！", "with ease!")}
        </p>
        <p className="text-center font-bold text-xl">
          {t("AI画像生成サービス", "AI Image Generation Service")}
          <br className="md:hidden" />
          {t("1日10枚無料！", "10 Free Images per Day!")}
        </p>
        <Link to="/generation">
          <img
            className="auto"
            alt={t("参考生成画面", "Sample Generation Screen")}
            src="https://assets.aipictors.com/generation-home-editor_11zon.webp"
          />
        </Link>
        <Separator />
        <div className="flex flex-col space-y-24">
          <section className="flex flex-col space-y-4">
            <p className="text-left font-bold text-4xl">
              {t("投稿サイトと連動！", "Linked with the Posting Site!")}
              <br />
              {t(
                "作品を検索して参照生成できる！",
                "Search and Generate Referenced Creations!",
              )}
            </p>
            <div className="items-center md:flex md:space-x-4">
              <img
                alt={t("search", "search")}
                src="https://assets.aipictors.com/generation-search.webp"
              />
              <div className="flex flex-col space-y-4">
                <p className="text-xl leading-snug">
                  {t(
                    "みんなの投稿した作品を検索して、参考にしながら生成できます！もし、お気に入りの作品が完成したら、自分でも投稿してみましょう♪",
                    "Search everyone's posted works and generate based on their references! If you create something you love, go ahead and post it yourself!",
                  )}
                </p>
                <Link to="/generation">
                  <Button className="m-auto">
                    {t("無料生成してみる！", "Try Generating for Free!")}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          <section className="flex flex-col space-y-4">
            <p className="text-left font-bold text-4xl">
              {t(
                "本格生成のための多様な設定が標準装備！",
                "Comprehensive Settings for Advanced Generation!",
              )}
              <br />
              {t(
                "高クオリティな画像を手軽に生成できる！",
                "Generate High-Quality Images Easily!",
              )}
            </p>
            <div className="items-center md:flex md:space-x-4">
              <div className="flex flex-col space-y-4">
                <p className="text-xl leading-snug">
                  {t(
                    "生成する画像の設定を細かく調整できるので、自分の好みに合わせた画像を生成できます！",
                    "You can finely adjust the settings of the generated images to create them according to your preferences!",
                  )}
                </p>
                <Link to="/generation">
                  <Button className="m-auto">
                    {t("無料生成してみる！", "Try Generating for Free!")}
                  </Button>
                </Link>
              </div>
              <img
                alt={t("search", "search")}
                src="https://assets.aipictors.com/generation-sample.webp"
              />
            </div>
          </section>
          <section className="flex flex-col space-y-4">
            <p className="text-left font-bold text-4xl">
              {t(
                "多種多様なモデルが搭載済み！",
                "A Wide Range of Models Available!",
              )}
              <br />
              {t("グラビアからアニメ系まで！", "From Gravure to Anime Styles!")}
            </p>
            <img
              alt={t("models", "models")}
              className="w-full"
              src="https://assets.aipictors.com/generation-models-2_11zon.webp"
            />
          </section>
        </div>
        <section className="p-2">
          <p className="text-left font-bold text-4xl">
            {t(
              "イラスト、リアル系まで生成できるジャンルは無限大！",
              "Generate Everything from Illustrations to Realistic Styles!",
            )}
          </p>
          <div className="rounded-md p-4">
            <Carousel className="m-auto">
              <CarouselContent>
                <CarouselItem className="basis-1/3">
                  <img
                    src="https://assets.aipictors.com/ff478cc0-35ad-12f8-d945-2511b5a49bd8_11zon.webp"
                    alt={t("参考画像1", "Sample Image 1")}
                    className="rounded-md"
                  />
                </CarouselItem>
                <CarouselItem className="basis-1/3">
                  <img
                    src="https://assets.aipictors.com/c068adee-e0c4-efa2-c7cf-739cc6df900c_11zon.webp"
                    alt={t("参考画像2", "Sample Image 2")}
                    className="rounded-md"
                  />
                </CarouselItem>
                <CarouselItem className="basis-1/3">
                  <img
                    src="https://assets.aipictors.com/5039b249-9672-b8a6-45f1-954c7a6512ae_11zon.webp"
                    alt={t("参考画像3", "Sample Image 3")}
                    className="rounded-md"
                  />
                </CarouselItem>
                <CarouselItem className="basis-1/3">
                  <img
                    src="https://assets.aipictors.com/b270cd3b-06a6-6e86-f74f-371800ecb57b_11zon.webp"
                    alt={t("参考画像4", "Sample Image 4")}
                    className="rounded-md"
                  />
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>
        </section>
        <Separator />
        <p className="text-center font-bold text-xl">
          {t("よくあるご質問", "Frequently Asked Questions")}
        </p>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              {t("料金プランが知りたい", "Want to Know the Pricing Plans?")}
            </AccordionTrigger>
            <AccordionContent>
              <Link to={"/generation/plans"}>
                {t("料金プランの詳細はこちら", "Details on Pricing Plans Here")}
              </Link>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              {t(
                "LINE認証がうまくいかない",
                "Having Trouble with LINE Authentication?",
              )}
            </AccordionTrigger>
            <AccordionContent>
              {t(
                "LINE認証がうまくいかない場合は、お手数ですが、サポートまでお問い合わせください。",
                "If you're having trouble with LINE authentication, please feel free to contact support.",
              )}
              <Link to="/support/chat">
                {t("サポートへのお問い合わせはこちら", "Contact Support Here")}
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-center gap-x-2 py-4">
          <Link to="/generation/terms">
            {t("利用規約", "Terms of Service")}
          </Link>
          <Link to="/specified-commercial-transaction-act">
            {t(
              "特定商取引法に基づく表記",
              "Specified Commercial Transaction Act",
            )}
          </Link>
        </div>
      </main>
    </>
  )
}
