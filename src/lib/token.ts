import { v4 as uuidv4 } from 'uuid'

export function generateToken(): string {
  const uuid = uuidv4().replace(/-/g, '').toUpperCase()
  return `ITR-${uuid.slice(0, 4)}-${uuid.slice(4, 8)}`
}