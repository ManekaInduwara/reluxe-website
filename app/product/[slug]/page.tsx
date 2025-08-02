
import { fullProduct } from "@/app/Components/interface";
import { client } from "@/sanity/lib/client";
import ProductPageClient from "./ProducClient";
import Newset from "@/app/Components/Newset";
import ProductNotFound from "../ProductNotFound";





async function getData(slug:string){
   const query = `*[_type == "product" && slug.current == "${slug}"][0]{
  _id,
  title,
  slug,
  price,
  discount,
  sizeGuide[] {
    label,
    values
  },
  mainImages[]{
    ...,
    asset->{
      _id,
      url
    }
  },
  description,
    "categories": categories[]->{
      _id,
      name,
      "slug": slug.current
    },
  colors[]{
    _key,
    name,
    color {
      hex
    },
    quantity,
    amount,
    about,
    images[]{
      ...,
      asset->{
        _id,
        url
      }
    },
    sizes[]{
      size,
      quantity,
      amount
    }
  },
  sizeGuide {
    ...,
    measurementImage {
      ...,
      asset->
    }
  }
}`;
  const data = await client.fetch(query);
  return data;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const data: fullProduct = await getData(resolvedParams.slug);


   if (!data) {
    return (
     <ProductNotFound attemptedSlug={resolvedParams.slug} />
    )
  }

  return (
  <ProductPageClient data={data} />
     
  )
}
