import GenericForm, {
  type FormComponentProps,
} from "@/components/templates/Form/GenericForm.vue";
import {ElDrawer} from "element-plus";
import { createVNode, render, ref, h, type VNode } from "vue";

interface DialogProps {
  title?: string;
  onClose?: () => void;

  [key: string]: unknown;
}

export function useDialogForm() {
  const visible = ref(false);
  let dialogVNode: VNode | null = null;

  const closeDialog = (): void => {
    visible.value = false;
    if (dialogVNode) {
      render(null, document.body);
      dialogVNode = null;
    }
  };

  const showDialog = (
    componentProps: FormComponentProps,
    dialogProps: DialogProps = {},
  ): void => {
    visible.value = true;

    dialogVNode = createVNode(
      ElDrawer,
      {
        modelValue: visible.value,
        withHeader: false,
        resizable: true,
        center: true,
        alignCenter: true,
        "onUpdate:modelValue": (val: boolean) => {
          visible.value = val;
          if (!val) closeDialog();
        },
        ...dialogProps,
      },
      {
        default: () =>
          h(GenericForm, {
            ...componentProps,
            onCancel: () => closeDialog(),
          }),
      },
    );

    render(dialogVNode, document.body);
  };

  return {
    showDialog,
    closeDialog,
  };
}
