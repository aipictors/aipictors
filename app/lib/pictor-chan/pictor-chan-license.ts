/**
 * ぴくたーちゃんライセンス（3D モデルなどの配布データの利用条件）。
 * ページ（/pictor-chan/license）と、配布ファイルに入れる LICENSE.txt の両方をここから作る
 */

export const PICTOR_CHAN_LICENSE_VERSION = "1.0"
export const PICTOR_CHAN_LICENSE_DATE = "2026-11-14"
export const PICTOR_CHAN_LICENSE_URL =
  "https://www.aipictors.com/pictor-chan/license"
/** 作品に入れてもらう表記 */
export const PICTOR_CHAN_CREDIT = "© Aipictors / ぴくたーちゃん"

type Section = Readonly<{
  title: string
  paragraphs?: readonly string[]
  items?: readonly string[]
}>

type LicenseText = Readonly<{
  name: string
  lead: readonly string[]
  sections: readonly Section[]
}>

export const PICTOR_CHAN_LICENSE_JA: LicenseText = {
  name: "ぴくたーちゃんライセンス条項 Version 1.0",
  lead: [
    "Aipictors株式会社（以下「当社」）は、当社の公式マスコットキャラクター「ぴくたーちゃん」をたくさんの方に楽しんで使っていただくために、当社が配布する 3D モデルなどのデータ（以下「本データ」）を、この条項（以下「本ライセンス」）のもとで無償で提供します。",
    "本データをダウンロードまたは利用した時点で、本ライセンスに同意したものとみなします。",
  ],
  sections: [
    {
      title: "第1条（対象）",
      paragraphs: [
        "本ライセンスの対象は、当社が「ぴくたーちゃんライセンス」を適用すると明示して配布する、ぴくたーちゃんの 3D モデル・テクスチャ・モーションなどのデータです。Aipictors のロゴ・サービス名・サイトのデザインは対象に含みません。",
      ],
    },
    {
      title: "第2条（できること）",
      paragraphs: [
        "個人・法人を問わず、また商用・非商用を問わず、次のことを無償で、申請なしで行えます。",
      ],
      items: [
        "本データを使ったゲーム・アプリ・動画・配信・イラスト・漫画・VR / AR コンテンツ・グッズ・印刷物・3D プリント作品などを作り、公開・配布・販売すること",
        "本データを改変すること（衣装・表情・モーションの追加、形式の変換、軽量化など）",
        "改変した本データを、本ライセンスを付けて再配布すること",
        "配信・動画でのアバターとして使うこと",
      ],
    },
    {
      title: "第3条（守ってほしいこと）",
      items: [
        `作品の中やその説明など、わかりやすい場所に「${PICTOR_CHAN_CREDIT}」と表記してください。表記が難しい場合（グッズの表面など）は、パッケージや販売ページなど、できる範囲の場所でかまいません。`,
        "本データ（改変したものを含む）を再配布するときは、本ライセンスの全文またはその URL を添え、改変した場合は改変したことがわかるようにしてください。",
        "当社の公式の作品・公認の作品であると誤解される表現はしないでください。",
      ],
    },
    {
      title: "第4条（してはいけないこと）",
      items: [
        "法令に違反する利用、公序良俗に反する利用",
        "性的に露骨な表現、過度に暴力的・残虐な表現への利用",
        "特定の個人・団体・国・人種・宗教などを誹謗中傷・差別する利用",
        "政治活動・宗教活動・選挙運動への利用",
        "ぴくたーちゃんや当社の評判・イメージを著しく損なう利用",
        "本データそのもの、またはほとんど手を加えていない本データを、単体で販売すること",
        "本データを NFT などの形で、独占的な権利があるかのように販売すること",
        "本データに含まれる著作権表示や本ライセンスの表示を取り除くこと",
      ],
    },
    {
      title: "第5条（権利）",
      paragraphs: [
        "本データおよび「ぴくたーちゃん」に関する著作権その他の権利は、当社に帰属します。本ライセンスは、これらの権利を譲渡するものではありません。",
        "本データを使って作った作品のうち、利用者が新しく作った部分の権利は、その利用者に帰属します。",
      ],
    },
    {
      title: "第6条（保証と責任）",
      paragraphs: [
        "本データは現状のまま提供します。当社は、本データに不具合がないこと、特定の目的に合うこと、第三者の権利を侵害しないことなどについて、いかなる保証もしません。",
        "本データの利用によって利用者または第三者に生じた損害について、当社は、当社に故意または重大な過失がある場合を除き、責任を負いません。",
      ],
    },
    {
      title: "第7条（違反したとき）",
      paragraphs: [
        "本ライセンスに違反した場合、当社は利用の中止や、作品の公開・配布の停止を求めることができます。違反が解消されないときは、その利用者に対する許諾は終了します。",
      ],
    },
    {
      title: "第8条（変更）",
      paragraphs: [
        "当社は、本ライセンスの内容を変更することがあります。変更後の内容は、このページに掲載した時点から、その後の利用に適用します。すでに公開されている作品に、さかのぼって不利な条件を適用することはしません。",
      ],
    },
    {
      title: "第9条（準拠法・管轄）",
      paragraphs: [
        "本ライセンスは日本法に準拠します。本ライセンスに関する紛争は、当社の本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。",
      ],
    },
    {
      title: "判断に迷ったとき",
      paragraphs: [
        "使ってよいか迷う場合や、本ライセンスの範囲を超える利用をしたい場合は、Aipictors のお問い合わせからご相談ください。",
      ],
    },
  ],
}

