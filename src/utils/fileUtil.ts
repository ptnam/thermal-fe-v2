export const downloadFileFromResponse = async (response: Response) => {
    const fileName =
        response.headers["content-disposition"].split("filename=")[1];
    const blob = await response.blob()
    const fileURL = window.URL.createObjectURL(blob)
    downloadFileFromUrl(fileURL, fileName)
}
export const downloadFileFromUrl = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName; // Optional: Set the file name
    document.body.appendChild(link);
    link.click();
    link.remove();
}