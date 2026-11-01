import type { ComponentProps } from "react"
import { ThemeContainer } from "~/routes/($lang)._main.themes._index/components/theme-container"

type Props = Omit<ComponentProps<typeof ThemeContainer>, "isSensitive">

/**
 * センシティブ（/r/themes）のお題ページ
 */
export function SensitiveThemeContainer(props: Props) {
  return <ThemeContainer {...props} isSensitive={true} />
}
