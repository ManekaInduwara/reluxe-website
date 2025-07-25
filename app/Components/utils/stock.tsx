import { client } from '@/sanity/lib/client';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  image: string;
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
      if (colorItem._key !== item.color) {
        return colorItem; // Keep untouched
      }

      const updatedColor = { ...colorItem };

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
