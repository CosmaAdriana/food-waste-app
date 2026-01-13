import prisma from '../config/prisma.js';

// POST /api/groups - Creeaza un grup nou
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.session.userId;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Group name is required'
      });
    }

    // Validare: max 50 caractere
    if (name.length > 50) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Group name cannot exceed 50 characters'
      });
    }

    // Verifică daca exista deja un grup cu acelasi nume pentru acest user
    const existingGroup = await prisma.group.findUnique({
      where: {
        userId_name: {
          userId: userId,
          name: name.trim()
        }
      }
    });

    if (existingGroup) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'You already have a group with this name'
      });
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        userId: userId
      },
      include: {
        members: {
          include: {
            friendship: {
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
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while creating group'
    });
  }
};

// GET /api/groups - Obtine toate grupurile user-ului
export const getGroups = async (req, res) => {
  try {
    const userId = req.session.userId;

    const groups = await prisma.group.findMany({
      where: {
        userId: userId
      },
      include: {
        members: {
          include: {
            friendship: {
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
            }
          }
        },
        _count: {
          select: {
            members: true,
            products: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      count: groups.length,
      groups
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching groups'
    });
  }
};

// GET /api/groups/:id - Obtine un grup specific
export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          include: {
            friendship: {
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
            }
          }
        },
        _count: {
          select: {
            members: true,
            products: true
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Group not found'
      });
    }

    if (group.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own groups'
      });
    }

    res.status(200).json({ group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching group'
    });
  }
};

// PUT /api/groups/:id - Actualizeaza numele unui grup
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.session.userId;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Group name is required'
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Group name cannot exceed 50 characters'
      });
    }

    const existingGroup = await prisma.group.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGroup) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Group not found'
      });
    }

    if (existingGroup.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own groups'
      });
    }

    // Verifica daca noul nume e diferit si dacă exista deja
    if (name.trim() !== existingGroup.name) {
      const duplicateGroup = await prisma.group.findUnique({
        where: {
          userId_name: {
            userId: userId,
            name: name.trim()
          }
        }
      });

      if (duplicateGroup) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'You already have a group with this name'
        });
      }
    }

    const group = await prisma.group.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
      include: {
        members: {
          include: {
            friendship: {
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
            }
          }
        }
      }
    });

    res.status(200).json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while updating group'
    });
  }
};

// DELETE /api/groups/:id - Sterge un grup
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const existingGroup = await prisma.group.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGroup) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Group not found'
      });
    }

    if (existingGroup.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own groups'
      });
    }

    await prisma.group.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while deleting group'
    });
  }
};

// POST /api/groups/:id/members - Adauga membri intr-un grup
export const addMembersToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { friendshipIds } = req.body;
    const userId = req.session.userId;

    if (!Array.isArray(friendshipIds) || friendshipIds.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'friendshipIds must be a non-empty array'
      });
    }

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Group not found'
      });
    }

    if (group.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only add members to your own groups'
      });
    }

    // Verifica ca toate friendship-urile exista și sunt ACCEPTED
    const friendships = await prisma.friendship.findMany({
      where: {
        id: {
          in: friendshipIds.map(id => parseInt(id))
        },
        status: 'ACCEPTED',
        OR: [
          { userId: userId },
          { friendId: userId }
        ]
      }
    });

    if (friendships.length !== friendshipIds.length) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Some friendships are invalid or not accepted'
      });
    }

    // Creeaza membership-urile (ignoră duplicate-uri cu skipDuplicates)
    const memberships = await prisma.groupMembership.createMany({
      data: friendshipIds.map(friendshipId => ({
        groupId: parseInt(id),
        friendshipId: parseInt(friendshipId)
      })),
      skipDuplicates: true
    });

    // Returneaza grupul actualizat
    const updatedGroup = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          include: {
            friendship: {
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
            }
          }
        }
      }
    });

    res.status(200).json({
      message: `${memberships.count} members added to group`,
      group: updatedGroup
    });
  } catch (error) {
    console.error('Add members to group error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while adding members to group'
    });
  }
};

// DELETE /api/groups/:groupId/members/:membershipId - Elimina un membru din grup
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, membershipId } = req.params;
    const userId = req.session.userId;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Group not found'
      });
    }

    if (group.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only remove members from your own groups'
      });
    }

    const membership = await prisma.groupMembership.findUnique({
      where: { id: parseInt(membershipId) }
    });

    if (!membership) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Membership not found'
      });
    }

    if (membership.groupId !== parseInt(groupId)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Membership does not belong to this group'
      });
    }

    await prisma.groupMembership.delete({
      where: { id: parseInt(membershipId) }
    });

    res.status(200).json({
      message: 'Member removed from group successfully'
    });
  } catch (error) {
    console.error('Remove member from group error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while removing member from group'
    });
  }
};
