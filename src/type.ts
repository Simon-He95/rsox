export type Return<T> = [() => [number, (value: T) => void, (initial?: T) => void], () => void]
