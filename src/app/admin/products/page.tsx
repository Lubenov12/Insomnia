"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import "../admin-styles.css";

interface ProductVariant {
  size: string;
  stock_quantity: number;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function ProductCreationPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addVariant = () => {
    setVariants([...variants, { size: "M", stock_quantity: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (variants.length === 0) {
      setError("At least one variant is required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
          category: formData.category,
          variants: variants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const result = await response.json();
      setSuccess(`Product created successfully! ID: ${result.product_id}`);

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category: "",
      });
      setVariants([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-white">Add New Product</h1>

        <Card className="admin-dark-card">
          <CardHeader>
            <CardTitle className="text-white">Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="admin-dark-label">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="admin-dark-input"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="admin-dark-label">
                    Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    className="admin-dark-input admin-number-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="admin-dark-label">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="admin-dark-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image_url" className="admin-dark-label">
                    Image URL *
                  </Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    required
                    className="admin-dark-input"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="admin-dark-label">
                    Category *
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                    className="admin-dark-input"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold admin-dark-label">
                    Product Variants
                  </Label>
                  <Button
                    type="button"
                    onClick={addVariant}
                    variant="outline"
                    size="sm"
                    className="admin-dark-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {variants.length === 0 && (
                  <div className="text-center text-gray-400 py-4">
                    No variants added. Click "Add Variant" to get started.
                  </div>
                )}

                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-center p-3 border rounded-lg admin-variant-card"
                    >
                      <div className="flex-1">
                        <Label className="admin-dark-label">Size</Label>
                        <select
                          value={variant.size}
                          onChange={(e) =>
                            updateVariant(index, "size", e.target.value)
                          }
                          className="w-full p-2 border rounded-md admin-dark-input"
                        >
                          {SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <Label className="admin-dark-label">
                          Stock Quantity
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock_quantity}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "stock_quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="admin-dark-input admin-number-input"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="mt-6 admin-dark-button"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error and Success Messages */}
              {error && <div className="text-red-400 text-sm">{error}</div>}
              {success && (
                <div className="text-green-400 text-sm">{success}</div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full admin-dark-button primary"
              >
                {loading ? "Creating Product..." : "Create Product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
