import express from "express";
import UsersController from "../controllers/usersController";
import AuthController from "../controllers/AuthController";
import authMiddleware from "../middleware/authMiddleware";
import RecipeController from "../controllers/recipesController";
import ReviewController from "../controllers/ReviewController";

const router = express.Router()

router.post('/users', UsersController.postNew);
router.get('/me', authMiddleware, UsersController.getMe);
router.delete('/me', authMiddleware, UsersController.deleteUser);
router.get('/me/recipes', authMiddleware, UsersController.getRecipes);


router.post('/auth/login', AuthController.Login);

router.get('/auth/logout', authMiddleware, AuthController.disconnect);
router.post('/recipe', authMiddleware, RecipeController.postRecipe);
router.get('/recipes', RecipeController.getRecipes);

router.get('/recipe/:id', RecipeController.showRecipe);
router.put('/recipe/:id', authMiddleware, RecipeController.updateRecipe);
router.delete('/recipe/:id', authMiddleware, RecipeController.deleteRecipe);

router.put('/me/update', authMiddleware, UsersController.updateProfile);

// Review routes
router.post('/reviews', authMiddleware, ReviewController.createReview);
router.get('/recipes/:recipe_id/reviews', ReviewController.getReviewsForRecipe);
router.put('/reviews/:id', authMiddleware, ReviewController.updateReview);
router.delete('/reviews/:id', authMiddleware, ReviewController.deleteReview);

export default router;
