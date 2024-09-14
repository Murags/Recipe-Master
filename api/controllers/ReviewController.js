import db from "../utils/db";
import redisClient from "../utils/redis";

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - id
 *         - recipe_id
 *         - user_id
 *         - rating
 *       properties:
 *         id:
 *           type: string
 *         recipe_id:
 *           type: string
 *         user_id:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         username:
 *           type: string
 */

export default class ReviewController {
    /**
     * @swagger
     * /review:
     *   post:
     *     summary: Create a new review
     *     tags: [Reviews]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - recipe_id
     *               - rating
     *             properties:
     *               recipe_id:
     *                 type: string
     *               rating:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 5
     *               comment:
     *                 type: string
     *     responses:
     *       201:
     *         description: Review created successfully
     *       400:
     *         description: Invalid review data or user has already reviewed this recipe
     *       500:
     *         description: Server error
     */
    static async createReview(req, res) {
        const { recipe_id, rating, comment } = req.body;
        const user_id = req.userId;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            if (!recipe_id || !rating || rating < 1 || rating > 5) {
                throw new Error("Invalid review data");
            }

            const [existingReview] = await connection.query(
                "SELECT * FROM reviews WHERE user_id = ? AND recipe_id = ?",
                [user_id, recipe_id]
            );

            if (existingReview.length > 0) {
                throw new Error("You have already reviewed this recipe");
            }

            const [result] = await connection.query(
                "INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
                [recipe_id, user_id, rating, comment]
            );

            await ReviewController.updateRecipeRating(connection, recipe_id);

            await connection.commit();
            res.status(201).json({ message: "Review created successfully", id: result.insertId });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error creating review:', error);
            res.status(error.message === "You have already reviewed this recipe" ? 400 : 500)
               .json({ error: error.message || "Error creating review" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /reviews/{recipe_id}:
     *   get:
     *     summary: Get reviews for a specific recipe
     *     tags: [Reviews]
     *     parameters:
     *       - in: path
     *         name: recipe_id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of reviews for the recipe
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 reviews:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Review'
     *       500:
     *         description: Server error
     */
    static async getReviewsForRecipe(req, res) {
        const { recipe_id } = req.params;
        let connection;

        try {
            connection = await db.getConnection();
            const [reviews] = await connection.query(
                `SELECT r.*, u.username
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.recipe_id = ?
                ORDER BY r.created_at DESC`,
                [recipe_id]
            );

            res.status(200).json({ reviews });

        } catch (error) {
            console.error('Error fetching reviews:', error);
            res.status(500).json({ error: "Error fetching reviews" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /review/{id}:
     *   put:
     *     summary: Update a review
     *     tags: [Reviews]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - rating
     *             properties:
     *               rating:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 5
     *               comment:
     *                 type: string
     *     responses:
     *       200:
     *         description: Review updated successfully
     *       403:
     *         description: Unauthorized to update this review
     *       500:
     *         description: Server error
     */
    static async updateReview(req, res) {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.userId;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            if (!rating || rating < 1 || rating > 5) {
                throw new Error("Invalid rating");
            }

            const [review] = await connection.query(
                "SELECT * FROM reviews WHERE id = ? AND user_id = ?",
                [id, user_id]
            );

            if (review.length === 0) {
                throw new Error("Unauthorized to update this review");
            }

            await connection.query(
                "UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [rating, comment, id]
            );

            await ReviewController.updateRecipeRating(connection, review[0].recipe_id);

            await connection.commit();
            res.status(200).json({ message: "Review updated successfully" });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error updating review:', error);
            res.status(error.message === "Unauthorized to update this review" ? 403 : 500)
               .json({ error: error.message || "Error updating review" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /review/{id}:
     *   delete:
     *     summary: Delete a review
     *     tags: [Reviews]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Review deleted successfully
     *       403:
     *         description: Unauthorized to delete this review
     *       500:
     *         description: Server error
     */
    static async deleteReview(req, res) {
        const { id } = req.params;
        const user_id = req.userId;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const [review] = await connection.query(
                "SELECT * FROM reviews WHERE id = ? AND user_id = ?",
                [id, user_id]
            );

            if (review.length === 0) {
                throw new Error("Unauthorized to delete this review");
            }

            await connection.query("DELETE FROM reviews WHERE id = ?", [id]);

            await ReviewController.updateRecipeRating(connection, review[0].recipe_id);

            await connection.commit();
            res.status(200).json({ message: "Review deleted successfully" });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error deleting review:', error);
            res.status(error.message === "Unauthorized to delete this review" ? 403 : 500)
               .json({ error: error.message || "Error deleting review" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * components:
     *   schemas:
     *     RecipeRating:
     *       type: object
     *       properties:
     *         average_rating:
     *           type: number
     *         review_count:
     *           type: integer
     */

    // This method is not directly exposed as an API endpoint,
    // but it's used internally to update recipe ratings
    static async updateRecipeRating(connection, recipe_id) {
        const updateSql = `
            UPDATE recipes r
            SET average_rating = (
                SELECT AVG(rating) FROM reviews WHERE recipe_id = ?
            ),
            review_count = (
                SELECT COUNT(*) FROM reviews WHERE recipe_id = ?
            )
            WHERE r.id = ?
        `;

        await connection.query(updateSql, [recipe_id, recipe_id, recipe_id]);
    }
}
