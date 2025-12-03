

export default function formattedCurrentDate(nbDigitSuffix = 0) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}${nbDigitSuffix > 0 ? '-' + Math.random().toString(36).substring(2, 2 + nbDigitSuffix).toUpperCase() : ''}`;
}
