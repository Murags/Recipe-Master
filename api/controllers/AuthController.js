import db from "../utils/db";
import redisClient from "../utils/redis";
import sha1 from "sha1"
import { v4 } from "uuid"

export default class AuthController {
    static async Login(req, res) {
        const basicAuth = req.header('Authorization');
        const basicToken = basicAuth.split(' ')[1];
        let connection;

        try {
            if (!basicToken) {
                throw new Error("Unauthorized");
            }

            const credentials = Buffer.from(basicToken, "base64").toString('utf-8');
            const [email, password] = credentials.split(':');

            if (!email || !password) {
                throw new Error("Unauthorized");
            }

            connection = await db.getConnection();

            const [user] = await connection.query("SELECT * FROM users WHERE email = ? and password = ?", [email, sha1(password)]);

            if (user.length !== 1) {
                throw new Error("Unauthorized");
            }

            const token = v4();
            const key = `auth_${token}`;

            await redisClient.set(key, user[0].id, 24 * 3600);
            res.status(200).json({ token });

        } catch (error) {
            console.error('Error in login:', error);
            res.status(401).json({ error: error.message || "Unauthorized" });
        } finally {
            if (connection) connection.release();
        }
    }

    static async disconnect(req, res) {
        const xToken = req.header('X-Token');
        let connection;

        try {
            connection = await db.getConnection();
            await redisClient.del(`auth_${xToken}`);
            console.log("Logged out successfully");
            res.status(200).json([]);
        } catch (error) {
            console.error('Error in logout:', error);
            res.status(500).json({ error: "Error logging out" });
        } finally {
            if (connection) connection.release();
        }
    }
}
