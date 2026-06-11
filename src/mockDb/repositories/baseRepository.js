export function nextId(collection) {
  return Math.max(
    ...collection.map(item => item.id),
    0
  ) + 1
}
