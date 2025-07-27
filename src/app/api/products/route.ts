import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  productSchema,
  searchSchema,
  paginationSchema,
} from "@/lib/validations";
import { getAuthUser } from "@/lib/auth";
import {
  handleApiError,
  validatePagination,
  sanitizeInput,
  DatabaseError,
  NotFoundError,
  AuthenticationError,
  ValidationError,
  ConflictError,
} from "@/lib/error-handler";

// Cache configuration
const CACHE_DURATION = 300; // 5 minutes
const cache = new Map();

// Helper function to generate cache key
function generateCacheKey(searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams);
  return `products:${params.toString()}`;
}

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check cache first
    const cacheKey = generateCacheKey(searchParams);
    const cachedResult = cache.get(cacheKey);

    if (
      cachedResult &&
      Date.now() - cachedResult.timestamp < CACHE_DURATION * 1000
    ) {
      return NextResponse.json(cachedResult.data, {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=600",
          "X-Cache": "HIT",
        },
      });
    }

    // Validate and sanitize search parameters
    const { page, limit } = validatePagination(
      searchParams.get("page") || undefined,
      searchParams.get("limit") || undefined
    );

    const searchData = searchSchema.parse({
      query: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
    });

    const offset = (page - 1) * limit;

    // Sanitize inputs
    const category = searchData.category
      ? sanitizeInput(searchData.category)
      : null;
    const search = searchData.query ? sanitizeInput(searchData.query) : null;

    // Optimize query with better indexing hints
    let query = supabase
      .from("products")
      .select(
        "id, name, description, price, image_url, stock_quantity, created_at",
        { count: "exact" }
      )
      .gte("stock_quantity", 1) // Only show products in stock
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.ilike("category", `%${category}%`);
    }

    if (search) {
      // Use more efficient search with proper indexing
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      throw new DatabaseError("Failed to fetch products", error.code, error);
    }

    // Validate that we have valid data
    if (!Array.isArray(products)) {
      throw new DatabaseError("Invalid response from database");
    }

    const responseData = {
      products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      filters: {
        category: category || null,
        search: search || null,
      },
    };

    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    // Clean up old cache entries (keep only last 100 entries)
    if (cache.size > 100) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const toDelete = entries.slice(100);
      toDelete.forEach(([key]) => cache.delete(key));
    }

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      throw new AuthenticationError();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError("Invalid JSON in request body");
    }

    // Validate required fields exist
    if (!body || typeof body !== "object") {
      throw new ValidationError("Request body must be a valid object");
    }

    const validatedData = productSchema.parse(body);

    // Additional business logic validation
    if (validatedData.price <= 0) {
      throw new ValidationError(
        "Product price must be greater than 0",
        { price: validatedData.price },
        "price"
      );
    }

    // Check if product with same name already exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .ilike("name", validatedData.name)
      .single();

    if (existingProduct) {
      throw new ConflictError("A product with this name already exists");
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to create product", error.code, error);
    }

    if (!product) {
      throw new DatabaseError("Product was not created successfully");
    }

    // Clear cache when new product is added
    cache.clear();

    return NextResponse.json(product, {
      status: 201,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
