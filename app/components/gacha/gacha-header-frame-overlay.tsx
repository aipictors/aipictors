/**
 * プロフィールのヘッダー画像に重ねるガチャのヘッダー枠。
 * 画像は PC 3:1（1200×400）とスマホ 5:2（1000×400）で、ヘッダーの比率と同じ。
 * 止まった絵（base）の上に、ほとんど透明な動く絵（motion）を重ねる。動きを減らす設定の人には動く絵を出さない
 */
export function GachaHeaderFrameOverlay(props: { slug: string }) {
  const base = `/header-frames/${props.slug}`
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <picture>
        <source media="(min-width: 768px)" srcSet={`${base}.pc.webp`} />
        <img
          src={`${base}.sp.webp`}
          alt=""
          className="absolute inset-0 size-full object-fill"
          decoding="async"
        />
      </picture>
      <picture className="motion-reduce:hidden">
        <source media="(min-width: 768px)" srcSet={`${base}.pc.motion.webp`} />
        <img
          src={`${base}.sp.motion.webp`}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-fill"
          decoding="async"
        />
      </picture>
    </div>
  )
}
