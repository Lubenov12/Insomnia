"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminGuard from "@/components/AdminGuard";
import "../admin-styles.css";

interface StockVariant {
  size: string;
  stock_quantity: number;
  updated_at: string;
}

interface ProductStock {
  id: string;
  name: string;
  category: string;
  variants: StockVariant[];
  total_stock: number;
}

export default function StockManagementPage() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stock");
      if (!response.ok) {
        throw new Error("Failed to fetch stock data");
      }
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Update stock for a variant
  const updateStock = async (
    productId: string,
    size: string,
    newQuantity: number
  ) => {
    try {
      setUpdatingStock(`${productId}-${size}`);
      const response = await fetch("/api/admin/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          size: size,
          stock_quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stock");
      }

      // Refresh the data
      await fetchStockData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock");
    } finally {
      setUpdatingStock(null);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  if (loading) {
    return (
      <AdminGuard>
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-white">
            Stock Management
          </h1>
          <div className="text-center text-gray-300">Loading stock data...</div>
        </div>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-white">
            Stock Management
          </h1>
          <div className="text-red-400 mb-4">Error: {error}</div>
          <Button onClick={fetchStockData}>Retry</Button>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Stock Management</h1>
          <Button onClick={fetchStockData} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id} className="admin-dark-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white">
                      {product.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="mt-2 admin-dark-badge"
                    >
                      {product.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {product.total_stock}
                    </div>
                    <div className="text-sm text-gray-300">Total Stock</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.size}
                      className="admin-variant-card border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Label className="font-semibold admin-dark-label">
                          Size {variant.size}
                        </Label>
                        <Badge
                          variant={
                            variant.stock_quantity === 0
                              ? "destructive"
                              : variant.stock_quantity < 5
                              ? "secondary"
                              : "default"
                          }
                          className={
                            variant.stock_quantity === 0
                              ? "admin-dark-badge destructive"
                              : variant.stock_quantity < 5
                              ? "admin-dark-badge"
                              : "admin-dark-badge default"
                          }
                        >
                          {variant.stock_quantity} in stock
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock_quantity}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            updateStock(product.id, variant.size, newValue);
                          }}
                          disabled={
                            updatingStock === `${product.id}-${variant.size}`
                          }
                          className="w-20 admin-number-input admin-dark-input"
                        />
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStock(
                              product.id,
                              variant.size,
                              variant.stock_quantity + 1
                            )
                          }
                          disabled={
                            updatingStock === `${product.id}-${variant.size}`
                          }
                          className="admin-dark-button primary"
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStock(
                              product.id,
                              variant.size,
                              Math.max(0, variant.stock_quantity - 1)
                            )
                          }
                          disabled={
                            updatingStock === `${product.id}-${variant.size}`
                          }
                          className="admin-dark-button"
                        >
                          -
                        </Button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Updated:{" "}
                        {new Date(variant.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No products found. Add some products first!
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
