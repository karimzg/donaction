const slugify = (str: string, separator = "-") => {
  return str
    .toString()
    .normalize('NFD')                   // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '')   // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, separator);
};

const randomizeString = (str: string, frequency = 2) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (!str) return str;
  return str.split('').map((char, index) => {
    if (/[a-zA-Z]/.test(char) && index % frequency === (frequency === 1 ? 0 : 1)) {
      return chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return char;
  }).join('');
}

export {
  slugify,
  randomizeString,
}
