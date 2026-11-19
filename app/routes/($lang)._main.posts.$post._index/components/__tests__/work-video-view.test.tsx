import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { WorkVideoView } from "../work-video-view"

const VIDEO_URL = "https://example.com/video.mp4"

const renderVideo = (caption?: string) =>
  render(
    <MemoryRouter>
      <WorkVideoView videoUrl={VIDEO_URL} title="動画" caption={caption} />
    </MemoryRouter>,
  )

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe("作品ページの動画の切り替え", () => {
  test("自動再生は既定でオンで、オフにすると端末に覚える", () => {
    renderVideo()
    const button = screen.getByRole("button", { name: /自動再生/ })
    expect(button.getAttribute("aria-pressed")).toBe("true")
    fireEvent.click(button)
    expect(button.getAttribute("aria-pressed")).toBe("false")
    expect(localStorage.getItem("aipictors.videoAutoPlay")).toBe("0")
  })

  test("ループはこの動画だけ切り替わり、再生ボタンで始めた動画にも効く", () => {
    renderVideo()
    fireEvent.click(screen.getByRole("button", { name: "動画 を再生" }))
    const video = document.querySelector("video")
    expect(video?.loop).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: /ループ/ }))
    expect(document.querySelector("video")?.loop).toBe(false)
    expect(localStorage.getItem("aipictors.videoLoop")).toContain(VIDEO_URL)
  })

  test("覚えたループの設定は次に開いたときも使う", () => {
    localStorage.setItem(
      "aipictors.videoLoop",
      JSON.stringify([[VIDEO_URL, false]]),
    )
    renderVideo()
    expect(
      screen
        .getByRole("button", { name: /ループ/ })
        .getAttribute("aria-pressed"),
    ).toBe("false")
  })

  test("キャプションは押すと動画の下に出る。なければ切り替えも出さない", () => {
    renderVideo("キャプションの本文")
    expect(screen.queryByText("キャプションの本文")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: /キャプション/ }))
    expect(screen.getByText("キャプションの本文")).toBeTruthy()
    cleanup()

    renderVideo()
    expect(screen.queryByRole("button", { name: /キャプション/ })).toBeNull()
  })
})
