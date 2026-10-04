import * as React from 'react';
import {
  ProductCard,
  Price,
  StarRating,
  QuantitySelector,
  CartDrawer,
  OrderSummary,
  TrustBadges,
  PincodeChecker,
} from '../src/index';

export const Product = () => (
  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
    <ProductCard id="p1" title="Wireless Earbuds Pro" price={2999} compareAtPrice={4999} rating={4.5} reviewCount={214} />
    <ProductCard id="p2" title="Smart Watch Series 5" price={12999} rating={4.2} reviewCount={87} inStock={false} />
  </div>
);

export const PricesAndRatings = () => (
  <div style={{ display: 'grid', gap: '16px' }}>
    <Price amount={1499} originalAmount={2999} showSavings />
    <StarRating rating={4.5} reviewCount={1284} />
    <StarRating rating={3.2} reviewCount={87} />
  </div>
);

export const Quantity = () => {
  const [qty, setQty] = React.useState(1);
  return <QuantitySelector value={qty} onChange={setQty} min={1} max={10} />;
};

export const Cart = () => (
  <CartDrawer
    isOpen
    onClose={() => {}}
    items={[
      { id: 'a', title: 'Wireless Earbuds', price: 2999, quantity: 1 },
      { id: 'b', title: 'Case Cover', price: 499, quantity: 2 },
    ]}
    subtotal={3997}
    freeShippingThreshold={5000}
  />
);

export const Checkout = () => (
  <div style={{ display: 'grid', gap: '24px', maxWidth: '480px' }}>
    <OrderSummary subtotal={3997} discount={200} shippingFee={0} tax={180} freeShippingThreshold={5000} />
    <TrustBadges />
    <PincodeChecker />
  </div>
);
