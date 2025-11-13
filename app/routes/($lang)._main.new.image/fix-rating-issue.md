# 年齢制限設定の問題修正案

## 問題の詳細

全年齢で投稿したはずが、リトライ後にR18Gになってしまう問題。

## 根本原因

1. `inputState.ratingRestriction`の初期値が`null`
2. TypeScript型アサーションによる強制キャスト
3. リトライ処理で状態が予期せず変更される可能性

## 修正案

### 1. 初期値の変更

```tsx
// 現在
ratingRestriction: null,

// 修正後
ratingRestriction: "G" as IntrospectionEnum<"Rating">,
```

### 2. 型安全なratingの設定

```tsx
// 現在（危険）
rating: inputState.ratingRestriction as
  | "G"
  | "R15"
  | "R18"
  | "R18G",

// 修正後（安全）
rating: inputState.ratingRestriction || "G",
```

### 3. デバッグログの追加

投稿処理でratingの値をコンソールに出力して問題を追跡：

```tsx
console.log("投稿時のrating:", inputState.ratingRestriction)
console.log("リトライ回数:", retryCount)
```

### 4. nullチェックの強化

```tsx
if (inputState.ratingRestriction === null || inputState.ratingRestriction === undefined) {
  toast(t("年齢制限を選択してください", "Please select an age restriction"))
  return
}
```

## 実装手順

1. `post-image-form-input-reducer.tsx`の初期値を"G"に変更
2. 投稿処理のratingフィールドの型安全性を向上
3. デバッグログを追加して問題の追跡を可能にする
4. nullチェックをより厳密にする