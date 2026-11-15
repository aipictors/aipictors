import { describe, expect, test } from "bun:test"
import {
  AUTH_RESTORE_RETRY_INTERVAL_MS,
  shouldRestoreAuthBackup,
} from "~/utils/auth-session-backup"

const backup = { uid: "u1", value: { uid: "u1" } }
const now = 1_800_000_000_000

describe("shouldRestoreAuthBackup", () => {
  test("控えがなければ戻さない（自分でログアウトした）", () => {
    expect(shouldRestoreAuthBackup(null, null, now)).toBe(false)
  })

  test("控えがあって、まだ試していなければ戻す", () => {
    expect(shouldRestoreAuthBackup(backup, null, now)).toBe(true)
  })

  test("同じユーザーで少し前に試してまた消えたなら戻さない（本当に無効）", () => {
    const attempt = { uid: "u1", at: now - 1000 }
    expect(shouldRestoreAuthBackup(backup, attempt, now)).toBe(false)
  })

  test("前に試してから間が空いていれば、また戻す", () => {
    const attempt = { uid: "u1", at: now - AUTH_RESTORE_RETRY_INTERVAL_MS - 1 }
    expect(shouldRestoreAuthBackup(backup, attempt, now)).toBe(true)
  })

  test("別のユーザーで試した記録は関係ない", () => {
    const attempt = { uid: "u2", at: now - 1000 }
    expect(shouldRestoreAuthBackup(backup, attempt, now)).toBe(true)
  })

  test("壊れた控えは戻さない", () => {
    const broken = { uid: "u1", value: null } as unknown as typeof backup
    expect(shouldRestoreAuthBackup(broken, null, now)).toBe(false)
  })
})
