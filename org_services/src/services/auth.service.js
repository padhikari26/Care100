import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { Employee, Organization, SuperAdmin } from "../models/index.js";
import { USER_TYPES } from "../utils/constants.js";

class AuthService {
  static async login(res, email, password) {
    let user;
    let userType;

    user = await SuperAdmin.findOne({ where: { email } });
    if (user) {
      userType = USER_TYPES.SUPER_ADMIN;
    }

    if (!user) {
      user = await Organization.findOne({ where: { email } });

      if (user) {
        userType = USER_TYPES.ORGANIZATION;
      }
    }

    if (!user) {
      user = await Employee.findOne({ where: { email } });
      if (user) {
        userType = USER_TYPES.EMPLOYEE;
      }
    }

    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 400;
      throw error;
    }

    // Verify password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.status = 400;
      throw error;
    }

    if (userType === USER_TYPES.EMPLOYEE) {
      const org = await Organization.findOne({ where: { id: user.orgId } });
      if (!org) {
        const error = new Error("Organization not found");
        error.status = 400;
        throw error;
      }
      user.orgLogo = org.logo;
    }

    const payload = {
      id: user.id,
      email: user.email,
      userType,
      ...(userType === USER_TYPES.ORGANIZATION && {
        orgId: user.id,
      }),
      ...(userType === USER_TYPES.EMPLOYEE && {
        name: user.name,
        role: user.role,
        orgId: user.orgId,
      }),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userType,
        ...(userType === USER_TYPES.ORGANIZATION && {
          orgId: user.id,
          orgName: user.name,
          orgLogo: user.logo,
        }),
        ...(userType === USER_TYPES.EMPLOYEE && {
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          orgLogo: user.orgLogo,
        }),
        ...(userType === USER_TYPES.SUPER_ADMIN && {
          name: user.name,
        }),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  static async employeeLogin(res, code) {
    let user = await Employee.findOne({ where: { code } });
    if (!user) {
      const error = new Error("Invalid code");
      error.status = 400;
      throw error;
    }
    const org = await Organization.findOne({ where: { id: user.orgId } });
    if (!org) {
      const error = new Error("Organization not found");
      error.status = 400;
      throw error;
    }
    if (user.verified === false) {
      const error = new Error("Employee not verified. Please contact your organization administrator.");
      error.status = 400;
      throw error;
    }
    user.orgLogo = org.logo;
    const payload = {
      id: user.id,
      email: user.email,
      userType: USER_TYPES.EMPLOYEE,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        userType: USER_TYPES.EMPLOYEE,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
        orgLogo: user.orgLogo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  static async verifyToken(res, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userType === USER_TYPES.ORGANIZATION || decoded.userType === USER_TYPES.EMPLOYEE) {
        const user = await Organization.findByPk(decoded.orgId);
        if (!user || (user.expiryDate && new Date() > new Date(user.expiryDate))) {
          const error = new Error(`Unauthorized - ${decoded.userType} expired`);
          error.status = 401;
          throw error;
        }
      }
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }
  }

  static logout(res) {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
  }
}

export default AuthService;

