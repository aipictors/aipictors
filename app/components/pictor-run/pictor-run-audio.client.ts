/**
 * 「ぴくたーちゃんラン」の BGM と効果音。
 * 音はすべてその場で合成するので、読み込むファイルは増えない。
 * BGM はステージごとに、調・速さ・音色・進行を変えて自動で組み立てる
 */

export type PictorRunSound = {
  /** BGM の音量 0〜1 */
  bgm: number
  /** 効果音の音量 0〜1 */
  sfx: number
  muted: boolean
}

export type PictorRunSoundName =
  | "start"
  | "jump"
  | "double"
  | "land"
  | "coin"
  | "hit"
  | "stage"
  | "best"
  | "ui"

export type PictorRunAudio = {
  /** ボタンを押したときなどに呼んで、音を出せる状態にする */
  unlock: () => void
  set: (sound: PictorRunSound) => void
  /** ステージの曲に変える（小節の切れ目で切り替わる） */
  setSong: (index: number) => void
  /** BGM を止める */
  stop: () => void
  /** 毎コマ呼ぶ（少し先の音まで予約する） */
  tick: () => void
  /** value = コインを続けて取った数（音が高くなる） */
  play: (name: PictorRunSoundName, value?: number) => void
  dispose: () => void
}

/** [根音（調の主音からの半音数）, 1 = 短三和音] */
type Chord = readonly [number, 0 | 1]

type Song = {
  bpm: number
  /** 調の主音（MIDI の番号） */
  root: number
  scale: readonly number[]
  prog: readonly Chord[]
  lead: OscillatorType
  leadGain: number
  bass: OscillatorType
  arp: OscillatorType | null
  /** 0 = なし、1 = 軽い、2 = ポップ、3 = 4 つ打ち、4 = まばら */
  drums: 0 | 1 | 2 | 3 | 4
  /** BGM 全体にかけるこもり具合（Hz。低いほどこもる） */
  cutoff: number
  /** メロディのやまびこの量 */
  wet: number
  seed: number
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11]
const LYDIAN = [0, 2, 4, 6, 7, 9, 11]
const DORIAN = [0, 2, 3, 5, 7, 9, 10]
const MINOR = [0, 2, 3, 5, 7, 8, 10]
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11]
const PHRYGIAN_DOMINANT = [0, 1, 4, 5, 7, 8, 10]
/** 都節（さくらさくらの音階） */
const MIYAKO = [0, 2, 3, 7, 8]
/** 陽音階（わらべうたの音階） */
const YO = [0, 2, 5, 7, 9]

