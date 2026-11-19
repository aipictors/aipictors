import { afterEach, describe, expect, test } from "bun:test"
import {
  MAX_LOOP_ENTRIES,
  readVideoAutoPlay,
  readVideoLoop,
  readViewerCaptionShown,
  saveVideoAutoPlay,
  saveVideoLoop,
  saveViewerCaptionShown,
} from "~/utils/video-playback-preference"

afterEach(() => {
  localStorage.clear()
})

describe("動画の自動再生の設定", () => {
  test("既定は今までどおり自動再生する", () => {
    expect(readVideoAutoPlay()).toBe(true)
  })

  test("オフにすると次の動画でも自動再生しない。オンに戻すと記録を消す", () => {
    saveVideoAutoPlay(false)
    expect(readVideoAutoPlay()).toBe(false)
    saveVideoAutoPlay(true)
    expect(readVideoAutoPlay()).toBe(true)
    expect(localStorage.length).toBe(0)
  })
})

describe("動画ごとのループの設定", () => {
  test("切り替えていない動画はループする", () => {
    expect(readVideoLoop("a")).toBe(true)
  })

  test("切り替えた動画だけループしない", () => {
    saveVideoLoop("a", false)
    expect(readVideoLoop("a")).toBe(false)
    expect(readVideoLoop("b")).toBe(true)
    saveVideoLoop("a", true)
    expect(readVideoLoop("a")).toBe(true)
    expect(localStorage.length).toBe(0)
  })

  test("覚える数を超えたら古いものから捨てる", () => {
    for (let i = 0; i <= MAX_LOOP_ENTRIES; i++) saveVideoLoop(`v${i}`, false)
    expect(readVideoLoop("v0")).toBe(true)
    expect(readVideoLoop("v1")).toBe(false)
    expect(readVideoLoop(`v${MAX_LOOP_ENTRIES}`)).toBe(false)
  })

  test("壊れた記録は無視する", () => {
    localStorage.setItem("aipictors.videoLoop", "{bad")
    expect(readVideoLoop("a")).toBe(true)
    localStorage.setItem("aipictors.videoLoop", JSON.stringify([["a", "no"]]))
    expect(readVideoLoop("a")).toBe(true)
  })
})

describe("キャプションを並べて出す設定", () => {
  test("既定は出さず、選んだら覚える", () => {
    expect(readViewerCaptionShown()).toBe(false)
    saveViewerCaptionShown(true)
    expect(readViewerCaptionShown()).toBe(true)
    saveViewerCaptionShown(false)
    expect(readViewerCaptionShown()).toBe(false)
  })
})
