export const buildIndexMap = (data: any[], parentIndex = '') => {
  return data.map((item, i) => {
    const currentIndex = parentIndex ? `${parentIndex}.${i + 1}` : `${i + 1}`

    const newItem: any = {
      ...item,
      _index: currentIndex,
    }

    if (item.children && item.children.length) {
      newItem.children = buildIndexMap(item.children, currentIndex)
    }

    return newItem
  })
}