import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Converts Latin transliteration back to Bulgarian Cyrillic
 * @param text - Latin transliterated text
 * @returns Bulgarian Cyrillic text
 */
function latinToBulgarian(text: string): string {
  const reverseMap: { [key: string]: string } = {
    // Multi-character transliterations (must be handled first)
    sht: "щ",
    zh: "ж",
    ts: "ц",
    ch: "ч",
    sh: "ш",
    yu: "ю",
    ya: "я",

    // Single characters
    a: "а",
    b: "б",
    v: "в",
    g: "г",
    d: "д",
    e: "е",
    z: "з",
    i: "и",
    y: "й",
    k: "к",
    l: "л",
    m: "м",
    n: "н",
    o: "о",
    p: "п",
    r: "р",
    s: "с",
    t: "т",
    u: "у",
    f: "ф",
    h: "х",
  };

  let result = text.toLowerCase();

  // Replace multi-character transliterations first (longest first)
  const multiCharEntries = Object.entries(reverseMap).filter(
    ([latin]) => latin.length > 1
  );
  multiCharEntries.sort((a, b) => b[0].length - a[0].length); // Sort by length descending

  for (const [latin, cyrillic] of multiCharEntries) {
    result = result.replace(new RegExp(latin, "g"), cyrillic);
  }

  // Replace single characters
  for (const [latin, cyrillic] of Object.entries(reverseMap)) {
    if (latin.length === 1) {
      result = result.replace(new RegExp(latin, "g"), cyrillic);
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title");

    if (!title) {
      return NextResponse.json(
        { error: "Title parameter is required" },
        { status: 400 }
      );
    }

    // Convert Latin slug back to Bulgarian for search
    const searchTitle = latinToBulgarian(title.replace(/-/g, " "));

    // Search for products by title (case-insensitive)
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (
          id,
          product_id,
          size,
          stock_quantity,
          created_at,
          updated_at
        )
      `
      )
      .ilike("name", `%${searchTitle}%`)
      .limit(1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = products[0];

    // Calculate size availability
    const sizeAvailability: { [key: string]: number } = {};
    if (product.product_variants) {
      product.product_variants.forEach(
        (variant: { size: string; stock_quantity: number }) => {
          sizeAvailability[variant.size] = variant.stock_quantity;
        }
      );
    }

    const productWithVariants = {
      ...product,
      size_availability: sizeAvailability,
    };

    return NextResponse.json(productWithVariants);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
