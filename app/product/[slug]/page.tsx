
import { fullProduct } from "@/app/Components/interface";
import { client } from "@/sanity/lib/client";
import ProductPageClient from "./ProducClient";





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
      "categoryName": category->name,
        "categorySlug": category->slug,
    category->{
      title,
      slug
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
  params: { slug: string };
}) {
  const data: fullProduct = await getData(params.slug);


   if (!data) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    )
  }

  return <ProductPageClient data={data} />
}
