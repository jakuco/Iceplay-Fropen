type Success<T> = T extends void
    ? { ok: true }
    : { ok: true; value: T };

type Failure<E> = { ok: false; error: E };

export type Result<T = void, E = string> = Success<T> | Failure<E>;

export function ok<T = void>(value?: T): Success<T> {
    if (value === undefined) {
        return { ok: true } as Success<T>;
    }
    return { ok: true, value } as Success<T>;
}

export function fail<E>(error: E): Failure<E> {
    return { ok: false, error };
}