export function getReservationDetails(createdAt: number) {
  // 現在時刻よりも未来の時刻なら予約更新の日付と時間をセット
  if (createdAt) {
    const reservedDate = new Date(createdAt * 1000 + 3600000 * 9) // 日本時間に変換
    const now = new Date(Date.now() + 3600000 * 9) // 日本時間の現在時刻

    if (reservedDate > now) {
      const reservationDate = reservedDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "-")
      const reservationTime = reservedDate.toISOString().slice(11, 16)
      return {
        reservationDate,
        reservationTime,
      }
    }
  }
  return {
    reservationDate: null,
    reservationTime: null,
  }
}
