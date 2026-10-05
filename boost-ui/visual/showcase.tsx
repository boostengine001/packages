import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BoostProvider,
  UIStylePreset,
  Button,
  Input,
  Card,
  Alert,
  Badge,
  Tabs,
  Accordion,
  Toast,
  DataTable,
  ProductCard,
  PricingTable,
  HeroSection,
  Pagination,
  StarRating,
  Modal,
  Navbar,
  Footer,
  CartDrawer,
  LoginForm,
  Alert as AlertBox,
  Badge as BadgeChip,
  CommandPalette,
  OrderSummary,
  Stepper,
  CouponInput,
  Drawer,
} from '../src/index';

// Read ?preset=X&component=Y from the URL and render one canned showcase.
const params = new URLSearchParams(window.location.search);
const preset = (params.get('preset') || 'minimal') as UIStylePreset;
const mode = (params.get('mode') || 'light') as 'light' | 'dark';
const component = params.get('component') || 'button';

const SHOWCASE: Record<string, React.ReactElement> = {
  button: (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button isLoading>Loading</Button>
    </div>
  ),
  input: (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '420px' }}>
      <Input label="Email" placeholder="you@example.com" />
      <Input label="Phone" error="Enter a valid number" />
      <Input label="Name" helperText="As printed on your ID" />
    </div>
  ),
  card: (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <Card style={{ padding: '24px', maxWidth: '280px' }}>
        <Badge variant="success">Active</Badge>
        <h3 style={{ margin: '12px 0 8px' }}>Plan Overview</h3>
        <p style={{ margin: 0, color: '#64748b' }}>Everything you need to launch.</p>
      </Card>
      <Alert title="Heads up" variant="warning">
        Your trial ends in 3 days.
      </Alert>
    </div>
  ),
  tabs: (
    <Tabs
      items={[
        { id: 'a', label: 'Overview', content: 'Overview content goes here.' },
        { id: 'b', label: 'Analytics', content: 'Analytics content goes here.' },
        { id: 'c', label: 'Settings', content: 'Settings content goes here.' },
      ]}
    />
  ),
  accordion: (
    <Accordion
      defaultExpanded={['one']}
      items={[
        { id: 'one', title: 'What is Boost UI?', content: 'A zero-dependency component kit.' },
        { id: 'two', title: 'Is it accessible?', content: 'Yes — lint-enforced a11y.' },
      ]}
    />
  ),
  toast: (
    <div style={{ display: 'grid', gap: '12px' }}>
      <Toast message="Changes saved" variant="success" />
      <Toast message="Payment failed" variant="error" />
      <Toast message="Uploading file..." variant="loading" />
    </div>
  ),
  table: (
    <DataTable
      columns={[
        { header: 'Product', key: 'name' },
        { header: 'Qty', key: 'qty' },
      ]}
      data={[
        { name: 'Widget', qty: 3 },
        { name: 'Gadget', qty: 7 },
      ]}
    />
  ),
  product: <ProductCard id="p1" title="Wireless Earbuds" price={2999} rating={4.5} reviewCount={214} />,
  pricing: (
    <PricingTable
      tiers={[
        { id: 's', name: 'Starter', priceMonthly: 0, features: ['1 project'] },
        { id: 'p', name: 'Pro', priceMonthly: 29, features: ['Unlimited'], badge: 'Popular' },
      ]}
    />
  ),
  hero: (
    <HeroSection
      title="Ship your store in minutes"
      description="Zero-config UI kit for modern commerce."
      primaryAction={{ label: 'Get started' }}
    />
  ),
  pagination: <Pagination currentPage={2} totalPages={8} onPageChange={() => {}} />,
  rating: (
    <div style={{ display: 'grid', gap: '12px' }}>
      <StarRating rating={4.5} reviewCount={1284} />
      <StarRating rating={3.2} reviewCount={87} />
    </div>
  ),
  modal: (
    <Modal isOpen onClose={() => {}} title="Delete item" description="This cannot be undone.">
      <p>Are you sure you want to delete this item?</p>
    </Modal>
  ),
  navbar: (
    <Navbar
      brandName="Boost Store"
      navLinks={[
        { label: 'Shop', href: '/shop' },
        { label: 'Deals', href: '/deals', badge: 'HOT' },
        { label: 'Support', href: '/support' },
      ]}
      cartCount={3}
      wishlistCount={1}
    />
  ),
  footer: (
    <Footer
      brandName="Boost Store"
      description="The best gear for modern creators"
      columns={[
        { title: 'Shop', links: [{ label: 'All Products', href: '/products' }] },
        { title: 'Support', links: [{ label: 'Contact Us', href: '/contact' }] },
      ]}
      copyrightYear={2026}
    />
  ),
  cart: (
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
  ),
  'login-form': <LoginForm title="Welcome back" />,
  alert: (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '520px' }}>
      <AlertBox variant="info" title="Heads up">Your trial ends in 3 days.</AlertBox>
      <AlertBox variant="success" title="Payment received">Order #1042 is confirmed.</AlertBox>
      <AlertBox variant="warning" title="Low stock">Only 2 items left.</AlertBox>
      <AlertBox variant="error" title="Payment failed">Please retry with another card.</AlertBox>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <BadgeChip variant="success">In stock</BadgeChip>
        <BadgeChip variant="destructive">Sold out</BadgeChip>
        <BadgeChip variant="warning">Low stock</BadgeChip>
        <BadgeChip variant="outline">New</BadgeChip>
      </div>
    </div>
  ),
  command: <CommandPalette isOpen onClose={() => {}} />,
  summary: (
    <OrderSummary
      subtotal={3997}
      discount={200}
      shippingFee={0}
      tax={180}
      freeShippingThreshold={5000}
    />
  ),
  stepper: (
    <Stepper
      steps={[
        { id: 'a', label: 'Cart' },
        { id: 'b', label: 'Address' },
        { id: 'c', label: 'Payment' },
      ]}
      activeStep={1}
    />
  ),
  coupon: (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '420px' }}>
      <CouponInput onApply={() => {}} />
      <CouponInput appliedCode="BOOST10" discountText="10% off" onRemove={() => {}} />
    </div>
  ),
  drawer: (
    <Drawer isOpen onClose={() => {}} title="Filters" footer={<button>Apply</button>}>
      <p>Filter controls go here.</p>
    </Drawer>
  ),
};

function App() {
  const element = SHOWCASE[component] ?? SHOWCASE.button;
  return (
    <BoostProvider defaultStylePreset={preset} defaultMode={mode}>
      <div style={{ padding: '48px', fontFamily: 'system-ui, sans-serif' }}>
        <div data-testid="meta" data-preset={preset} data-component={component} />
        {element}
      </div>
    </BoostProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
