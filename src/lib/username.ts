/**
 * Giáo viên không có email vẫn đăng ký được bằng tên đăng nhập. Supabase Auth chỉ nhận email,
 * nên tên đăng nhập được ghép thành một email nội bộ (không gửi thư tới địa chỉ này).
 * Cần tắt "Confirm email" trong Supabase thì loại tài khoản này mới dùng được ngay.
 */
const DOMAIN = process.env.NEXT_PUBLIC_USERNAME_DOMAIN || "teachmate.local";

export const USERNAME_RULE = /^[a-z0-9._-]{3,30}$/;

/** Chuẩn hóa ô nhập: có "@" là email thật, ngược lại là tên đăng nhập. Trả về null nếu tên không hợp lệ. */
export function toLoginEmail(input: string): { email: string; isUsername: boolean } | null {
  const v = input.trim();
  if (v.includes("@")) return { email: v, isUsername: false };
  const name = v.toLowerCase();
  return USERNAME_RULE.test(name) ? { email: `${name}@${DOMAIN}`, isUsername: true } : null;
}

/** Tên hiển thị: bỏ phần email nội bộ của tài khoản tên đăng nhập. */
export function displayName(email: string) {
  return email.endsWith(`@${DOMAIN}`) ? email.slice(0, -(DOMAIN.length + 1)) : email;
}
