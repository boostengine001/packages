import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { requireAdmin } from '../middleware/auth';
import { validate, rules } from '../middleware/validator';

export const categoriesRouter = Router();

// Public category views
categoriesRouter.get('/', categoryController.getCategories);

categoriesRouter.get(
  '/:slug',
  validate({
    params: {
      slug: [rules.required('Category slug')],
    },
  }),
  categoryController.getCategoryBySlug
);

// Admin-only category mutations with validation
categoriesRouter.post(
  '/',
  requireAdmin,
  validate({
    body: {
      name: [rules.required('Category name'), rules.string('Category name')],
    },
  }),
  categoryController.createCategory
);

categoriesRouter.put(
  '/:id',
  requireAdmin,
  validate({
    params: {
      id: [rules.required('Category ID')],
    },
  }),
  categoryController.updateCategory
);

categoriesRouter.delete(
  '/:id',
  requireAdmin,
  validate({
    params: {
      id: [rules.required('Category ID')],
    },
  }),
  categoryController.deleteCategory
);
