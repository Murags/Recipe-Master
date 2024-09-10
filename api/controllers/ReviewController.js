import db from "../utils/db";

export default class ReviewController {
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
