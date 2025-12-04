import prisma from '../config/prisma.js';

// GET /api/foods/:id/requests - Vezi toate request-urile pentru un produs
export const getFoodRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
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
        message: 'You can only view requests for your own food items'
      });
    }

    const requests = await prisma.request.findMany({
      where: {
        productId: parseInt(id)
      },
      include: {
        claimer: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      count: requests.length,
      productId: parseInt(id),
      productName: product.name,
      requests
    });
  } catch (error) {
    console.error('Get food requests error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching requests'
    });
  }
};

// PATCH /api/requests/:id/approve - Aproba un request
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: {
          include: {
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

    if (!request) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Request not found'
      });
    }

    if (request.product.ownerId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only approve requests for your own food items'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Validation error',
        message: `Request is already ${request.status.toLowerCase()}`
      });
    }

    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { status: 'APPROVED' },
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

    res.status(200).json({
      message: 'Request approved successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while approving request'
    });
  }
};

// PATCH /api/requests/:id/reject - Respinge un request
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: {
          include: {
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

    if (!request) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Request not found'
      });
    }

    if (request.product.ownerId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only reject requests for your own food items'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Validation error',
        message: `Request is already ${request.status.toLowerCase()}`
      });
    }

    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' },
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

    res.status(200).json({
      message: 'Request rejected successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while rejecting request'
    });
  }
};

// GET /api/requests/received - Vezi toate request-urile primite pentru produsele tale
export const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { status } = req.query;

    const whereClause = {
      product: {
        ownerId: userId
      }
    };

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            category: true
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
      requests
    });
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching received requests'
    });
  }
};

