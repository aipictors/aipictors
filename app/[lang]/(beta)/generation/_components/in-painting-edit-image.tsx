"use client"

import { PainterCanvas } from "@/app/[lang]/(beta)/generation/_components/painter/painter-canvas"

type Props = {
  imageUrl: string
  onChange(value: string): void
}

/**
 * Konvaを使った画像編集コンポーネント
 * @param props
 * @returns
 */
export default function InPaintingEditImage(props: Props) {
  return (
    <>
      <PainterCanvas
        status={"reverse-draw"}
        onChange={props.onChange}
        imageUrl={props.imageUrl}
      />
    </>
  )
}
