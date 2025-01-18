import slugify from "slugify";
import { customAlphabet } from "nanoid";

export function generateSlug(title: string) {
  const alphabet = "0123456789_abcdefghijklmnopqrstuvwxyz-";
  const nanoid = customAlphabet(alphabet, 12);
  const slug =
    slugify(title, {
      lower: true,
      strict: true,
    }) +
    "-" +
    nanoid(12);

  return slug;
}
