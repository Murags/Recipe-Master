import db from "../utils/db";
import { v4 } from "uuid"
import sha1 from "sha1"
import redisClient from "../utils/redis";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

export default class UsersController {
    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Create a new user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - email
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *                 format: password
     *     responses:
     *       201:
     *         description: User created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Missing values or user already exists
     *       500:
     *         description: Server error
     */
    static async postNew(req, res) {
        const { username, email, password } = req.body;
        let connection;

        try {
            if (!email || !username || !password) {
                throw new Error("Missing Values");
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            const [existingUser] = await connection.query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );

            if (existingUser.length > 0) {
                throw new Error("User already exists");
            }

            const id = v4();
            const hashedPassword = sha1(password);

            await connection.query(
                "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)",
                [id, username, email, hashedPassword]
            );

            await connection.commit();
            res.status(201).json({ id, username, email });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error creating user:', error);
            res.status(error.message === "User already exists" ? 400 : 500)
               .json({ error: error.message || "Error Could not create user" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /me:
     *   get:
     *     summary: Get current user's profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    static async getMe(req, res) {
        const userId = req.userId;
        let connection;

        try {
            connection = await db.getConnection();
            const [user] = await connection.query(
                "SELECT * FROM users WHERE id = ?",
                [userId]
            );

            if (user.length === 0) {
                throw new Error("Could not find user");
            }

            res.status(200).json(user[0]);

        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(error.message === "Could not find user" ? 404 : 500)
               .json({ error: error.message || "Error could not get user" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /me/recipes:
     *   get:
     *     summary: Get recipes of the current user
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of user's recipes
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 recipes:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Recipe'
     *       500:
     *         description: Server error
     */
    static async getRecipes(req, res) {
        const userId = req.userId;
        let connection;

        try {
            connection = await db.getConnection();
            const [results] = await connection.query(`
                SELECT
                    r.id AS recipe_id,
                    r.title,
                    r.description,
                    r.cooking_time,
                    r.servings,
                    r.user_id,
                    r.created_at,
                    r.updated_at,
                    r.average_rating,
                    r.review_count,
                    ri.ingredient_name,
                    ri.quantity,
                    ri.unit,
                    img.image_url
                FROM
                    recipes r
                LEFT JOIN
                    recipe_ingredients ri ON r.id = ri.recipe_id
                LEFT JOIN
                    recipe_images img ON r.id = img.recipe_id
                WHERE
                    r.user_id = ?`,
                [userId]
            );

            const recipesMap = {};

            results.forEach(row => {
                if (!recipesMap[row.recipe_id]) {
                    recipesMap[row.recipe_id] = {
                        id: row.recipe_id,
                        title: row.title,
                        description: row.description,
                        cooking_time: row.cooking_time,
                        servings: row.servings,
                        user_id: row.user_id,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                        average_rating: row.average_rating || 0,
                        review_count: row.review_count || 0,
                        ingredients: [],
                        images: []
                    };
                }

                if (row.ingredient_name) {
                    recipesMap[row.recipe_id].ingredients.push({
                        name: row.ingredient_name,
                        quantity: row.quantity,
                        unit: row.unit
                    });
                }

                if (row.image_url && !recipesMap[row.recipe_id].images.includes(row.image_url)) {
                    recipesMap[row.recipe_id].images.push(row.image_url);
                }
            });

            const recipes = Object.values(recipesMap);
            res.status(200).json({ recipes });

        } catch (error) {
            console.error('Error fetching recipes:', error);
            res.status(500).json({ error: "Could not fetch Recipes" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /me/update:
     *   put:
     *     summary: Update current user's profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               oldPassword:
     *                 type: string
     *                 format: password
     *               newPassword:
     *                 type: string
     *                 format: password
     *     responses:
     *       200:
     *         description: Profile updated successfully
     *       400:
     *         description: Incorrect old password or no changes to update
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    static async updateProfile(req, res) {
        const userId = req.userId;
        const { username, oldPassword, newPassword } = req.body;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const [user] = await connection.query(
                "SELECT * FROM users WHERE id = ?",
                [userId]
            );

            if (user.length === 0) {
                throw new Error("User not found");
            }

            let updateFields = [];
            let updateValues = [];

            if (username && username !== user[0].username) {
                updateFields.push("username = ?");
                updateValues.push(username);
            }

            if (oldPassword && newPassword) {
                if (sha1(oldPassword) !== user[0].password) {
                    throw new Error("Incorrect old password");
                }
                updateFields.push("password = ?");
                updateValues.push(sha1(newPassword));
            }

            if (updateFields.length === 0) {
                return res.status(200).json({ message: "No changes to update" });
            }

            const updateSql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
            updateValues.push(userId);

            await connection.query(updateSql, updateValues);

            await connection.commit();
            res.status(200).json({ message: "Profile updated successfully" });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error updating profile:', error);
            res.status(error.message === "User not found" ? 404 : 400)
               .json({ error: error.message || "Error updating user profile" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /me:
     *   delete:
     *     summary: Delete current user's account
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Account and all associated data deleted successfully
     *       500:
     *         description: Server error
     */
    static async deleteUser(req, res) {
        const userId = req.userId;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            // 1. Delete all recipe ingredients
            await connection.query('DELETE ri FROM recipe_ingredients ri INNER JOIN recipes r ON ri.recipe_id = r.id WHERE r.user_id = ?', [userId]);

            // 2. Delete all recipe images
            await connection.query('DELETE img FROM recipe_images img INNER JOIN recipes r ON img.recipe_id = r.id WHERE r.user_id = ?', [userId]);

            // 3. Delete all reviews associated with the user's recipes
            await connection.query('DELETE rev FROM reviews rev INNER JOIN recipes r ON rev.recipe_id = r.id WHERE r.user_id = ?', [userId]);

            // 4. Delete all recipes
            await connection.query('DELETE FROM recipes WHERE user_id = ?', [userId]);

            // 5. Delete the user
            await connection.query('DELETE FROM users WHERE id = ?', [userId]);

            await connection.commit();
            res.status(200).json({ message: "Account and all associated data deleted successfully" });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error in deletion process:', error);
            res.status(500).json({ error: "Failed to delete account" });
        } finally {
            if (connection) connection.release();
        }
    }
}
