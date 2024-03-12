import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { GenerationNegativePromptView } from "@/app/[lang]/generation/_components/editor-negative-prompt-view/generation-negative-prompt-view"
import { GenerationPromptView } from "@/app/[lang]/generation/_components/editor-prompt-view/generation-prompt-view"
import { GenerationSubmissionView } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-view"
import { GenerationTaskContentPreview } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-content-preview"
import { GenerationTaskDetailsView } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-details-view"
import { GenerationTaskListView } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list-view"
import { GenerationAsideView } from "@/app/[lang]/generation/_components/generation-view/generation-aside-view"
import { GenerationHeaderView } from "@/app/[lang]/generation/_components/generation-view/generation-header-view"
import { GenerationMainView } from "@/app/[lang]/generation/_components/generation-view/generation-main-view"
import { GenerationView } from "@/app/[lang]/generation/_components/generation-view/generation-view"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"

/**
 * 画像生成
 * @returns
 */
const GenerationPage = async () => {
  /**
   * 利用規約
   */
  const termsMarkdownText = await readFile(
    join(process.cwd(), "assets/image-generation-terms.md"),
    "utf-8",
  )

  /**
   * 説明
   */
  // const descriptionMarkdownText = await readFile(
  //   join(process.cwd(), "assets/image-generation-description.md"),
  //   "utf-8",
  // )

  return (
    <GenerationView
      header={
        <GenerationHeaderView
          submission={
            <GenerationSubmissionView termsText={termsMarkdownText} />
          }
        />
      }
      aside={
        <GenerationAsideView
          advertising={
            <Link href="/plus" className="block sm:hidden mb-4">
              <Image
                className="w-full border mb-4 rounded-md"
                src="https://www.aipictors.com/wp-content/themes/AISite/images/banner/aipictors-plus-sp-banner.webp"
                alt="Aipictors+"
                width={40}
                height={40}
              />
            </Link>
          }
          taskList={<GenerationTaskListView />}
          taskDetails={<GenerationTaskDetailsView />}
        />
      }
      main={
        <GenerationMainView
          config={<GenerationConfigView />}
          promptEditor={<GenerationPromptView />}
          negativePromptEditor={<GenerationNegativePromptView />}
          taskContentPreview={<GenerationTaskContentPreview />}
          taskDetails={<GenerationTaskDetailsView />}
        />
      }
    />
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

const GenerationConfigView = dynamic(
  () => {
    return import(
      "@/app/[lang]/generation/_components/editor-config-view/generation-config-view"
    )
  },
  { ssr: false },
)

export default GenerationPage
