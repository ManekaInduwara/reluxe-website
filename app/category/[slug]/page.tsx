
import { client } from "@/sanity/lib/client";
import CategoryList from "../CategoryList";

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
      throw new Error('Category not found');
    }

    return {
      products: result.products || [],
      categoryName: result.name
    };
  } catch (error) {
    console.error('Error fetching category products:', error);
    return {
      products: [],
      categoryName: ''
    };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!params?.slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Category not found
      </div>
    );
  }

  const { products, categoryName } = await getCategoryProducts(params.slug);

  return (
    <main>
      <CategoryList 
        data={products} 
        categoryName={categoryName} 
      />
    </main>
  );
}

export async function generateStaticParams() {
  try {
    const categories = await client.fetch(
      `*[_type == "category"] {
        "slug": slug.current
      }`
    );
    
    return categories.map((category: { slug: string }) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}