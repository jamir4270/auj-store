export interface BarcodeLookupResult {
  found: boolean;
  barcode: string;
  name?: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
}

/**
 * Looks up product details from Open Food Facts API with a strict timeout.
 * Gracefully falls back to { found: false } on network failures, timeouts, or unknown barcodes.
 */
export async function lookupBarcodeDetails(
  barcode: string,
  timeoutMs: number = 4000
): Promise<BarcodeLookupResult> {
  const trimmed = barcode?.trim();
  if (!trimmed) {
    return { found: false, barcode: "" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
      trimmed
    )}.json?fields=product_name,product_name_en,brands,categories,image_front_small_url,status`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AUJStore-POS/1.0 (sari-sari store management)",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { found: false, barcode: trimmed };
    }

    const data = await res.json();

    if (data.status === 1 && data.product) {
      const prod = data.product;
      const rawName = prod.product_name || prod.product_name_en || "";
      const rawBrand = prod.brands || "";
      const rawCategories = prod.categories ? prod.categories.split(",") : [];
      const primaryCategory = rawCategories.length > 0 ? rawCategories[0].trim() : "";

      const fullName = rawBrand && rawName && !rawName.toLowerCase().includes(rawBrand.toLowerCase())
        ? `${rawBrand} ${rawName}`
        : rawName || rawBrand;

      return {
        found: true,
        barcode: trimmed,
        name: fullName.trim() || undefined,
        brand: rawBrand.trim() || undefined,
        category: primaryCategory || undefined,
        imageUrl: prod.image_front_small_url || undefined,
      };
    }

    return { found: false, barcode: trimmed };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[BarcodeLookup] Failed lookup for ${trimmed}:`, error instanceof Error ? error.message : error);
    return { found: false, barcode: trimmed };
  }
}
