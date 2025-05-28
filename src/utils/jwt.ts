import jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  secretKey,
  options
}: {
  payload: string | object | Buffer
  secretKey: string
  options: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secretKey, options, (err, token) => {
      if (err) reject(err)
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretKey }: { token: string; secretKey: string }) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) reject(err)
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
