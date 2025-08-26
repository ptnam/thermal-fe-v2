import * as signalR from '@microsoft/signalr'
import {useUserStoreWithOut} from '@/store/modules/user'


let connection: signalR.HubConnection | null = null

export function createSignalRConnection() {
    const userStore = useUserStoreWithOut()
    connection = new signalR.HubConnectionBuilder()
        .withUrl(import.meta.env.VITE_SIGNALR_PATH, {
            accessTokenFactory: () => userStore.getAccessToken,
        })
        .withAutomaticReconnect()
        .build()
    return connection
}

export const startSignalR = async () => {
    if (!connection) return
    try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start()
            console.log('SignalR Connected.')
        }
    } catch (err) {
        console.error('SignalR Connection Error:', err)
    }
}

export async function invokeSignalR(methodName: string, ...args: any[]): Promise<any> {
    if (!connection) throw new Error('SignalR connection not initialized.')
    try {
        const result = await connection.invoke(methodName, ...args)
        console.log(`SignalR invoke success: ${methodName}`, result)
        return result
    } catch (error) {
        console.error(`SignalR invoke error: ${methodName}`, error)
        throw error
    }
}

type SignalREventCallback = (...args: any[]) => void;

export function onSignalREvent<T = any>(eventName: string, callback: (data: T) => void) {
    if (!connection) {
        console.warn(`SignalR connection is not initialized. Cannot listen for event: ${eventName}`);
        return;
    }

    connection.on(eventName, callback as SignalREventCallback);
}