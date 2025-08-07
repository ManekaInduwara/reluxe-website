// reduceStock.ts
import { client } from '@/sanity/lib/client';
import { CartItem, SanityProduct , ProductColor } from '../interface';

const COLOR_HEX_MAP: Record<string, string> = {
  white: '#FFFFFF',
  black: '#000000',
  red: '#FF0000',
  blue: '#0000FF',
  green: '#008000',
  yellow: '#FFFF00',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  brown: '#A52A2A',
  gray: '#808080',
  silver: '#C0C0C0',
  gold: '#FFD700',
  // Add more colors as needed
};

export async function reduceStock(cartItems: CartItem[]): Promise<void> {
  const transaction = client.transaction();
  const now = new Date().toISOString();
  const errors: string[] = [];

  try {
    // First verify all products have sufficient stock
    for (const item of cartItems) {
      const product = await client.fetch<SanityProduct>(
        `*[_id == $id][0]{
          _id,
          availableQuantity,
          colors[]{
            _key,
            color,
            quantity,
            sizes[]{
              size,
              quantity
            }
          },
          sku
        }`,
        { id: item.productId }
      );

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Check overall available quantity
      if (product.availableQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.sku || product._id}`);
      }

      // Check color-specific quantity if color is specified
      if (item.color) {
        const colorVariant = product.colors.find(c => c._key === item.color);
        if (!colorVariant) {
          throw new Error(`Color variant ${item.color} not found for product ${product._id}`);
        }

        if (colorVariant.quantity < item.quantity) {
          throw new Error(`Insufficient stock for color ${item.colorName || item.color} in ${product.sku || product._id}`);
        }

        // Check size-specific quantity if size is specified
        if (item.size && colorVariant.sizes) {
          const sizeVariant = colorVariant.sizes.find(s => s.size === item.size);
          if (!sizeVariant) {
            throw new Error(`Size ${item.size} not available for color ${item.color}`);
          }

          if (sizeVariant.quantity < item.quantity) {
            throw new Error(`Insufficient stock for size ${item.size} in color ${item.color}`);
          }
        }
      }
    }

    // All checks passed - proceed with stock reduction
    for (const item of cartItems) {
      const patch = client
        .patch(item.productId)
        .setIfMissing({ lastStockUpdate: now });

      // Reduce overall available quantity
      patch.dec({ availableQuantity: item.quantity });

      // Reduce color variant quantity if specified
      if (item.color) {
        const colorIdx = `colors[_key=="${item.color}"]`;
        
        // Reduce color-level quantity
        patch.dec({
          [`${colorIdx}.quantity`]: item.quantity
        });

        // Update color name if provided
        if (item.colorName) {
          patch.set({
            [`${colorIdx}.color`]: {
              _type: 'color',
              hex: getColorHex(item.colorName),
              name: item.colorName,
              alpha: 1
            }
          });
        }

        // Reduce size quantity if specified
        if (item.size) {
          const sizeIdx = `colors[_key=="${item.size}"]`;
          patch.dec({
            [`${colorIdx}.sizes[size=="${item.size}"].quantity`]: item.quantity
          });
        }
      }

      transaction.patch(patch);
    }

    await transaction.commit();

  } catch (error) {
    console.error('Stock reduction failed:', error);
    throw error; // Re-throw for the calling function to handle
  }
}


function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[normalized] || '#000000';
}

export const checkStockAvailability = async (cartItems: CartItem[]): Promise<{ valid: boolean; outOfStockItems: string[] }> => {
  const outOfStockItems: string[] = [];

  for (const item of cartItems) {
    try {
      const product = await client.fetch(
        `*[_id == $id][0]{
          availableQuantity,
          "colorVariant": colors[_key == $color][0] {
            quantity,
            "sizeVariant": sizes[size == $size][0] {
              quantity
            }
          }
        }`,
        { id: item.productId, color: item.color, size: item.size }
      );

      // Check product-level availability
      if (product.availableQuantity < item.quantity) {
        outOfStockItems.push(item.title);
        continue;
      }

      // Check color-level availability if exists
      if (product.colorVariant?.quantity !== undefined && 
          product.colorVariant.quantity < item.quantity) {
        outOfStockItems.push(item.title);
        continue;
      }

      // Check size-level availability if exists
      if (item.size && 
          product.colorVariant?.sizeVariant?.quantity !== undefined && 
          product.colorVariant.sizeVariant.quantity < item.quantity) {
        outOfStockItems.push(item.title);
      }

    } catch (error) {
      console.error(`Failed to check stock for product ${item.productId}:`, error);
      outOfStockItems.push(item.title);
    }
  }

  return {
    valid: outOfStockItems.length === 0,
    outOfStockItems
  };
};
