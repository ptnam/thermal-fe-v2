import { ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'
import { useLang } from '@/hooks/web/useI18n'

export function useConfirmModal() {
  const { t } = useLang()
  const confirmModal = async (
    title: string,
    content: string,
    onOk?: () => Promise<void> | void,
    extraOptions?: Partial<Parameters<typeof ElMessageBox.confirm>[2]>,
  ) => {
    try {
      await ElMessageBox.confirm(content, title, {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
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
  const { t } = useLang()
  const noticeModal = async (
    content: string,
    onOk?: () => void | Promise<any>,
    title = t('common.notice'),
    extraOptions?: Partial<Parameters<typeof ElMessageBox.alert>[2]>,
  ) => {
    await ElMessageBox.alert(content, title, {
      confirmButtonText: t('common.close'),
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
