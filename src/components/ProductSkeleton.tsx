import React from "react";

// Individual product skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-gray-900 rounded-xl overflow-hidden animate-pulse border border-gray-700">
    <div className="w-full aspect-square bg-gray-800"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-800 rounded mb-2"></div>
      <div className="h-6 bg-gray-800 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
    </div>
  </div>
);

// Product grid skeleton
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Product detail skeleton
export const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-black py-16 px-4">
    <div className="w-full max-w-7xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-pulse">
      <div className="md:w-3/5 bg-gray-800 h-[420px] md:h-[640px]"></div>
      <div className="md:w-2/5 p-6 md:p-8 flex flex-col">
        <div className="h-8 bg-gray-800 rounded mb-2"></div>
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-800 rounded mb-2"></div>
        <div className="h-4 bg-gray-800 rounded mb-2"></div>
        <div className="h-4 bg-gray-800 rounded mb-6"></div>
        <div className="h-6 bg-gray-800 rounded w-1/4 mb-2"></div>
        <div className="flex gap-3 mb-6">
          {["S", "M", "L", "XL"].map((size) => (
            <div key={size} className="w-12 h-10 bg-gray-800 rounded"></div>
          ))}
        </div>
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-gray-800 rounded"></div>
          <div className="w-12 h-12 bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Cart item skeleton
export const CartItemSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-gray-800 animate-pulse">
    <div className="w-24 h-24 bg-gray-800 rounded-lg flex-shrink-0"></div>
    <div className="flex-1 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
      </div>
      <div className="h-4 bg-gray-800 rounded w-1/3 mb-3"></div>
      <div className="flex items-center gap-3">
        <div className="h-8 bg-gray-800 rounded w-24"></div>
        <div className="h-8 bg-gray-800 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Cart skeleton
export const CartSkeleton = () => (
  <div className="min-h-screen bg-black py-16 px-4">
    <div className="max-w-5xl mx-auto">
      <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <CartItemSkeleton key={index} />
        ))}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-800 rounded w-16"></div>
            <div className="h-6 bg-gray-800 rounded w-20"></div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 h-12 bg-gray-800 rounded"></div>
            <div className="flex-1 h-12 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
