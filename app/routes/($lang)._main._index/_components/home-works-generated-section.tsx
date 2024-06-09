import {} from "@/_components/ui/tooltip"
import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  works: NonNullable<WorksQuery["works"]> | null
}

/**
 * 生成された作品セクション
 */
export const HomeWorksGeneratedSection = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const works = [...(props?.works || [])]

  // ランダムから 16 作品を取得
  const randomWorks = works.sort(() => Math.random() - 0.5).slice(0, 16)

  if (randomWorks.length === 0) {
    return null
  }

  const sections = [
    { title: "作品を選んで無料生成", works: randomWorks, tooltip: "" },
  ]

  return (
    <>
      {sections.map((section, index) => (
        <HomeWorkSection
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          title={section.title}
          tooltip={section.tooltip ? section.tooltip : undefined}
          works={section.works ?? null}
          link="https://www.aipictors.com/search/?promptstatus=2&order=favorite"
          isCropped={!isDesktop}
        />
      ))}
    </>
  )
}
