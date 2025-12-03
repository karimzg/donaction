export default function getRecuNumberFromAtt(attestationNumber: string) {
  const arr = attestationNumber.split("-");
  arr[0] = "RECU";
  return arr.join("-");
}

