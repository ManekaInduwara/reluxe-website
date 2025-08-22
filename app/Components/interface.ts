export interface simplifiedProduct{
    _id:string;
    imageUrl:string;
    price:number;
    slug:string;
    title:string;
     categoryName: string;
    availableQuantity:number;
}

export interface SizeGuideRow {
  label: string;
  values: string[];
}

export interface ProductSizeGuide {
  active?: boolean;
  title?: string;
  description?: string;
  measurementImage?: any;
  chartType?: 'standard' | 'numerical' | 'alpha' | 'custom';
  sizeChart?: Array<{
    region: string;
    measurement: string;
    values: {
      XS?: string;
      S?: string;
      M?: string;
      L?: string;
      XL?: string;
      XXL?: string;
      customSizes?: Array<{
        label: string;
        value: string;
      }>;
    };
  }>;
  fitNotes?: string;
  disclaimer?: string;
}



export interface fullProduct {
  rating: number | undefined;
   categories?: {
    title: string;
    slug: string;
  }[];
  feedbacks: never[];
   sizeGuide?: ProductSizeGuide;
  _id: string;
  title: string;
  description?: string;
  slug: {
    current: string;
  };
  mainImages: SanityImage[];
  price: number;
  discount?: number;
  category: {
    title: string;
    slug: {
      current: string;
    };
  };
  colors?: ColorVariant[];
}

export interface SanityImage {
  _key: string;
  asset: {
    _ref: string;
    _type: "reference";
    url: string;
     imageUrl:string;
  };
}

export interface SizeVariant {
  size: string;
  quantity: number;
  amount?: number;
}

export interface ColorVariant {
  _key: string;
  name: string;
  color: {
    hex: string;
  };
  amount?: number;
  quantity: number;
  about?: string;
  images?: SanityImage[];
  sizes?: SizeVariant[];
}

export interface Product {
  _id: string;
  title: string;
  description?: string;
  slug: {
    current: string;
  };
  mainImages: SanityImage[];
  price: number;
  discount?: number;
  availableQuantity: number;
  colors?: ColorVariant[];
  category: {
    _ref: string;
    _type: "reference";
  };
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  color?: string; // Sanity color _key
  colorName?: string; // Display name
  size?: string | null; // Make this consistent with null allowed
  image: string | { _id: string; url: string };
  sku?: string;
  currentQuantity?: number;
}

export interface ProductColor {
  _key: string;
  color: {
    _type: 'color';
    hex: string;
    name?: string;
    alpha?: number;
  };
  quantity: number;
  sizes?: {
    size: string;
    quantity: number;
  }[];
}

export interface SanityProduct {
  _id: string;
  availableQuantity: number;
  colors: ProductColor[];
  sku?: string;
}
