import prisma from '../config/prisma.js';

// POST /api/friends - Trimite cerere de prietenie
export const addFriend = async (req, res) => {
  try {
    const { friendId, preference } = req.body;
    const userId = req.session.userId;

    if (!friendId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Friend ID is required'
      });
    }

    if (parseInt(friendId) === userId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'You cannot add yourself as a friend'
      });
    }

    const friendUser = await prisma.user.findUnique({
      where: { id: parseInt(friendId) }
    });

    if (!friendUser) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: parseInt(friendId) },
          { userId: parseInt(friendId), friendId: userId }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Friendship already exists or pending'
      });
    }

    if (preference) {
      const validPreferences = ['OMNIVOR', 'VEGETARIAN', 'CARNIVOR', 'VEGAN', 'RAW_VEGAN', 'ALTCEVA'];
      if (!validPreferences.includes(preference)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid preference value'
        });
      }
    }


    const friendship = await prisma.friendship.create({
      data: {
        userId: userId,
        friendId: parseInt(friendId),
        preference: preference || null,
        status: 'PENDING'
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendship
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while adding friend'
    });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { status } = req.query; 

    const whereClause = {
      OR: [
        { userId: userId },
        { friendId: userId }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const friendships = await prisma.friendship.findMany({
      where: whereClause,
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedFriendships = friendships.map(friendship => {
      const isSender = friendship.userId === userId;
      return {
        id: friendship.id,
        status: friendship.status,
        preference: friendship.preference,
        createdAt: friendship.createdAt,
        friend: isSender ? friendship.friend : friendship.user,
        isSender: isSender 
      };
    });

    res.status(200).json({
      count: formattedFriendships.length,
      friendships: formattedFriendships
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching friends'
    });
  }
};

// DELETE /api/friends/:id - Sterge o prietenie
export const deleteFriendship = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(id) }
    });

    if (!friendship) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Friendship not found'
      });
    }

    if (friendship.userId !== userId && friendship.friendId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to delete this friendship'
      });
    }

    await prisma.friendship.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      message: 'Friendship deleted successfully'
    });
  } catch (error) {
    console.error('Delete friendship error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while deleting friendship'
    });
  }
};

// PATCH /api/friends/:id/accept - Accepta cererea de prietenie
export const acceptFriendship = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(id) },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!friendship) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Friendship request not found'
      });
    }

    if (friendship.friendId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to accept this friend request'
      });
    }

    if (friendship.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Validation error',
        message: `Friend request is already ${friendship.status.toLowerCase()}`
      });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(id) },
      data: { status: 'ACCEPTED' },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Friend request accepted',
      friendship: updatedFriendship
    });
  } catch (error) {
    console.error('Accept friendship error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while accepting friend request'
    });
  }
};

// PATCH /api/friends/:id/reject - Respinge cererea de prietenie
export const rejectFriendship = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(id) },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!friendship) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Friendship request not found'
      });
    }

    if (friendship.friendId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to reject this friend request'
      });
    }

    if (friendship.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Validation error',
        message: `Friend request is already ${friendship.status.toLowerCase()}`
      });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Friend request rejected',
      friendship: updatedFriendship
    });
  } catch (error) {
    console.error('Reject friendship error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while rejecting friend request'
    });
  }
};

// GET /api/friends/:friendId/foods - Obtine alimentele disponibile ale unui prieten
export const getFriendFoods = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.session.userId;

    const friendUser = await prisma.user.findUnique({
      where: { id: parseInt(friendId) }
    });

    if (!friendUser) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: parseInt(friendId), status: 'ACCEPTED' },
          { userId: parseInt(friendId), friendId: userId, status: 'ACCEPTED' }
        ]
      }
    });

    if (!friendship) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You must be friends with this user to view their available foods'
      });
    }

    const products = await prisma.product.findMany({
      where: {
        ownerId: parseInt(friendId),
        isAvailable: true
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
      },
      orderBy: {
        expiresOn: 'asc'
      }
    });

    res.status(200).json({
      count: products.length,
      friend: {
        id: friendUser.id,
        name: friendUser.name,
        email: friendUser.email
      },
      products
    });
  } catch (error) {
    console.error('Get friend foods error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching friend foods'
    });
  }
};
