import { GenerationTermsButton } from "@/routes/($lang).generation._index/components/submission-view/generation-terms-button"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/generation-terms-button",
  component: GenerationTermsButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof GenerationTermsButton>

export default meta

type Story = StoryObj<typeof GenerationTermsButton>

const text = `生成機能では、以下の利用は禁止されております。

- 法的な観点より性器または性器を連想する部位（スジの表現を含む）、性器結合部位及び挿入部位、アヌス結合部位及び挿入部位の無修正画像（AIにより当該部位に修正がされたものを含む）の生成を行わないで下さい。イラスト・リアルに関わらず無修正画像は禁止です。
- 複数アカウントでの生成利用は禁止です。
- 児童ポルノと誤認される恐れのある画像の生成は禁止です。リアルな作風で、18歳未満に見える性的表現を含んだ生成は禁止です。
- 性的描写を含むリアルな作風で、学生服や、背景が学校であるなど、児童ポルノと疑われる可能性がある表現を含んだ生成は禁止です。
- 性的表現には、水着、肌の露出の多い衣装、えっちなポーズ、精液等の描写も含まれます。
- AIにより上記の禁止事項が生成されないようにプロンプトを指定いただくようお願いいたします。性的な描写を含む可能性が高く心配な場合は、イラスト系のモデルをご利用下さい。
- 生成結果は手動削除されたもの含めすべてチェックされ、不適切な利用が確認された場合は利用を停止させていただきます。`

export const Default: Story = {
  args: {
    termsMarkdownText: text,
    isLoading: false,
  },
}
