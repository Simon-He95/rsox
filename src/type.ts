export type Return<T> = [
  () => [T, (value: T) => void, (initial?: T) => void],
  () => void,
]
