"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

const StarRating = ({ rating }) => {
  const numericRating = parseFloat(rating) || 0;
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= numericRating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-2 text-gray-600">{numericRating.toFixed(1)}</span>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const RecipeDetails = () => {
  const [recipe, setRecipe] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipe/:id?id=${id}`);
        if (response.ok) {
          const data = await response.json();
          setRecipe(data);
        } else {
          throw new Error('Failed to fetch recipe');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast.error('Failed to load recipe details');
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        } else {
          throw new Error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews');
      }
    };

    fetchRecipe();
    fetchReviews();
  }, [id]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % recipe.images.length
    );
  }, [recipe]);

  useEffect(() => {
    if (!recipe) return;

    const intervalId = setInterval(nextImage, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [recipe, nextImage]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token
        },
        body: JSON.stringify({
          recipe_id: id,
          rating: userRating,
          comment: userReview
        })
      });

      if (response.ok) {
        toast.success('Review submitted successfully');
        // Refresh reviews
        const reviewsResponse = await fetch(`http://localhost:5000/api/recipes/${id}/reviews`);
        if (reviewsResponse.ok) {
          const data = await reviewsResponse.json();
          setReviews(data.reviews || []);
        }
        // Reset form
        setUserRating(0);
        setUserReview('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred while submitting the review');
    }
  };

  if (!recipe) return <LoadingSpinner />;

  return (
    <div className="px-4 md:px-8 py-5 max-w-4xl mx-auto">
      <Toaster />
      <div className="mb-8">
        <div className="relative min-h-[400px] overflow-hidden rounded-xl">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-50 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {recipe.images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%), url("${image.image_url}")` }}
            >
              <div className="flex flex-col gap-2 text-center items-center justify-center">
                <h1 className="text-white text-6xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                  {recipe.title}
                </h1>
              </div>
            </div>
          ))}

          {/* Navigation dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {recipe.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{recipe.cooking_time} mins</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center">
            <StarRating rating={recipe.average_rating || 0} />
            <span className="ml-2">({reviews.length} reviews)</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc list-inside">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="mb-2">
                {ingredient.quantity} {ingredient.unit} {ingredient.ingredient_name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <p className="text-gray-700">{recipe.description}</p>
        </div>
      </div>

      {/* Review submission form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
        <form onSubmit={handleSubmitReview}>
          <div className="mb-4">
            <label className="block mb-2">Your Rating:</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  className={`w-8 h-8 ${star <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="review" className="block mb-2">Your Review:</label>
            <textarea
              id="review"
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Submit Review
          </button>
        </form>
      </div>

      {/* Existing reviews */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="mb-4 pb-4 border-b last:border-b-0">
              <div className="flex items-center mb-2">
                {/* User icon */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{review.username}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-gray-700 mt-1">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No reviews yet. Be the first to review this recipe!</p>
        )}
      </div>
    </div>
  );
};

export default RecipeDetails;

