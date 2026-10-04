import * as React from 'react';
import {
  Alert,
  Toast,
  ProgressBar,
  Spinner,
  Loader,
  Skeleton,
  EmptyState,
  ErrorState,
  SuccessMessage,
  Breadcrumb,
  Pagination,
  Stepper,
} from '../src/index';

export const Alerts = () => (
  <div style={{ display: 'grid', gap: '12px', maxWidth: '520px' }}>
    <Alert variant="info" title="Heads up">Your trial ends in 3 days.</Alert>
    <Alert variant="success" title="Payment received">Order #1042 is confirmed.</Alert>
    <Alert variant="warning" title="Low stock">Only 2 items left.</Alert>
    <Alert variant="error" title="Payment failed">Please retry with another card.</Alert>
  </div>
);

export const Toasts = () => (
  <div style={{ display: 'grid', gap: '12px', maxWidth: '420px' }}>
    <Toast message="Changes saved" variant="success" />
    <Toast message="Uploading file..." variant="loading" />
    <Toast message="Payment failed" variant="error" />
  </div>
);

export const ProgressAndLoading = () => (
  <div style={{ display: 'grid', gap: '20px', maxWidth: '420px' }}>
    <ProgressBar value={66} label="Uploading" showPercent />
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Spinner />
      <Loader />
    </div>
    <Skeleton variant="rectangular" height={80} />
    <Skeleton variant="text" width="60%" />
  </div>
);

export const States = () => (
  <div style={{ display: 'grid', gap: '20px', maxWidth: '520px' }}>
    <EmptyState title="No orders yet" description="Start shopping to see orders here" actionLabel="Shop now" onAction={() => {}} />
    <ErrorState title="Something went wrong" message="We could not load your orders." onRetry={() => {}} />
    <SuccessMessage title="Order placed" message="You'll get a confirmation email shortly." />
  </div>
);

export const Navigation = () => (
  <div style={{ display: 'grid', gap: '24px' }}>
    <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Electronics', href: '/e' }, { label: 'Headphones' }]} />
    <Stepper steps={[{ id: 'a', label: 'Cart' }, { id: 'b', label: 'Address' }, { id: 'c', label: 'Payment' }]} activeStep={1} />
    <Pagination currentPage={2} totalPages={8} onPageChange={() => {}} />
  </div>
);
