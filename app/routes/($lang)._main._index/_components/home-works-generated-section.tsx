import {} from "@/_components/ui/tooltip"
import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"

type Props = {
  works: NonNullable<WorksQuery["works"]> | null
}

/**
 * 生成された作品セクション
 */
export const HomeWorksGeneratedSection = (props: Props) => {
  const works = [...(props?.works || [])]

  // ランダムから 16 作品を取得
  const randomWorks = works.sort(() => Math.random() - 0.5).slice(0, 8)

  const sections = [
    { title: "作品を選んで無料生成", works: randomWorks, tooltip: "" },
  ]

  return (
    <>
      {sections.map((section) => (
        <HomeWorkSection
          key={section.title}
          title={section.title}
          tooltip={section.tooltip ? section.tooltip : undefined}
          works={section.works ?? null}
          link="https://www.aipictors.com/search/?promptstatus=2&order=favorite"
        />
      ))}
    </>
  )
}
