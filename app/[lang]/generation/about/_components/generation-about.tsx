"use client"

import { GlowingGradientBorderButton } from "@/app/_components/button/glowing-gradient-border-button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"

/**
 * 画像生成についての説明
 * @returns
 */
export const GenerationAbout = () => {
  return (
    <main className="relative w-full">
      <div
        style={{
          backgroundImage:
            "url('https://www.aipictors.com/wp-content/uploads/2024/03/generation-header-image.webp')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
        className="relative m-auto h-32 rounded-md"
      >
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform whitespace-nowrap text-center font-bold text-4xl text-white">
          <h1>{"AI画像生成サービス"}</h1>
          <h2>{"1日30枚無料！"}</h2>
        </div>
      </div>
      <Link href={"/generation"} className={"m-auto mt-8 mb-8 block w-64"}>
        <GlowingGradientBorderButton
          onClick={() => {}}
          className={"m-auto mb-8 block w-64"}
          children={"無料生成してみる！"}
        />
      </Link>
      <Separator />
      <section className="p-2">
        <p className="mt-4 text-center font-bold text-xl">
          イラスト、リアル系まで生成できるジャンルは無限大！
        </p>
        <div className="rounded-md p-4">
          <Carousel className="m-auto">
            <CarouselContent>
              <CarouselItem className="basis-1/3">
                <Image
                  src="https://www.aipictors.com/wp-content/uploads/2024/03/image-generation-sample-0.webp"
                  alt="参考画像1"
                  className="rounded-md"
                  width={640}
                  height={640}
                />
              </CarouselItem>
              <CarouselItem className="basis-1/3">
                <Image
                  src="https://www.aipictors.com/wp-content/uploads/2024/03/image-generation-sample-1.webp"
                  alt="参考画像2"
                  className="rounded-md"
                  width={640}
                  height={640}
                />
              </CarouselItem>
              <CarouselItem className="basis-1/3">
                <Image
                  src="https://www.aipictors.com/wp-content/uploads/2024/03/image-generation-sample-2.webp"
                  alt="参考画像3"
                  className="rounded-md"
                  width={640}
                  height={640}
                />
              </CarouselItem>
              <CarouselItem className="basis-1/3">
                <Image
                  src="https://www.aipictors.com/wp-content/uploads/2024/03/image-generation-sample-3.webp"
                  alt="参考画像4"
                  className="rounded-md"
                  width={640}
                  height={640}
                />
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </section>
      <Separator />
      <section className="p-2">
        <p className="mt-4 text-center font-bold text-xl">
          どこでもいつでも簡単に生成できる！
        </p>
        <img
          className="auto"
          alt="参考生成画面"
          src="https://www.aipictors.com/wp-content/uploads/2024/03/generation-cover.webp"
        />
      </section>
    </main>
  )
}
