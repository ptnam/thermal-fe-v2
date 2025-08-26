export const downloadFile = (response: any) => {
  const disposition = response.headers['content-disposition'];
  let fileName = 'downloaded-file';
  if (disposition) {
    const fileNameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (fileNameMatch != null && fileNameMatch[1]) {
      fileName = fileNameMatch[1].replace(/['"]/g, '');
    }
  }

  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const fileURL = window.URL.createObjectURL(blob);

  const fileLink = document.createElement('a');
  fileLink.href = fileURL;
  fileLink.setAttribute('download', fileName);
  document.body.appendChild(fileLink);
  fileLink.click();
  fileLink.remove();
  window.URL.revokeObjectURL(fileURL);
}
