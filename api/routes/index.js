import express from "express";
import UsersController from "../controllers/usersController";
import AuthController from "../controllers/AuthController";
import authMiddleware from "../middleware/authMiddleware";
import RecipeController from "../controllers/recipesController";
import ReviewController from "../controllers/ReviewController";
import cacheMiddleware from "../middleware/cacheMiddleware";


const router = express.Router()

router.post('/users', UsersController.postNew);
router.get('/me', authMiddleware, UsersController.getMe);
router.delete('/me', authMiddleware, UsersController.deleteUser);
router.get('/me/recipes', authMiddleware, UsersController.getRecipes);


router.post('/auth/login', AuthController.Login);

router.get('/auth/logout', authMiddleware, AuthController.disconnect);
router.post('/recipe', authMiddleware, RecipeController.postRecipe);
router.get('/recipes', cacheMiddleware(300), RecipeController.getRecipes);

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Retrieve a list of recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: A list of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recipes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 */
router.get('/recipes', cacheMiddleware(300), RecipeController.getRecipes);

/**
 * @swagger
 * /recipe/{id}:
 *   get:
 *     summary: Get a specific recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: Details of a specific recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recipe not found
 */
router.get('/recipe/:id', cacheMiddleware(300), RecipeController.showRecipe);
router.put('/recipe/:id', authMiddleware, RecipeController.updateRecipe);
router.delete('/recipe/:id', authMiddleware, RecipeController.deleteRecipe);

router.put('/me/update', authMiddleware, UsersController.updateProfile);

// Review routes
router.post('/reviews', authMiddleware, ReviewController.createReview);
router.get('/recipes/:recipe_id/reviews', ReviewController.getReviewsForRecipe);
router.put('/reviews/:id', authMiddleware, ReviewController.updateReview);
router.delete('/reviews/:id', authMiddleware, ReviewController.deleteReview);

export default router;
