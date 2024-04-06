"use client"

import { GenerationAdvertisementView } from "@/[lang]/generation/_components/advertisement-view/generation-advertisement-view"
import { GenerationSideTabsView } from "@/[lang]/generation/_components/generation-side-tabs-view/generation-side-tabs-view"
import { GenerationAsideView } from "@/[lang]/generation/_components/generation-view/generation-aside-view"
import { GenerationHeaderView } from "@/[lang]/generation/_components/generation-view/generation-header-view"
import { GenerationMainView } from "@/[lang]/generation/_components/generation-view/generation-main-view"
import { GenerationView } from "@/[lang]/generation/_components/generation-view/generation-view"
import { GenerationNegativePromptView } from "@/[lang]/generation/_components/negative-prompt-view/generation-negative-prompt-view"
import { GenerationPromptView } from "@/[lang]/generation/_components/prompt-view/generation-prompt-view"
import { GenerationSubmissionView } from "@/[lang]/generation/_components/submission-view/generation-submit-view"
import { GenerationCommunicationView } from "@/[lang]/generation/_components/task-view/generation-communication-view"
import { GenerationTaskContentPreview } from "@/[lang]/generation/_components/task-view/generation-task-content-preview"
import { GenerationTaskDetailsView } from "@/[lang]/generation/_components/task-view/generation-task-details-view"
import { GenerationTaskListView } from "@/[lang]/generation/_components/task-view/generation-task-list-view"
import { GenerationWorkContentPreview } from "@/[lang]/generation/_components/task-view/generation-work-content-preview"
import { GenerationWorkListModelView } from "@/[lang]/generation/_components/task-view/generation-works-from-model-view"
import { loginWithWordPressTokenMutation } from "@/_graphql/mutations/login-with-wordpress-token"
import { useMutation } from "@apollo/client"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { useState } from "react"

type Props = {
  termsMarkdownText: string
}

/**
 * 画像生成
 * @returns
 */
export const GenerationForm = (props: Props) => {
  const [rating, setRating] = useState(-1)

  const [protect, setProtect] = useState(-1)

  const [isEditMode, toggleEditMode] = useState(false)

  const [isPreviewMode, togglePreviewMode] = useState(false)

  const [mutation, { loading: isLoading }] = useMutation(
    loginWithWordPressTokenMutation,
  )

  return (
    <GenerationView
      header={
        <GenerationHeaderView
          submission={
            <GenerationSubmissionView termsText={props.termsMarkdownText} />
          }
        />
      }
      main={
        <GenerationMainView
          config={<GenerationConfigView />}
          promptEditor={<GenerationPromptView />}
          negativePromptEditor={<GenerationNegativePromptView />}
          taskContentPreview={<GenerationTaskContentPreview />}
          taskDetails={<GenerationTaskDetailsView />}
          workContentPreview={<GenerationWorkContentPreview />}
        />
      }
      asideHeader={<GenerationSideTabsView />}
      aside={
        <GenerationAsideView
          advertisement={<GenerationAdvertisementView />}
          taskList={
            <GenerationTaskListView
              rating={rating}
              protect={protect}
              isEditMode={isEditMode}
              isPreviewMode={isPreviewMode}
              setRating={setRating}
              setProtect={setProtect}
              toggleEditMode={toggleEditMode}
              togglePreviewMode={togglePreviewMode}
            />
          }
          taskDetails={<GenerationTaskDetailsView />}
          workListFromModel={<GenerationWorkListModelView />}
          communication={<GenerationCommunicationView />}
        />
      }
    />
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "画像生成",
  description:
    "簡単に高品質なAI画像生成を行うことができます、1日無料30枚でたくさん生成できます",
}

export const revalidate = 10

const GenerationConfigView = dynamic(
  () => {
    return import(
      "@/[lang]/generation/_components/config-view/generation-config-view"
    )
  },
  { ssr: false },
)
