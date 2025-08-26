import Sortable from "sortablejs";

export const vDraggable = {
    mounted(el, binding) {
        const options = binding.value;
        for (const element of options) {
            const o = element;
            new Sortable(el.querySelector(o.selector), o.option);
        }
    },
};