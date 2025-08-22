// No 'use client' here — Server Component

import { client } from "@/sanity/lib/client";
import NewestList from "./NewestList";

async function getData() {
  try {
    const query = `*[_type =='product'] [0...4] | order(_createdAt desc){
      _id,
      price,
      title,
      discount,
      ratings,
     "categories": categories[]->{
        _id,
        name,
        "slug": slug.current
      },
      "slug": slug.current,
      "imageUrl": mainImages[0].asset->url,
      availableQuantity
    }`;
    return await client.fetch(query);
  } catch (error) {
    console.warn('Failed to fetch products:', error);
    return []; // Return empty array on failure
  }
}

export default async function NewestProducts() {
  const data = await getData();

  return <NewestList data={data} />;
}
