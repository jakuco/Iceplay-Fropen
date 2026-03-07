export type Result<T, E = string> = 
| { ok: true, value: T, error?: never }
| { ok: false, value?: never, error: E };