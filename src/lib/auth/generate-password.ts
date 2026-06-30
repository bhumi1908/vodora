const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*";
const ALL_CHARS = `${LOWERCASE}${UPPERCASE}${DIGITS}${SYMBOLS}`;

function pickRandomChar(charset: string): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return charset[values[0] % charset.length]!;
}

function shuffle(values: string[]): string[] {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    const swapIndex = randomValues[0] % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }

  return shuffled;
}

export function generateSecurePassword(length = 16): string {
  const safeLength = Math.max(12, length);
  const required = [
    pickRandomChar(LOWERCASE),
    pickRandomChar(UPPERCASE),
    pickRandomChar(DIGITS),
    pickRandomChar(SYMBOLS),
  ];

  const remaining = Array.from({ length: safeLength - required.length }, () =>
    pickRandomChar(ALL_CHARS),
  );

  return shuffle([...required, ...remaining]).join("");
}
