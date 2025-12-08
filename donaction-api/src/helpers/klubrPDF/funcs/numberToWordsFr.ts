export default function numberToWordsFR(n: number) {
  const units = [
    "zéro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
  ];
  const teens = [
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];
  const tens = [
    "",
    "dix",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante",
    "quatre-vingt",
    "quatre-vingt",
  ];

  if (n < 0) {
    return "Nombre hors de portée";
  }

  if (n < 10) {
    return units[n];
  }

  if (n < 20) {
    return teens[n - 10];
  }

  if (n < 100) {
    let tensUnit = Math.floor(n / 10);
    let unit = n % 10;
    if (tensUnit === 7 || tensUnit === 9) {
      return tens[tensUnit] + "-" + teens[unit];
    } else if (tensUnit === 8 && unit === 0) {
      return tens[tensUnit];
    } else if (tensUnit === 8) {
      return tens[tensUnit] + "-" + units[unit];
    } else if (unit === 1) {
      return tens[tensUnit] + " et " + units[unit];
    } else if (unit === 0) {
      return tens[tensUnit];
    } else {
      return tens[tensUnit] + "-" + units[unit];
    }
  }

  if (n < 1000) {
    let hundredsUnit = Math.floor(n / 100);
    let rest = n % 100;
    let hundredsWord =
      hundredsUnit === 1 ? "cent" : units[hundredsUnit] + " cent";
    if (rest === 0) {
      return hundredsWord;
    } else {
      return hundredsWord + " " + numberToWordsFR(rest);
    }
  }

  if (n < 1000000) {
    let thousandsUnit = Math.floor(n / 1000);
    let rest = n % 1000;
    let thousandsWord =
      thousandsUnit === 1 ? "mille" : numberToWordsFR(thousandsUnit) + " mille";
    if (rest === 0) {
      return thousandsWord;
    } else {
      return thousandsWord + " " + numberToWordsFR(rest);
    }
  }

  if (n < 1000000000) {
    let millionsUnit = Math.floor(n / 1000000);
    let rest = n % 1000000;
    let millionsWord =
      millionsUnit === 1
        ? "un million"
        : numberToWordsFR(millionsUnit) + " millions";
    if (rest === 0) {
      return millionsWord;
    } else {
      return millionsWord + " " + numberToWordsFR(rest);
    }
  }

  if (n < 1000000000000) {
    let billionsUnit = Math.floor(n / 1000000000);
    let rest = n % 1000000000;
    let billionsWord =
      billionsUnit === 1
        ? "un milliard"
        : numberToWordsFR(billionsUnit) + " milliards";
    if (rest === 0) {
      return billionsWord;
    } else {
      return billionsWord + " " + numberToWordsFR(rest);
    }
  }

  return "Nombre trop grand";
}
