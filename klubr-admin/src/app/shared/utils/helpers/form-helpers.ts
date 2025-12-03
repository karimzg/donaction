export const urlToFormData = async (imageUrl: string, fileName: string): Promise<FormData> => {
  // Fetch the image from the URL
  const response = await fetch(imageUrl);
  // Convert the response to a Blob
  const blob = await response.blob();
  // Create a File from the Blob
  const file = new File([blob], fileName, { type: blob.type });
  // Create a FormData object and append the file
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}
export const urlToFormFile = async (imageUrl: string, fileName: string): Promise<File> => {
  // Fetch the image from the URL
  const response = await fetch(imageUrl);
  // Convert the response to a Blob
  const blob = await response.blob();
  // Create a File from the Blob
  return new File([blob], fileName, { type: blob.type });
}
