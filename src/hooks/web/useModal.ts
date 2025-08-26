import { ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'

export function useConfirmModal() {
  const confirmModal = async (
    title: string,
    content: string,
    onOk?: () => Promise<void> | void,
    extraOptions?: Partial<Parameters<typeof ElMessageBox.confirm>[2]>,
  ) => {
    try {
      await ElMessageBox.confirm(content, title, {
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        customClass: 'custom-confirm-modal',
        center: true,
        ...extraOptions,
      })

      if (onOk) await onOk()
    } catch (err) {
      console.log(err)
    }
  }

  return { confirmModal }
}

export function useNoticeModal() {
  const noticeModal = async (
    content: string,
    title = 'Thông báo',
    onOk?: () => void | Promise<void>,
    extraOptions?: Partial<Parameters<typeof ElMessageBox.alert>[2]>,
  ) => {
    await ElMessageBox.alert(content, title, {
      confirmButtonText: 'Đóng',
      customClass: 'custom-notice-modal',
      center: true,
      callback: async (action: Action) => {
        if (action === 'confirm' && onOk) await onOk()
      },
      ...extraOptions,
    })
  }

  return { noticeModal }
}
