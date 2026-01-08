import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

const SALT_ROUNDS = 10;


const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;


const checkRateLimit = (email) => {
  const now = Date.now();
  const attempts = loginAttempts[email];

  if (!attempts) {
    return { allowed: true };
  }

  // Daca au trecut 15 minute de la ultima incercare esuata, resetam
  if (now - attempts.lastAttemptTime > LOCKOUT_TIME) {
    delete loginAttempts[email];
    return { allowed: true };
  }

  // Daca utilizatorul a atins limita de incercari
  if (attempts.count >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = now - attempts.lastAttemptTime;
    const remainingTime = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
    return {
      allowed: false,
      message: `Prea multe încercări eșuate. Încearcă din nou în ${remainingTime} minute.`
    };
  }

  return { allowed: true };
};

// Functie pentru inregistrare incercare esuata
const recordFailedAttempt = (email) => {
  const now = Date.now();

  if (!loginAttempts[email]) {
    loginAttempts[email] = {
      count: 1,
      lastAttemptTime: now
    };
  } else {
    loginAttempts[email].count += 1;
    loginAttempts[email].lastAttemptTime = now;
  }
};

// Functie pentru resetare incercari (la login reusit)
const resetAttempts = (email) => {
  delete loginAttempts[email];
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    req.session.userId = user.id;

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during registration'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Verificare rate limit
    const rateLimitCheck = checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        error: 'Too many attempts',
        message: rateLimitCheck.message
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      recordFailedAttempt(email);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      recordFailedAttempt(email);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Login reusit - resetam incercarile esuate
    resetAttempts(email);

    req.session.userId = user.id;

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No active session found'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'An error occurred during logout'
        });
      }

      res.clearCookie('connect.sid');
      res.status(200).json({
        message: 'Logout successful',
        user: user
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during logout'
    });
  }
};
