/**
 * ガチャの効果音。音のファイルは読まず、Web Audio でその場で鳴らす（回線に負担をかけない）。
 * 音を消す設定は端末に覚えておく
 */

const MUTE_KEY = "gacha-sound-muted"

let context: AudioContext | null = null

const audio = () => {
  if (typeof window === "undefined" || gachaSound.isMuted()) return null
  if (!context) {
    const Context =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Context) return null
    context = new Context()
  }
  if (context.state === "suspended") void context.resume()
  return context
}

/** 音をひとつ鳴らす（周波数を from → to に動かす） */
const tone = (options: {
  from: number
  to?: number
  duration: number
  type?: OscillatorType
  volume?: number
  delay?: number
}) => {
  const ctx = audio()
  if (!ctx) return
  const start = ctx.currentTime + (options.delay ?? 0)
  const end = start + options.duration
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = options.type ?? "sine"
  osc.frequency.setValueAtTime(options.from, start)
  if (options.to) osc.frequency.exponentialRampToValueAtTime(options.to, end)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(options.volume ?? 0.2, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(end + 0.02)
}

/** ざっという音（爆発の厚み） */
const noise = (duration: number, volume: number, delay = 0) => {
  const ctx = audio()
  if (!ctx) return
  const length = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 1800
  const gain = ctx.createGain()
  gain.gain.value = volume
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start(ctx.currentTime + delay)
}

/** ド・ミ・ソ… の上がっていく音 */
const arpeggio = (notes: number[], step: number, volume = 0.14) => {
  notes.forEach((note, i) =>
    tone({
      from: note,
      duration: 0.35,
      type: "triangle",
      volume,
      delay: i * step,
    }),
  )
}

export const gachaSound = {
  isMuted: () => {
    try {
      return localStorage.getItem(MUTE_KEY) === "1"
    } catch {
      return false
    }
  },
  setMuted: (muted: boolean) => {
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0")
    } catch {}
  },
  /** 玉が落ちてくる */
  drop: () => tone({ from: 900, to: 300, duration: 0.35, type: "triangle" }),
  /** 力をためる（だんだん高く） */
  charge: (seconds: number) => {
    tone({
      from: 120,
      to: 900,
      duration: seconds,
      type: "sawtooth",
      volume: 0.06,
    })
    tone({ from: 240, to: 1800, duration: seconds, type: "sine", volume: 0.08 })
  },
  /** 色が化ける */
  promote: () => arpeggio([784, 988, 1175, 1568], 0.06, 0.16),
  /** 大爆発 */
  burst: (big: boolean) => {
    noise(big ? 1.2 : 0.8, big ? 0.5 : 0.35)
    tone({ from: 160, to: 40, duration: 0.7, type: "sine", volume: 0.5 })
    arpeggio(
      big ? [523, 659, 784, 1047, 1319, 1568] : [523, 659, 784, 1047],
      0.07,
    )
  },
  /** カットイン */
  cutIn: () => {
    tone({ from: 400, to: 2400, duration: 0.25, type: "square", volume: 0.06 })
    arpeggio([1047, 1319, 1568, 2093], 0.05, 0.12)
  },
  /** カードを配る */
  deal: (count: number) => {
    for (let i = 0; i < count; i++) noise(0.05, 0.12, i * 0.045)
  },
  /** カードをめくる（レア度が高いほど高く・厚く） */
  flip: (rank: number) => {
    if (rank <= 1) {
      tone({
        from: 700 + rank * 200,
        to: 1100,
        duration: 0.09,
        type: "triangle",
        volume: 0.12,
      })
      return
    }
    if (rank === 2) {
      arpeggio([880, 1175, 1568], 0.05)
      return
    }
    noise(0.6, 0.3)
    tone({ from: 140, to: 50, duration: 0.5, volume: 0.4 })
    arpeggio(
      rank >= 4
        ? [784, 988, 1175, 1568, 1976, 2349, 3136]
        : [659, 880, 1047, 1319, 1760],
      0.06,
      0.16,
    )
  },
  /** SSR 以上をめくる前のため */
  tension: (seconds: number) =>
    tone({
      from: 200,
      to: 1600,
      duration: seconds,
      type: "sawtooth",
      volume: 0.07,
    }),
}
