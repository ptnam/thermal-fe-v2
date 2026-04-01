import {ref} from 'vue'

export function useImageBounds() {
    const imageCenter = ref<[number, number] | null>([0, 0])
    const bounds = ref<[[number, number], [number, number]] | null>([
        [0, 0],
        [0, 0]
    ],)

    const getBestFitSize = (
        imageWidth: number,
        imageHeight: number,
        containerWidth: number,
        containerHeight: number
    ): { width: number; height: number } => {
        const imageRatio = imageWidth / imageHeight;
        const containerRatio = containerWidth / containerHeight;

        let width: number;
        let height: number;

        if (imageRatio > containerRatio) {
            width = containerWidth;
            height = containerWidth / imageRatio;
        } else {
            height = containerHeight;
            width = containerHeight * imageRatio;
        }

        return {width, height};
    };
    const updateBound = (path: string, mW = 1075, mH = 619) => {
        const img = new Image()
        img.onload = () => {
            const width = img.width
            const height = img.height
            const newVal = getBestFitSize(width, height, mW, mH)
            imageCenter.value = [newVal.height / 2, newVal.width / 2]
            bounds.value = [
                [0, 0],
                [newVal.height, newVal.width],
            ]
        }
        img.onerror = () => {
            imageCenter.value = [0, 0]
            bounds.value = [
              [0, 0],
              [0, 0]
            ]
        }
        img.src = path
    }

    return {
        imageCenter,
        bounds,
        updateBound: updateBound,
    }
}
