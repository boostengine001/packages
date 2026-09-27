import { Product, Category, Setting, Banner } from './models';
import { DEMO_CATALOG } from './routes/products';

export async function seedInitialData() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding initial products into MongoDB...');
      for (const item of DEMO_CATALOG) {
        await Product.create({
          title: item.title,
          name: item.title,
          slug: item.slug,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          category: item.category,
          image: item.image,
          images: item.images,
          description: item.description,
          rating: item.rating,
          reviewsCount: item.reviewsCount,
          inStock: item.inStock,
          hsn: item.hsn,
          gstRate: item.gstRate,
          sizes: item.sizes,
          colors: item.colors,
          isFeatured: item.isFeatured,
          isActive: true,
        });
      }
      console.log(`✔ Successfully seeded ${DEMO_CATALOG.length} demo products.`);
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Hoodies', slug: 'hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
        { name: 'T-Shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', displayOrder: 2 },
        { name: 'Bottoms', slug: 'bottoms', image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80', displayOrder: 3 },
        { name: 'Fragrances', slug: 'fragrances', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', displayOrder: 4 },
        { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', displayOrder: 5 },
      ];
      await Category.insertMany(defaultCategories);
      console.log(`✔ Successfully seeded ${defaultCategories.length} categories.`);
    }

    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create({
        storeName: process.env.BUSINESS_NAME || 'Boost D2C Store',
        contactEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
        storeAddress: '123 Market Street, New Delhi, India',
        phone: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        theme: 'dark',
        font: 'inter',
        primaryColor: '#6366f1',
        primaryColorDark: '#4f46e5',
        isCodEnabled: true,
        isRazorpayEnabled: true,
      });
      console.log('✔ Successfully initialized default store settings.');
    }

    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.create({
        title: 'Drop 04: Cyberpunk Heavyweights',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80',
        link: '/category/hoodies',
        buttonText: 'Explore Drop',
        isActive: true,
        isHeroBanner: true,
        desktopOrder: 1,
        mobileOrder: 1,
      });
      console.log('✔ Successfully seeded hero banner.');
    }
  } catch (err: any) {
    console.error('Initial seeding notice:', err.message);
  }
}