export const PICTOR_CHAN_LICENSE_EN: LicenseText = {
  name: "Pictor-chan License Terms Version 1.0 (reference translation)",
  lead: [
    'Aipictors Inc. ("we") provides the data we distribute for our official mascot character "Pictor-chan", such as 3D models (the "Data"), free of charge under these terms (the "License"), so that many people can enjoy using her.',
    "By downloading or using the Data, you agree to this License. The Japanese text is the authoritative version; this translation is for reference.",
  ],
  sections: [
    {
      title: "1. Scope",
      paragraphs: [
        "This License covers Pictor-chan 3D models, textures, motions and other data that we distribute and explicitly mark as licensed under the Pictor-chan License. It does not cover the Aipictors logo, service name or site design.",
      ],
    },
    {
      title: "2. What you may do",
      paragraphs: [
        "Individuals and companies alike may do the following free of charge, for commercial or non-commercial purposes, without asking us:",
      ],
      items: [
        "Create, publish, distribute and sell games, apps, videos, streams, illustrations, comics, VR / AR content, merchandise, printed matter, 3D prints and other works that use the Data",
        "Modify the Data (add outfits, expressions or motions, convert formats, optimise it, and so on)",
        "Redistribute modified Data under this License",
        "Use it as an avatar for streaming and videos",
      ],
    },
    {
      title: "3. What we ask of you",
      items: [
        `Show the credit "${PICTOR_CHAN_CREDIT}" somewhere easy to find in your work or its description. Where that is impractical (for example on the surface of merchandise), the packaging or the sales page is fine.`,
        "When you redistribute the Data (including modified Data), include the full text of this License or its URL, and make it clear if you modified it.",
        "Do not present your work as an official or officially approved Aipictors work.",
      ],
    },
    {
      title: "4. What you may not do",
      items: [
        "Use that violates laws or regulations, or that is contrary to public order and morals",
        "Use in sexually explicit content, or in excessively violent or cruel content",
        "Use that defames or discriminates against any person, group, country, race or religion",
        "Use for political activity, religious activity or election campaigning",
        "Use that seriously damages the reputation or image of Pictor-chan or Aipictors",
        "Selling the Data itself, or the Data with only trivial changes, as a stand-alone product",
        "Selling the Data as an NFT or similar as if it carried exclusive rights",
        "Removing copyright notices or this License notice contained in the Data",
      ],
    },
    {
      title: "5. Rights",
      paragraphs: [
        "Copyright and all other rights in the Data and in Pictor-chan belong to us. This License does not transfer those rights.",
        "Rights in the parts of your work that you newly created belong to you.",
      ],
    },
    {
      title: "6. Warranty and liability",
      paragraphs: [
        "The Data is provided as is. We make no warranty of any kind, including that the Data is free of defects, fit for a particular purpose, or non-infringing.",
        "We are not liable for damage arising from use of the Data, except where it is caused by our wilful misconduct or gross negligence.",
      ],
    },
    {
      title: "7. Violations",
      paragraphs: [
        "If you violate this License, we may ask you to stop the use or to stop publishing or distributing the work. If the violation is not resolved, your permission under this License ends.",
      ],
    },
    {
      title: "8. Changes",
      paragraphs: [
        "We may change this License. The changed terms apply to use after they are posted on this page. We will not apply less favourable terms retroactively to works that are already published.",
      ],
    },
    {
      title: "9. Governing law and jurisdiction",
      paragraphs: [
        "This License is governed by the laws of Japan. The court with jurisdiction over the location of our head office is the exclusive court of first instance for disputes concerning this License.",
      ],
    },
    {
      title: "If you are unsure",
      paragraphs: [
        "If you are unsure whether a use is allowed, or want to use the Data beyond this License, please contact us through the Aipictors contact form.",
      ],
    },
  ],
}

/** 配布ファイルに入れる LICENSE.txt の本文 */
export const toPictorChanLicensePlainText = (): string => {
  const lines: string[] = []
  for (const text of [PICTOR_CHAN_LICENSE_JA, PICTOR_CHAN_LICENSE_EN]) {
    lines.push(text.name, "", ...text.lead, "")
    for (const section of text.sections) {
      lines.push(section.title)
      for (const paragraph of section.paragraphs ?? []) lines.push(paragraph)
      for (const item of section.items ?? []) lines.push(`- ${item}`)
      lines.push("")
    }
    lines.push("----------------------------------------", "")
  }
  lines.push(
    `${PICTOR_CHAN_LICENSE_DATE}  Aipictors株式会社 / Aipictors Inc.`,
    PICTOR_CHAN_LICENSE_URL,
    "",
  )
  return lines.join("\n")
}
