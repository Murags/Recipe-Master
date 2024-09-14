import db from "../utils/db";
import { v4 } from "uuid";
import redisClient from "../utils/redis";

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - description
 *         - cooking_time
 *         - servings
 *         - user_id
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         cooking_time:
 *           type: integer
 *         servings:
 *           type: integer
 *         user_id:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         average_rating:
 *           type: number
 *         review_count:
 *           type: integer
 *         ingredients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ingredient'
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       required:
 *         - name
 *         - quantity
 *         - unit
 *       properties:
 *         name:
 *           type: string
 *         quantity:
 *           type: number
 *         unit:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       required:
 *         - image_url
 *       properties:
 *         image_url:
 *           type: string
 */

export default class RecipeController {
    /**
     * @swagger
     * /recipe:
     *   post:
     *     summary: Create a new recipe
     *     tags: [Recipes]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *               - cook_time
     *               - servings
     *               - ingredients
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               cook_time:
     *                 type: integer
     *               servings:
     *                 type: integer
     *               ingredients:
     *                 type: array
     *                 items:
     *                   $ref: '#/components/schemas/Ingredient'
     *               image_urls:
     *                 type: array
     *                 items:
     *                   type: string
     *     responses:
     *       201:
     *         description: Recipe created successfully
     *       400:
     *         description: Missing required fields
     *       500:
     *         description: Server error
     */
    static async postRecipe(req, res) {
        const { title, description, cook_time, servings, ingredients, image_urls } = req.body;
        const user_id = req.userId;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            if (!title || !description || !cook_time || !servings || ingredients.length <= 0) {
                throw new Error("Missing values");
            }

            const recipeId = v4();
            const timestamp = new Date();
            const recipeSql = `
                INSERT INTO recipes
                (id, title, description, cooking_time, servings, user_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await connection.query(recipeSql, [recipeId, title, description, cook_time, servings, user_id, timestamp, timestamp]);

            const ingredientValues = ingredients.map(ingredient => [
                recipeId,
                ingredient.name,
                ingredient.quantity,
                ingredient.unit,
                timestamp,
                timestamp
            ]);
            const ingredientSql = `
                INSERT INTO recipe_ingredients
                (recipe_id, ingredient_name, quantity, unit, created_at, updated_at)
                VALUES ?
            `;

            await connection.query(ingredientSql, [ingredientValues]);

            if (image_urls && image_urls.length > 0) {
                const imageValues = image_urls.map(url => [
                    v4(),
                    recipeId,
                    url,
                    timestamp,
                    timestamp
                ]);

                const imageSql = `
                    INSERT INTO recipe_images
                    (id, recipe_id, image_url, created_at, updated_at)
                    VALUES ?
                `;

                await connection.query(imageSql, [imageValues]);
            }

            await connection.commit();
            res.status(201).json({ message: "Recipe created successfully" });

            await redisClient.invalidateCache('__express__/recipes*');
            await redisClient.invalidateCache(`__express__/recipe/${recipeId}`);

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error in recipe creation:', error);
            res.status(500).json({ error: error.message || "Error creating recipe" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /recipes:
     *   get:
     *     summary: Get all recipes
     *     tags: [Recipes]
     *     responses:
     *       200:
     *         description: List of all recipes
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
        let connection;
        try {
            connection = await db.getConnection();
            const sql = `
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
            `;

            const [results] = await connection.query(sql);

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
            res.json({ recipes });

        } catch (error) {
            console.error('Error fetching recipes:', error);
            res.status(500).json({ error: "Could not fetch Recipes" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /recipe/{id}:
     *   get:
     *     summary: Get a specific recipe
     *     tags: [Recipes]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Detailed recipe information
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Recipe'
     *       404:
     *         description: Recipe not found
     *       500:
     *         description: Server error
     */
    static async showRecipe(req, res) {
        const { id } = req.query;
        let connection;

        try {
            connection = await db.getConnection();

            const [recipeResults] = await connection.query("SELECT * FROM recipes WHERE id = ?", [id]);
            if (recipeResults.length === 0) {
                return res.status(404).json({ error: "Recipe not found" });
            }

            const recipe = recipeResults[0];

            const [ingredientResults] = await connection.query("SELECT * FROM recipe_ingredients WHERE recipe_id = ?", [id]);
            recipe.ingredients = ingredientResults;

            const [imageResults] = await connection.query("SELECT * FROM recipe_images WHERE recipe_id = ?", [id]);
            recipe.images = imageResults;

            res.json(recipe);

        } catch (error) {
            console.error('Error fetching recipe:', error);
            res.status(500).json({ error: "Could not fetch recipe" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /recipe/{id}:
     *   delete:
     *     summary: Delete a recipe
     *     tags: [Recipes]
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
     *         description: Recipe deleted successfully
     *       403:
     *         description: Unauthorized to delete this recipe
     *       500:
     *         description: Server error
     */
    static async deleteRecipe(req, res) {
        const { id } = req.query;
        const userId = req.userId;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const [recipe] = await connection.query('SELECT user_id FROM recipes WHERE id = ?', [id]);
            if (recipe.length === 0 || recipe[0].user_id !== userId) {
                throw new Error("Unauthorized to delete this recipe");
            }

            await connection.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id]);
            await connection.query('DELETE FROM recipe_images WHERE recipe_id = ?', [id]);
            await connection.query('DELETE FROM reviews WHERE recipe_id = ?', [id]);
            await connection.query('DELETE FROM recipes WHERE id = ?', [id]);

            await connection.commit();
            res.status(200).json({ message: "Recipe and all associated data deleted successfully" });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error in recipe deletion process:', error);
            res.status(error.message === "Unauthorized to delete this recipe" ? 403 : 500)
               .json({ error: error.message || "Failed to delete recipe" });
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * @swagger
     * /recipe/{id}:
     *   put:
     *     summary: Update a recipe
     *     tags: [Recipes]
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
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               cooking_time:
     *                 type: integer
     *               servings:
     *                 type: integer
     *               ingredients:
     *                 type: array
     *                 items:
     *                   $ref: '#/components/schemas/Ingredient'
     *               images:
     *                 type: array
     *                 items:
     *                   $ref: '#/components/schemas/Image'
     *     responses:
     *       200:
     *         description: Recipe updated successfully
     *       403:
     *         description: Unauthorized to update this recipe
     *       500:
     *         description: Server error
     */
    static async updateRecipe(req, res) {
        const { id } = req.params;
        const userId = req.userId;
        const { title, description, cooking_time, servings, ingredients, images } = req.body;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const [ownerResults] = await connection.query("SELECT user_id FROM recipes WHERE id = ?", [id]);
            if (ownerResults.length === 0 || ownerResults[0].user_id !== userId) {
                throw new Error("Unauthorized to update this recipe");
            }

            const timestamp = new Date();
            await connection.query(
                `UPDATE recipes
                SET title = ?, description = ?, cooking_time = ?, servings = ?, updated_at = ?
                WHERE id = ?`,
                [title, description, cooking_time, servings, timestamp, id]
            );

            await connection.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);

            const ingredientValues = ingredients.map(ingredient => [
                id,
                ingredient.ingredient_name || ingredient.name, // Use ingredient_name if available, otherwise fallback to name
                ingredient.quantity,
                ingredient.unit,
                timestamp,
                timestamp
            ]);

            if (ingredientValues.length > 0) {
                await connection.query(
                    `INSERT INTO recipe_ingredients
                    (recipe_id, ingredient_name, quantity, unit, created_at, updated_at)
                    VALUES ?`,
                    [ingredientValues]
                );
            }

            await connection.query("DELETE FROM recipe_images WHERE recipe_id = ?", [id]);

            if (images && images.length > 0) {
                const imageValues = images.map(img => [
                    v4(),
                    id,
                    img.image_url,
                    timestamp,
                    timestamp
                ]);
                await connection.query(
                    `INSERT INTO recipe_images
                    (id, recipe_id, image_url, created_at, updated_at)
                    VALUES ?`,
                    [imageValues]
                );
            }

            await connection.commit();
            res.status(200).json({ message: "Recipe updated successfully" });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error updating recipe:', error);
            console.error('Error details:', error.message, error.stack);
            console.error('Request body:', req.body);
            res.status(error.message === "Unauthorized to update this recipe" ? 403 : 500)
               .json({ error: error.message || "Error updating recipe" });
        } finally {
            if (connection) connection.release();
        }
    }
}
