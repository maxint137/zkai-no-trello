export function toEmojiDigit(n: number | string): string {
  const digitEmojis = [
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
  ];
  return n
    .toString()
    .split("")
    .map((d) => digitEmojis[+d])
    .join("");
}
