/**
 * 作品の公開プロンプトを、生成のトップの入力欄に入れる形にする
 * - LoRA などの指定（<lora:名前:1>）は外す（使える LoRA は人によって違うので、詳細画面で選んでもらう）
 * - 外したあとに残る空の区切り・余分な空白をまとめる
 */
export function toHomeExamplePrompt(prompt: string): string {
  return prompt
    .replace(/<(?:lora|lyco|hypernet|embedding):[^>]*>/gi, "")
    .replace(/[ \t]+/g, " ")
    .split(/\r?\n/)
    .map((line) =>
      line
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part !== "")
        .join(", "),
    )
    .filter((line) => line !== "")
    .join("\n")
    .trim()
}
