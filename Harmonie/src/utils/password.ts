import { hashSync, compareSync } from "bcrypt-edge";

export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export function verifyPassword(hash: string, password: string): boolean {
  return compareSync(password, hash);
}
