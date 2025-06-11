import PayOS from '@payos/node'
import dotenv from 'dotenv'

dotenv.config()

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID! as string,
  process.env.PAYOS_API_KEY! as string,
  process.env.PAYOS_CHECKSUM_KEY! as string
)

export default payos
