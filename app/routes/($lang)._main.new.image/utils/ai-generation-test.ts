/**
 * AI生成機能のテスト用デモファイル
 *
 * このファイルは開発時のテスト目的で作成されており、
 * 実際の本番環境では使用されません。
 */

import {
  canUseAiGeneration,
  consumeAiGenerationUsage,
} from "./ai-generation-usage"

/**
 * 利用制限機能のテスト
 */
export function testUsageLimitFeature() {
  console.log("=== AI生成機能 利用制限テスト ===")

  // 現在の利用状況を表示
  console.log(`利用可能: ${canUseAiGeneration()}`)

  // 利用回数を消費してテスト
  if (canUseAiGeneration()) {
    console.log("利用回数を1回消費します...")
    const success = consumeAiGenerationUsage()
    console.log(`消費結果: ${success}`)
    console.log(`消費後の利用可能性: ${canUseAiGeneration()}`)
  } else {
    console.log("利用上限に達しているため、消費できません")
  }

  console.log("=== テスト完了 ===")
}

/**
 * ブラウザコンソールでテストを実行するためのグローバル関数
 *
 * 使用方法:
 * 1. ブラウザの開発者ツールを開く
 * 2. コンソールタブに移動
 * 3. `window.testAiGeneration()` を実行
 */
if (typeof window !== "undefined") {
  ;(window as unknown as Record<string, unknown>).testAiGeneration =
    testUsageLimitFeature
}
