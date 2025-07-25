// components/StockAlert.tsx
import React from 'react';

interface StockAlertProps {
  quantity: number;
}

const StockAlert: React.FC<StockAlertProps> = ({ quantity }) => {
  if (quantity <= 10 && quantity > 0) {
    return (
     <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 p-2 rounded-md mb-3 text-center text-sm font-medium">
        Hurry! Only {quantity} left in stock.
      </div>
    );
  }

  if (quantity === 0) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 rounded-md mb-3 text-center text-sm font-semibold uppercase tracking-wide">
        Out of Stock
      </div>
    );
  }

  return null;
};

export default StockAlert;