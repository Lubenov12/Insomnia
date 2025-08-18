/**
 * Utility functions for URL handling and product slugs
 */

/**
 * Transliterates Bulgarian Cyrillic to Latin characters
 * @param text - Bulgarian text in Cyrillic
 * @returns Latin transliteration
 */
function transliterateBulgarian(text: string): string {
  const transliterationMap: { [key: string]: string } = {
    // Vowels
    а: "a",
    е: "e",
    и: "i",
    о: "o",
    у: "u",
    ъ: "a",
    ю: "yu",
    я: "ya",
    А: "A",
    Е: "E",
    И: "I",
    О: "O",
    У: "U",
    Ъ: "A",
    Ю: "Yu",
    Я: "Ya",

    // Consonants
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    ж: "zh",
    з: "z",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sht",

    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Ж: "Zh",
    З: "Z",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    Ф: "F",
    Х: "H",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Sht",
  };

  return text
    .split("")
    .map((char) => transliterationMap[char] || char)
    .join("");
}

/**
 * Converts a product title to a URL-friendly slug
 * @param title - The product title
 * @returns URL-friendly slug
 */
export function titleToSlug(title: string): string {
  // First transliterate Bulgarian to Latin
  const transliterated = transliterateBulgarian(title);

  return transliterated
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove special characters, keep only letters, numbers, and hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Converts a slug back to a readable title
 * @param slug - The URL slug
 * @returns Readable title
 */
export function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

/**
 * Creates a product URL using a shorter product ID
 * @param product - Product object with id and name
 * @returns Product URL
 */
export function createProductUrl(product: {
  id: string;
  name: string;
}): string {
  // Use the first 8 characters of the ID for shorter URLs
  const shortId = product.id.substring(0, 8);
  return `/product/${shortId}`;
}

/**
 * Extracts product ID from URL search params
 * @param searchParams - URL search parameters
 * @returns Product ID or null
 */
export function getProductIdFromUrl(
  searchParams: URLSearchParams
): string | null {
  return searchParams.get("id");
}
