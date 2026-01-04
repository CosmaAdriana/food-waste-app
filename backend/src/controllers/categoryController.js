import prisma from '../config/prisma.js';

// GET /api/categories - Lista categorii
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching categories'
    });
  }
};
