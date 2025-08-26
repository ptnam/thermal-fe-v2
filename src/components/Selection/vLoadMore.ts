import type { DirectiveBinding } from 'vue'

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const SELECT_WRAP_DOM = el.querySelector(
      '.el-select-dropdown .el-scrollbar__wrap',
    ) as HTMLElement
    if (!SELECT_WRAP_DOM) return

    SELECT_WRAP_DOM.addEventListener('scroll', () => {
      const CONDITION =
        SELECT_WRAP_DOM.scrollHeight - SELECT_WRAP_DOM.scrollTop <= SELECT_WRAP_DOM.clientHeight
      if (CONDITION) {
        binding.value()
      }
    })
  },
}
