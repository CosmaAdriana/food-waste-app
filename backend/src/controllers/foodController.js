import prisma from '../config/prisma.js';

// POST /api/foods - Creeaza un aliment
export const createFood = async (req, res) => {
  try {
    const { name, categoryId, expiresOn, notes } = req.body;
    const userId = req.session.userId;

    if (!name || !expiresOn) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and expiration date are required'
      });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Category not found'
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId: categoryId ? parseInt(categoryId) : null,
        expiresOn: new Date(expiresOn),
        notes: notes || null,
        isAvailable: false, 
        ownerId: userId
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Food item created successfully',
      product
    });
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while creating food item'
    });
  }
};

// GET /api/foods - Afiseaza alimentele userului
export const getFoods = async (req, res) => {
  try {
    const userId = req.session.userId;

    const products = await prisma.product.findMany({
      where: {
        ownerId: userId
      },
      include: {
        category: true,
        requests: {
          include: {
            claimer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        expiresOn: 'asc' 
      }
    });

    res.status(200).json({
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching food items'
    });
  }
};

// PUT /api/foods/:id - Actualizeaza un aliment
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, expiresOn, isAvailable, notes } = req.body;
    const userId = req.session.userId;


    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Food item not found'
      });
    }

    if (existingProduct.ownerId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to update this food item'
      });
    }

    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Category not found'
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : null;
    if (expiresOn !== undefined) updateData.expiresOn = new Date(expiresOn);
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (notes !== undefined) updateData.notes = notes;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Food item updated successfully',
      product
    });
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while updating food item'
    });
  }
};

// DELETE /api/foods/:id - Sterge un aliment
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Food item not found'
      });
    }

    if (existingProduct.ownerId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to delete this food item'
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while deleting food item'
    });
  }
};

// PATCH /api/foods/:id/mark-available - Marcheaza un aliment ca disponibil
export const markAvailable = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Food item not found'
      });
    }

    if (existingProduct.ownerId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to modify this food item'
      });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isAvailable: true },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Food item marked as available',
      product
    });
  } catch (error) {
    console.error('Mark available error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while marking food item as available'
    });
  }
};

// GET /api/foods/expiring - Alimente care expira în următoarele 3 zile
export const getExpiringFoods = async (req, res) => {
  try {
    const userId = req.session.userId;

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const products = await prisma.product.findMany({
      where: {
        ownerId: userId,
        expiresOn: {
          gte: now,
          lte: threeDaysFromNow
        }
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        requests: {
          include: {
            claimer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        expiresOn: 'asc'
      }
    });

    res.status(200).json({
      count: products.length,
      expiringIn: '3 days',
      products
    });
  } catch (error) {
    console.error('Get expiring foods error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching expiring food items'
    });
  }
};

// POST /api/foods/:id/claim - Claim un produs disponibil
export const claimFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Food item not found'
      });
    }

    if (product.ownerId === userId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'You cannot claim your own food item'
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'This food item is not available for claiming'
      });
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: product.ownerId, status: 'ACCEPTED' },
          { userId: product.ownerId, friendId: userId, status: 'ACCEPTED' }
        ]
      }
    });

    if (!friendship) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You must be friends with the owner to claim their food items'
      });
    }

    const existingRequest = await prisma.request.findUnique({
      where: {
        productId_claimerId: {
          productId: parseInt(id),
          claimerId: userId
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        error: 'Validation error',
        message: `You already have a ${existingRequest.status.toLowerCase()} request for this item`
      });
    }

    const request = await prisma.request.create({
      data: {
        productId: parseInt(id),
        claimerId: userId,
        status: 'PENDING'
      },
      include: {
        product: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        claimer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Claim request sent successfully',
      request
    });
  } catch (error) {
    console.error('Claim food error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while claiming food item'
    });
  }
};

// GET /api/foods/my-claims - Produsele carora le-am facut claim

export const getMyClaims = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { status } = req.query;

    const whereClause = {
      claimerId: userId
    };

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        claimer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      count: requests.length,
      claims: requests
    });
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching your claims'
    });
  }
};

// GET /api/foods/:id/share-link - Genereaza link de partajare pentru un aliment
export const getShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Food item not found'
      });
    }

    if (product.ownerId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only generate share links for your own food items'
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/food/${id}`;
    const text = `Check out this food: ${product.name}${product.category ? ' (' + product.category.name + ')' : ''}!`;

    res.status(200).json({
      shareUrl,
      text
    });
  } catch (error) {
    console.error('Get share link error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while generating share link'
    });
  }
};

// GET /share/food/:id - Endpoint public pentru vizualizarea alimentului partajat
export const getSharedFood = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Food item not found'
      });
    }

    if (!product.isAvailable) {
      return res.status(200).json({
        message: 'This food item is no longer available',
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          isAvailable: false
        }
      });
    }

    res.status(200).json({
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        expiresOn: product.expiresOn,
        notes: product.notes,
        isAvailable: product.isAvailable,
        owner: product.owner
      }
    });
  } catch (error) {
    console.error('Get shared food error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching shared food item'
    });
  }
};
