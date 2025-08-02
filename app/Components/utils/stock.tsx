import { client } from '@/sanity/lib/client';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  color: string; // This should be the color _key
  colorName: string; // Add this if you need the display name
  size: string | null;
  image: string | { _id: string; url: string };
  currentQuantity?: number;
  sizeQuantity?: number;
}

export const reduceStock = async (cartItems: CartItem[]) => {
  for (const item of cartItems) {
    const product = await client.fetch(`*[_id == $id][0]`, {
      id: item.productId,
    });

    if (!product?.colors) continue; // Safety check

    // Reduce availableQuantity at the product level
    let newAvailableQuantity = (product.availableQuantity || 0) - item.quantity;
    if (newAvailableQuantity < 0) newAvailableQuantity = 0;

    const updatedColors = product.colors.map((colorItem: any) => {
      // Match by _key (assuming item.color is the _key)
      if (colorItem._key !== item.color) {
        return colorItem; // Keep untouched
      }

      const updatedColor = { ...colorItem };

      // Update color name if provided and different
      if (item.colorName && updatedColor.color !== item.colorName) {
        updatedColor.color = item.colorName;
      }

      // Reduce color-level quantity
      if (typeof updatedColor.quantity === 'number') {
        updatedColor.quantity = Math.max(
          updatedColor.quantity - item.quantity,
          0
        );
      }

      // Reduce size-level quantity if applicable
      if (item.size && Array.isArray(updatedColor.sizes)) {
        updatedColor.sizes = updatedColor.sizes.map((sizeItem: any) => {
          if (sizeItem.size !== item.size) {
            return sizeItem;
          }
          return {
            ...sizeItem,
            quantity: Math.max(
              (sizeItem.quantity || 0) - item.quantity,
              0
            ),
          };
        });
      }

      return updatedColor;
    });

    // Patch updated colors[] and availableQuantity
    await client
      .patch(item.productId)
      .set({
        colors: updatedColors,
        availableQuantity: newAvailableQuantity,
      })
      .commit();
  }
};