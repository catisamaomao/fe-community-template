import store from '@/store'

// 根据字典编码和 value 找到 label
export function getDictionaryLabel(typeCode, value) {
  const dictType = store.state.dictionaryOptions.find(d => d.code === typeCode)
  if (!dictType || !dictType.dictionaryVos) return ''
  const dictItem = dictType.dictionaryVos.find(item => item.value == value)
  return dictItem ? dictItem.name : ''
}
