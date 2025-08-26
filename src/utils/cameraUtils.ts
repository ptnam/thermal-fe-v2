export const isCam = (node: any) => {
    return node.cameraType ?? node.deviceStatus
}