/** ステージと同じ並び */
const SONGS: Song[] = [
  // はじまりの草原
  {
    bpm: 132,
    root: 60,
    scale: MAJOR,
    prog: [
      [0, 0],
      [7, 0],
      [9, 1],
      [5, 0],
    ],
    lead: "square",
    leadGain: 0.11,
    bass: "triangle",
    arp: "triangle",
    drums: 2,
    cutoff: 9000,
    wet: 0.18,
    seed: 11,
  },
  // さくら並木
  {
    bpm: 108,
    root: 57,
    scale: MIYAKO,
    prog: [
      [0, 1],
      [8, 0],
      [0, 1],
      [7, 1],
    ],
    lead: "triangle",
    leadGain: 0.2,
    bass: "triangle",
    arp: "sine",
    drums: 1,
    cutoff: 6000,
    wet: 0.3,
    seed: 23,
  },
  // まぶしい海辺
  {
    bpm: 126,
    root: 65,
    scale: MAJOR,
    prog: [
      [0, 0],
      [5, 0],
      [7, 0],
      [0, 0],
    ],
    lead: "square",
    leadGain: 0.1,
    bass: "triangle",
    arp: "square",
    drums: 2,
    cutoff: 10000,
    wet: 0.15,
    seed: 37,
  },
  // 夕やけの砂漠
  {
    bpm: 102,
    root: 62,
    scale: PHRYGIAN_DOMINANT,
    prog: [
      [0, 0],
      [1, 0],
      [0, 0],
      [10, 1],
    ],
    lead: "sawtooth",
    leadGain: 0.09,
    bass: "triangle",
    arp: null,
    drums: 4,
    cutoff: 3200,
    wet: 0.32,
    seed: 41,
  },
  // きのこの森
  {
    bpm: 100,
    root: 64,
    scale: DORIAN,
    prog: [
      [0, 1],
      [5, 0],
      [0, 1],
      [10, 0],
    ],
    lead: "triangle",
    leadGain: 0.2,
    bass: "sine",
    arp: "sine",
    drums: 1,
    cutoff: 4200,
    wet: 0.38,
    seed: 53,
  },
  // 雪の村
  {
    bpm: 120,
    root: 67,
    scale: MAJOR,
    prog: [
      [0, 0],
      [9, 1],
      [5, 0],
      [7, 0],
    ],
    lead: "sine",
    leadGain: 0.24,
    bass: "triangle",
    arp: "sine",
    drums: 1,
    cutoff: 8000,
    wet: 0.34,
    seed: 67,
  },
  // 夜のネオン街
  {
    bpm: 124,
    root: 57,
    scale: MINOR,
    prog: [
      [0, 1],
      [8, 0],
      [3, 0],
      [10, 0],
    ],
    lead: "sawtooth",
    leadGain: 0.09,
    bass: "sawtooth",
    arp: "square",
    drums: 3,
    cutoff: 5200,
    wet: 0.26,
    seed: 71,
  },
  // おかしの国
  {
    bpm: 150,
    root: 67,
    scale: MAJOR,
    prog: [
      [0, 0],
      [5, 0],
      [7, 0],
      [0, 0],
    ],
    lead: "square",
    leadGain: 0.1,
    bass: "triangle",
    arp: "triangle",
    drums: 2,
    cutoff: 10000,
    wet: 0.12,
    seed: 83,
  },
  // 紅葉の里
  {
    bpm: 96,
    root: 64,
    scale: YO,
    prog: [
      [5, 0],
      [2, 1],
      [5, 0],
      [0, 0],
    ],
    lead: "triangle",
    leadGain: 0.2,
    bass: "triangle",
    arp: "sine",
    drums: 4,
    cutoff: 5000,
    wet: 0.34,
    seed: 97,
  },
  // 海の底
  {
    bpm: 92,
    root: 63,
    scale: LYDIAN,
    prog: [
      [0, 0],
      [2, 0],
      [0, 0],
      [9, 1],
    ],
    lead: "sine",
    leadGain: 0.24,
    bass: "sine",
    arp: "sine",
    drums: 4,
    cutoff: 1400,
    wet: 0.45,
    seed: 101,
  },
  // 溶岩の火山
  {
    bpm: 140,
    root: 50,
    scale: HARMONIC_MINOR,
    prog: [
      [0, 1],
      [8, 0],
      [7, 0],
      [0, 1],
    ],
    lead: "sawtooth",
    leadGain: 0.1,
    bass: "sawtooth",
    arp: "square",
    drums: 3,
    cutoff: 4200,
    wet: 0.15,
    seed: 113,
  },
  // 星の世界
  {
    bpm: 108,
    root: 60,
    scale: LYDIAN,
    prog: [
      [0, 0],
      [2, 0],
      [9, 1],
      [7, 0],
    ],
    lead: "triangle",
    leadGain: 0.18,
    bass: "sine",
    arp: "sine",
    drums: 4,
    cutoff: 6500,
    wet: 0.48,
    seed: 127,
  },
  // 空の美術館
  {
    bpm: 116,
    root: 62,
    scale: MAJOR,
    prog: [
      [0, 0],
      [7, 0],
      [9, 1],
      [4, 1],
      [5, 0],
      [0, 0],
      [5, 0],
      [7, 0],
    ],
    lead: "triangle",
    leadGain: 0.2,
    bass: "triangle",
    arp: "square",
    drums: 1,
    cutoff: 8000,
    wet: 0.3,
    seed: 131,
  },
]

/** 1 小節 = 16 コマ、1 曲 = 8 小節 */
const BAR = 16
const LOOP = BAR * 8

/** メロディのリズム（8 分音符 8 つのうち、鳴らすところ） */
const RHYTHMS = [
  [1, 0, 1, 1, 1, 0, 1, 0],
  [1, 0, 0, 1, 1, 0, 1, 1],
  [1, 1, 1, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 0, 0, 1],
]

type Note = { midi: number; steps: number }

const toFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

