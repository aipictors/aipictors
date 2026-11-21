/**
 * ユーザー ID として使えるか
 * 半角英字を 1 文字以上含み、使える文字は a-z / A-Z / 0-9 / _ / -（WordPress が弾く空白や @!# などは不可）
 */
export const isValidUserLogin = (login: string): boolean => {
  return /^[A-Za-z0-9_-]+$/.test(login) && /[A-Za-z]/.test(login)
}
