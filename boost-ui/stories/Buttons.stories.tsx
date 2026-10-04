import * as React from 'react';
import { Button, IconButton, ButtonGroup, LinkButton, Badge, Chip, Avatar } from '../src/index';

export const Buttons = () => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Delete</Button>
    <Button isLoading>Loading</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
);

export const IconButtonsAndGroup = () => (
  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
    <IconButton aria-label="Add">+</IconButton>
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="primary">Month</Button>
    </ButtonGroup>
    <LinkButton href="#">Link button</LinkButton>
  </div>
);

export const BadgesChipsAvatars = () => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge variant="success">In stock</Badge>
    <Badge variant="destructive">Sold out</Badge>
    <Badge variant="warning">Low stock</Badge>
    <Chip label="Shoes" selected onDelete={() => {}} />
    <Chip label="Bags" />
    <Avatar name="Aarav Sharma" />
    <Avatar name="Priya Verma" status="online" />
  </div>
);
