import { client } from "@/sanity/lib/client";
import CategoryList from "../CategoryList";
import CategoryNotFound from "./CategoryNotFound";
import { Suspense } from "react";
import CategoryLoading from "./CategoryLoading";
import React from "react";
import GoBackButton from "./GoBackButton"; // Move to separate file

interface Product {
  _id: string;
  title: string;
  price: number;
  slug: string;
  categoryName: string;
  discount: number;
  imageUrl: string;
  availableQuantity: number;
  rating?: number;
}

async function getCategoryProducts(slug: string): Promise<{
  products: Product[];
  categoryName: string;
  exists: boolean;
}> {
  try {
    const result = await client.fetch(
      `*[_type == 'category' && slug.current == $slug][0] {
        name,
        "products": *[_type == 'product' && references(^._id)] | order(_createdAt desc) {
          _id,
          price,
          title,
          discount,
          "categoryName": ^.name,
          "slug": slug.current,
          "imageUrl": mainImages[0].asset->url,
          availableQuantity,
          rating
        }
      }`,
      { slug }
    );

    if (!result) {
      return { products: [], categoryName: "", exists: false };
    }

    return {
      products: result.products || [],
      categoryName: result.name,
      exists: true,
    };
  } catch (error) {
    console.error("Error fetching category products:", error);
    return { products: [], categoryName: "", exists: false };
  }
}

// Create a separate component for the empty state that can be a Client Component
function EmptyCategoryState({ categoryName }: { categoryName: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="max-w-md text-center p-6">
        <h1 className="text-2xl font-bold mb-4">No Products in {categoryName}</h1>
        <p className="text-gray-600 mb-6">
          This category exists but doesn't contain any products yet.
        </p>
        <GoBackButton />
      </div>
    </div>
  );
}

// Update the interface to match Next.js expectations
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  // Await the params promise to resolve the slug
  const { slug } = await params;

  if (!slug) {
    return <CategoryNotFound />;
  }

  const { products, categoryName, exists } = await getCategoryProducts(slug);

  if (!exists) {
    return <CategoryNotFound attemptedSlug={slug} />;
  }

  if (products.length === 0) {
    return <EmptyCategoryState categoryName={categoryName} />;
  }

  return (
    <main>
      <Suspense fallback={<CategoryLoading />}>
        <CategoryList data={products} categoryName={categoryName} />
      </Suspense>
    </main>
  );
}

export async function generateStaticParams() {
  try {
    const categories = await client.fetch(
      `*[_type == "category"] { "slug": slug.current }`
    );

    return categories.map((category: { slug: string }) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}