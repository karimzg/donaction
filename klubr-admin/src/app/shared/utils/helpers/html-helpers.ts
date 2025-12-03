export const htmlNbCars = (html: string): number => {
  const textContent = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
  return textContent.length;
}