const createRandom = (seed: number) => {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

const triad = (song: Song, chord: Chord) =>
  [0, chord[1] === 1 ? 3 : 4, 7].map(
    (interval) => (song.root + chord[0] + interval) % 12,
  )

/**
 * その曲のメロディ（8 小節）。同じ動きの小節をくり返して、まとまりのある節にする
 */
const buildMelody = (song: Song): Map<number, Note> => {
  const random = createRandom(song.seed)
  const ladder: number[] = []
  for (let octave = -1; octave <= 1; octave++) {
    for (const interval of song.scale) {
      ladder.push(song.root + octave * 12 + interval)
    }
  }
  ladder.push(song.root + 24)

  const pickMove = () => {
    const value = random()
    if (value < 0.34) return 1
    if (value < 0.68) return -1
    if (value < 0.8) return 2
    if (value < 0.92) return -2
    return 0
  }
  const makePattern = () =>
    RHYTHMS[Math.floor(random() * RHYTHMS.length)].map((on) =>
      on === 1 ? pickMove() : null,
    )
  const a = makePattern()
  const b = makePattern()
  const c = makePattern()
  const d = makePattern()
  const order = [a, b, a, c, a, b, d, null]

  /** いちばん近い和音の音へ寄せる */
  const snap = (index: number, tones: number[]) => {
    for (let distance = 0; distance < ladder.length; distance++) {
      for (const candidate of [index + distance, index - distance]) {
        const midi = ladder[candidate]
        if (midi !== undefined && tones.includes(midi % 12)) return candidate
      }
    }
    return index
  }

  const notes = new Map<number, Note>()
  let index = song.scale.length
  for (let bar = 0; bar < order.length; bar++) {
    const chord = song.prog[bar % song.prog.length]
    const pattern = order[bar]
    if (pattern === null) {
      // 最後の小節は、和音の根音をのばして落ち着かせる
      index = snap(index, [(song.root + chord[0]) % 12])
      notes.set(bar * BAR, { midi: ladder[index], steps: 10 })
      continue
    }
    const tones = triad(song, chord)
    for (let slot = 0; slot < 8; slot++) {
      const move = pattern[slot]
      if (move === null) continue
      index = Math.min(ladder.length - 2, Math.max(1, index + move))
      if (slot === 0 || slot === 4) index = snap(index, tones)
      let gap = 1
      while (slot + gap < 8 && pattern[slot + gap] === null) gap += 1
      notes.set(bar * BAR + slot * 2, {
        midi: ladder[index],
        steps: Math.min(gap, 2) * 2,
      })
    }
  }
  return notes
}

const SILENT: PictorRunAudio = {
  unlock: () => {},
  set: () => {},
  setSong: () => {},
  stop: () => {},
  tick: () => {},
  play: () => {},
  dispose: () => {},
}

export function createPictorRunAudio(
  initial: PictorRunSound,
  options: { lite: boolean },
): PictorRunAudio {
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioContextClass) return SILENT

  let ctx: AudioContext
  try {
    ctx = new AudioContextClass()
  } catch {
    return SILENT
  }

  // 出口: 全体の音量（ミュート）→ 音割れを防ぐコンプレッサー
  const master = ctx.createGain()
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -14
  compressor.ratio.value = 6
  master.connect(compressor)
  compressor.connect(ctx.destination)

  const bgmBus = ctx.createGain()
  const bgmFilter = ctx.createBiquadFilter()
  bgmFilter.type = "lowpass"
  bgmFilter.frequency.value = 9000
  bgmBus.connect(bgmFilter)
  bgmFilter.connect(master)

  const sfxBus = ctx.createGain()
  sfxBus.connect(master)

  // メロディのやまびこ（軽量モードでは付けない）
  const leadBus = ctx.createGain()
  leadBus.connect(bgmBus)
  const wet = ctx.createGain()
  wet.gain.value = 0
  if (!options.lite) {
    const delay = ctx.createDelay(1)
    delay.delayTime.value = 0.29
    const feedback = ctx.createGain()
    feedback.gain.value = 0.34
    leadBus.connect(delay)
    delay.connect(feedback)
    feedback.connect(delay)
    delay.connect(wet)
    wet.connect(bgmBus)
  }

  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const noiseData = noiseBuffer.getChannelData(0)
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1
  }

  let disposed = false

  const apply = (sound: PictorRunSound) => {
    const now = ctx.currentTime
    master.gain.setTargetAtTime(sound.muted ? 0 : 1, now, 0.03)
    bgmBus.gain.setTargetAtTime(sound.bgm * 0.9, now, 0.05)
    sfxBus.gain.setTargetAtTime(sound.sfx * 1.2, now, 0.05)
  }
  master.gain.value = initial.muted ? 0 : 1
  bgmBus.gain.value = initial.bgm * 0.9
  sfxBus.gain.value = initial.sfx * 1.2

  /** 音を 1 つ鳴らす（to を渡すと、その高さへすべらせる） */
  const tone = (
    bus: AudioNode,
    type: OscillatorType,
    frequency: number,
    at: number,
    duration: number,
    gain: number,
    to?: number,
  ) => {
    const oscillator = ctx.createOscillator()
    const envelope = ctx.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, at)
    if (to !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(to, at + duration)
    }
    envelope.gain.setValueAtTime(0.0001, at)
    envelope.gain.linearRampToValueAtTime(gain, at + 0.006)
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration)
    oscillator.connect(envelope)
    envelope.connect(bus)
    oscillator.start(at)
    oscillator.stop(at + duration + 0.03)
  }

  const noise = (
    bus: AudioNode,
    filterType: BiquadFilterType,
    frequency: number,
    at: number,
    duration: number,
    gain: number,
  ) => {
    const source = ctx.createBufferSource()
    source.buffer = noiseBuffer
    const filter = ctx.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = frequency
    const envelope = ctx.createGain()
    envelope.gain.setValueAtTime(gain, at)
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration)
    source.connect(filter)
    filter.connect(envelope)
    envelope.connect(bus)
    source.start(at, Math.random() * 0.5, duration + 0.03)
  }

  // ---- BGM ------------------------------------------------------------------
  const melodies: (Map<number, Note> | undefined)[] = []
  const melodyOf = (index: number) => {
    let melody = melodies[index]
    if (!melody) {
      melody = buildMelody(SONGS[index])
      melodies[index] = melody
    }
    return melody
  }

  let current = -1
  let pending: number | null = null
  let step = 0
  let nextTime = 0

  const enter = (index: number, at: number) => {
    current = index
    step = 0
    const song = SONGS[index]
    bgmFilter.frequency.setTargetAtTime(song.cutoff, at, 0.25)
    wet.gain.setTargetAtTime(song.wet, at, 0.25)
  }

  const ARP_ORDER = [0, 1, 2, 3, 2, 1, 2, 1]

  const schedule = (song: Song, melody: Map<number, Note>, at: number) => {
    const stepTime = 60 / song.bpm / 4
    const position = step % LOOP
    const bar = Math.floor(position / BAR)
    const slot = position % BAR
    const chord = song.prog[bar % song.prog.length]
    const chordRoot = song.root + chord[0]

    const note = melody.get(position)
    if (note) {
      tone(
        leadBus,
        song.lead,
        toFrequency(note.midi),
        at,
        note.steps * stepTime * 0.92,
        song.leadGain,
      )
    }

    if (slot === 0 || slot === 6 || slot === 8 || slot === 14) {
      let bass = chordRoot + (slot === 8 ? 7 : 0)
      while (bass > 47) bass -= 12
      while (bass < 36) bass += 12
      tone(
        bgmBus,
        song.bass,
        toFrequency(bass),
        at,
        stepTime * (slot === 0 ? 5 : 2.4),
        song.bass === "sawtooth" ? 0.13 : 0.24,
      )
    }

    if (song.arp && !options.lite && slot % 2 === 0) {
      const tones = [0, chord[1] === 1 ? 3 : 4, 7, 12]
      const midi = chordRoot + 12 + tones[ARP_ORDER[(slot / 2) % 8]]
      tone(
        bgmBus,
        song.arp,
        toFrequency(midi),
        at,
        stepTime * 1.7,
        song.arp === "square" ? 0.028 : 0.06,
      )
    }

    const drums = song.drums
    if (drums === 0) return
    const kick =
      drums === 3
        ? slot % 4 === 0
        : drums === 2
          ? slot === 0 || slot === 7 || slot === 8
          : drums === 1
            ? slot === 0 || slot === 8
            : slot === 0
    const snare = (drums === 2 || drums === 3) && (slot === 4 || slot === 12)
    const hat =
      drums === 3
        ? slot % 2 === 0 || slot === 15
        : drums === 2
          ? slot % 2 === 0
          : drums === 1
            ? slot % 4 === 2
            : slot === 8
    if (kick) tone(bgmBus, "sine", 150, at, 0.14, 0.5, 44)
    if (snare) noise(bgmBus, "highpass", 1600, at, 0.13, 0.17)
    if (hat) {
      noise(bgmBus, "highpass", 7000, at, 0.035, slot % 4 === 2 ? 0.07 : 0.04)
    }
  }

  const tick = () => {
    if (disposed || ctx.state !== "running") return
    if (current < 0 && pending === null) return
    const now = ctx.currentTime
    // しばらく呼ばれなかったあと（一時停止・別のタブ）は、今から鳴らし直す
    if (nextTime < now) nextTime = now + 0.05
    while (nextTime < now + 0.2) {
      if (pending !== null && (current < 0 || step % BAR === 0)) {
        enter(pending, nextTime)
        pending = null
      }
      const song = SONGS[current]
      schedule(song, melodyOf(current), nextTime)
      nextTime += 60 / song.bpm / 4
      step += 1
    }
  }

  // ---- 効果音 ---------------------------------------------------------------
  const play = (name: PictorRunSoundName, value = 0) => {
    if (disposed || ctx.state !== "running") return
    const at = ctx.currentTime + 0.005
    if (name === "jump") {
      tone(sfxBus, "square", 392, at, 0.13, 0.13, 820)
    } else if (name === "double") {
      tone(sfxBus, "triangle", 620, at, 0.17, 0.26, 1320)
      tone(sfxBus, "square", 1240, at + 0.05, 0.1, 0.05, 1860)
    } else if (name === "land") {
      noise(sfxBus, "lowpass", 420, at, 0.07, 0.2)
    } else if (name === "coin") {
      const pitch = 2 ** (Math.min(12, value) / 12)
      tone(sfxBus, "square", 988 * pitch, at, 0.07, 0.1)
      tone(sfxBus, "square", 1319 * pitch, at + 0.06, 0.2, 0.1)
    } else if (name === "hit") {
      tone(sfxBus, "sawtooth", 240, at, 0.38, 0.26, 52)
      noise(sfxBus, "lowpass", 1800, at, 0.22, 0.4)
      // がっかりの下がる 3 音
      const fall = [392, 330, 262]
      for (let i = 0; i < fall.length; i++) {
        tone(sfxBus, "triangle", fall[i], at + 0.42 + i * 0.17, 0.26, 0.2)
      }
    } else if (name === "stage") {
      const rise = [523, 659, 784, 1047]
      for (let i = 0; i < rise.length; i++) {
        tone(sfxBus, "triangle", rise[i], at + i * 0.075, 0.24, 0.2)
        tone(sfxBus, "square", rise[i] * 2, at + i * 0.075, 0.1, 0.03)
      }
    } else if (name === "start") {
      tone(sfxBus, "square", 523, at, 0.09, 0.11)
      tone(sfxBus, "square", 784, at + 0.09, 0.2, 0.11)
    } else if (name === "best") {
      const fanfare = [523, 523, 523, 659, 784, 1047]
      const times = [0, 0.11, 0.22, 0.33, 0.5, 0.67]
      for (let i = 0; i < fanfare.length; i++) {
        tone(
          sfxBus,
          "square",
          fanfare[i],
          at + times[i],
          i === 5 ? 0.5 : 0.14,
          0.1,
        )
        tone(sfxBus, "triangle", fanfare[i] / 2, at + times[i], 0.2, 0.14)
      }
    } else {
      tone(sfxBus, "triangle", 880, at, 0.05, 0.12)
    }
  }

  const unlock = () => {
    if (disposed || ctx.state === "running") return
    void ctx.resume().catch(() => {})
  }
  // 404 の数字や「あそぶ」を押して開いているので、たいていはそのまま鳴らせる
  unlock()

  return {
    unlock,
    set: apply,
    setSong: (index) => {
      const next = index % SONGS.length
      if (next === current) {
        pending = null
        return
      }
      pending = next
    },
    stop: () => {
      current = -1
      pending = null
    },
    tick,
    play,
    dispose: () => {
      disposed = true
      void ctx.close().catch(() => {})
    },
  }
}
