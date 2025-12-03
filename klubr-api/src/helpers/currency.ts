export default function formatNumberToCurrency(number: number, decimal = 2) {
  if (!number) {
    return undefined;
  }
  // Convert the number to a fixed decimal format with two decimal places
  let formattedNumber = number.toFixed(decimal);

  // Use a regular expression to add spaces as thousand separators
  formattedNumber = formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  // Append the euro symbol
  return `${formattedNumber}€`;
}
