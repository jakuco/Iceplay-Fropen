type Success<T> = T extends void
    ? { ok: true }
    : { ok: true; value: T };

type Failure<E> = { ok: false; error: E };

export type Result<T = void, E = string> = Success<T> | Failure<E>;