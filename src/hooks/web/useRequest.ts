import { ref } from "vue";

interface IProps<T = any> {
    onSuccess?: (response: T) => void;
    onError?: (error: unknown) => void;
}

function useRequest<T = any>(props?: IProps<T>) {
    const isLoading = ref(false);

    const onRequest = async (
        api: (...args: any[]) => Promise<T>,
        ...args: any[]
    ) => {
        isLoading.value = true;
        try {
            const response = await api(...args);
            props?.onSuccess?.(response);
            return response;
        } catch (error) {
            props?.onError?.(error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        onRequest,
        isLoading,
    };
}

export default useRequest;
