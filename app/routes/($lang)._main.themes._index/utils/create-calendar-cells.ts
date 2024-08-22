export function createCalendarCells(year: number, month: number) {
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 1日の曜日を取得
  const lastDateOfMonth = new Date(year, month, 0).getDate(); // 月の最後の日付を取得

  const cells = [];

  // 1日が正しい曜日に表示されるように、前の月の空セルを追加
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }

  // 現在の月の日付を追加
  for (let day = 1; day <= lastDateOfMonth; day++) {
    cells.push(day);
  }

  return cells;
}
