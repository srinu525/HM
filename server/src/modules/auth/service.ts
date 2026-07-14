import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config";

export class AuthService {
  async register(name: string, email: string, password: string, role: string, phone?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw { statusCode: 400, message: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any,
        phone,
      },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { statusCode: 401, message: "Invalid credentials" };
    }

    if (!user.isActive) {
      throw { statusCode: 403, message: "Account is deactivated" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: "Invalid credentials" };
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    return user;
  }

  private generateToken(user: { id: string; email: string; role: string }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = config.jwtSecret;
    const options: jwt.SignOptions = { expiresIn: config.jwtExpiresIn as unknown as number };
    return jwt.sign(payload, secret, options);
  }
}

export const authService = new AuthService();
