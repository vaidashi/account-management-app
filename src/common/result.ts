export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * 
    Part of the type signature now, explicitly handle failure cases at compile time rather than discovering them at runtime.
 */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
