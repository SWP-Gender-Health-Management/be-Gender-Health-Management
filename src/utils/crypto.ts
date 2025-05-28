import argon2 from 'argon2'

export async function hashPassword(password: string) {
  const options = {
    type: argon2.argon2id,
    memoryCost: 65,
    timeCost: 3,
    parallelism: 4
  }
  return await argon2.hash(password, options)
}

export async function verifyPassword(password: string, hash: string) {
  return await argon2.verify(hash, password)
}
