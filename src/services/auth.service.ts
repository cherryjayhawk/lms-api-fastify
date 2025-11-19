import bcrypt from 'bcrypt';
import { getDB } from '../config/database';
import { ObjectId } from 'mongodb';
import { env } from '../config/env';
import { TokenUtils } from '../utils/token';

interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenData {
  token: string;
  hashedToken: string;
  familyId: string;
  expiresAt: Date;
}

export class AuthService {
  /**
   * Registers a new user in the database.
   * @param data - Object containing the user's email, password, and name
   * @throws {Error} - If the email is already registered
   * @returns {Promise<Object>} - Response object containing a success message and the user's ID
   */
  async register(data: RegisterDTO) {
    const db = getDB();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);

    return {
      message: 'User registered successfully',
      userId: result.insertedId,
    };
  }

  /**
   * Creates an admin user in the database.
   * @param data - Object containing the admin user's email, password, and name
   * @throws {Error} - If the email is already registered
   * @returns {Promise<Object>} - Response object containing a success message, the admin user's ID, and the role
   */
  async createAdmin(data: RegisterDTO) {
    const db = getDB();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);

    return {
      message: 'Admin user created successfully',
      userId: result.insertedId,
      role: 'admin',
    };
  }

  /**
   * Authenticates a user with the provided email and password.
   * @param {LoginDTO} data - Object containing the user's email and password
   * @param {any} jwtSign - JWT sign function
   * @throws {Error} - If the credentials are invalid
   * @returns {Promise<Object>} - Response object containing access token, refresh token, and user information
   */
  async login(data: LoginDTO, jwtSign: any) {
    const db = getDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: data.email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Generate access token (short-lived)
    const accessToken = jwtSign(tokenPayload, { expiresIn: env.JWT_EXPIRY });

    // Generate secure refresh token with rotation pattern
    const refreshTokenData = await this.createRefreshToken(tokenPayload, jwtSign);

    // Store hashed refresh token in database
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          refreshToken: refreshTokenData.hashedToken,
          tokenFamilyId: refreshTokenData.familyId,
          tokenFamilyCreatedAt: new Date(),
          refreshTokenExpiresAt: refreshTokenData.expiresAt,
          lastLoginAt: new Date(),
        },
      }
    );

    return {
      accessToken,
      refreshToken: refreshTokenData.token, // Send plaintext to client
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

/**
 * Refresh an expired access token and, if enabled, rotate the refresh token.
 * @param {string} userId - User ID to refresh token for
 * @param {string} refreshToken - Refresh token to verify and rotate
 * @param {any} jwtSign - JWT sign function
 * @throws {Error} - If the user is not found or if the token is invalid
 * @returns {Promise<Object>} - Response object containing the new access token and, if enabled, the new rotated refresh token
 */
  async refreshToken(userId: string, refreshToken: string, jwtSign: any) {
    const db = getDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if refresh token is present
    if (!user.refreshToken) {
      throw new Error('No refresh token found. Please log in again.');
    }

    // Verify the provided refresh token matches the stored hash
    const isTokenValid = await TokenUtils.verifyRefreshToken(
      refreshToken,
      user.refreshToken
    );

    if (!isTokenValid) {
      // Token doesn't match - possible token reuse attack
      // Invalidate all tokens in this family to prevent further unauthorized access
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $unset: { 
            refreshToken: '',
            tokenFamilyId: '',
          },
        }
      );
      throw new Error('Invalid refresh token. Session terminated for security.');
    }

    // Check if token family is expired (MAX_TOKEN_FAMILY_AGE)
    if (user.tokenFamilyCreatedAt) {
      const familyAge = Date.now() - new Date(user.tokenFamilyCreatedAt).getTime();
      if (familyAge > env.MAX_TOKEN_FAMILY_AGE) {
        throw new Error('Token family expired. Please log in again.');
      }
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Generate new access token
    const newAccessToken = jwtSign(tokenPayload, { expiresIn: env.JWT_EXPIRY });

    // Rotate refresh token if enabled (industry best practice)
    let newRefreshToken = null;
    if (env.REFRESH_TOKEN_ROTATION_ENABLED) {
      const newRefreshTokenData = await this.createRefreshToken(tokenPayload, jwtSign);
      
      // Update with new rotated refresh token, keeping same family
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            refreshToken: newRefreshTokenData.hashedToken,
            refreshTokenExpiresAt: newRefreshTokenData.expiresAt,
            lastTokenRefreshAt: new Date(),
          },
        }
      );

      newRefreshToken = newRefreshTokenData.token;
    }

    const response: any = {
      accessToken: newAccessToken,
    };

    // Include rotated refresh token if rotation is enabled
    if (newRefreshToken) {
      response.refreshToken = newRefreshToken;
    }

    return response;
  }

  /**
   * Logout the current user and invalidate the refresh token.
   * @param {string} userId - User ID to logout
   * @returns {Promise<Object>} - Response object with success message
   */
  async logout(userId: string) {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Invalidate refresh token and token family
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $unset: { 
          refreshToken: '',
          tokenFamilyId: '',
        },
      }
    );

    return { message: 'Logged out successfully' };
  }

  /**
   * Create a secure refresh token with hashing
   * @param payload - Token payload
   * @param jwtSign - JWT sign function
   * @returns Promise<RefreshTokenData> - Token data with hash
   */
  private async createRefreshToken(
    payload: TokenPayload,
    jwtSign: any
  ): Promise<RefreshTokenData> {
    // Generate random token
    const token = await TokenUtils.generateRefreshToken();

    // Hash the token for storage
    const hashedToken = await TokenUtils.hashRefreshToken(token);

    // Generate token family ID for rotation tracking
    const familyId = TokenUtils.generateTokenFamily();

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      token,
      hashedToken,
      familyId,
      expiresAt,
    };
  }

  /**
   * Get the currently authenticated user's information.
   * @param userId - User ID to retrieve info for
   * @throws {Error} - If the user is not found
   * @returns {Promise<Object>} - User object with password and refresh token removed
   */
  async getCurrentUser(userId: string) {
    const db = getDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0, refreshToken: 0 } }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}