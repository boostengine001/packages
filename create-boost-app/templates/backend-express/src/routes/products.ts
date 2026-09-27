import { Router } from 'express';
import * as productController from '../controllers/productController';
import { requireAdmin } from '../middleware/auth';
import { validate, rules } from '../middleware/validator';

export const productsRouter = Router();

// Public catalog endpoints
productsRouter.get('/featured', productController.getFeaturedProducts);
productsRouter.get('/', productController.getProducts);

productsRouter.get(
  '/:idOrSlug',
  validate({
    params: {
      idOrSlug: [rules.required('Product ID or slug')],
    },
  }),
  productController.getProductByIdOrSlug
);

// Admin-only mutation endpoints with validation
productsRouter.post(
  '/',
  requireAdmin,
  validate({
    body: {
      title: [rules.required('Product title'), rules.string('Product title')],
      price: [rules.required('Price'), rules.positiveNumber('Price')],
      category: [rules.required('Category')],
    },
  }),
  productController.createProduct
);

productsRouter.put(
  '/:id',
  requireAdmin,
  validate({
    params: {
      id: [rules.required('Product ID')],
    },
  }),
  productController.updateProduct
);

productsRouter.delete(
  '/:id',
  requireAdmin,
  validate({
    params: {
      id: [rules.required('Product ID')],
    },
  }),
  productController.deleteProduct
);

export { DEMO_CATALOG } from '../controllers/productController';
