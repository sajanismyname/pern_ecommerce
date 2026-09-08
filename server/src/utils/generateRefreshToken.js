import jwt from "jsonwebtoken";

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
        },
            process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        }
    );
};