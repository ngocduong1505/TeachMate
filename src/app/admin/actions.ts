"use server";

import { redirect } from "next/navigation";
import { addAdmin, clearSession, getAdmin, removeAdmin, setSession, signIn } from "@/lib/admin";

export async function loginAction(_: string | null, form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const s = email && password ? await signIn(email, password) : null;
  if (!s) return "Email hoặc mật khẩu không đúng.";
  await setSession(s.token, s.expiresIn);
  if (!(await getAdmin())) {
    await clearSession();
    return "Tài khoản này chưa được cấp quyền quản trị.";
  }
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin");
}

export async function addAdminAction(form: FormData) {
  const admin = await getAdmin();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (admin && /^\S+@\S+\.\S+$/.test(email)) await addAdmin(admin.token, email);
  redirect("/admin?tab=admins");
}

export async function removeAdminAction(form: FormData) {
  const admin = await getAdmin();
  const email = String(form.get("email") ?? "");
  if (admin && email.toLowerCase() !== admin.email.toLowerCase()) await removeAdmin(admin.token, email);
  redirect("/admin?tab=admins");
}
