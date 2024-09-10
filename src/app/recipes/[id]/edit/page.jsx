"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/navbar';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash } from '@fortawesome/free-solid-svg-icons';

const EditRecipePage = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recipe/:id?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

      const data = await response.json();
      // Normalize the data structure
      const normalizedData = {
        ...data,
        ingredients: data.ingredients || [], // Handle the misspelling
        images: data.images.map(img => img.image_url) // Extract image URLs
      };
      setRecipe(normalizedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError('Failed to load recipe. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = recipe.ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    setRecipe({ ...recipe, ingredients: updatedIngredients });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { ingredient_name: '', quantity: '', unit: '' }]
    });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: updatedIngredients });
  };

  const handleUploadClick = () => {
    if (recipe.images.length >= 3) {
      alert('You can only upload a maximum of 3 images.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dgoviujpi',
        uploadPreset: 'ml_default',
        sources: ['local', 'url', 'camera'],
        maxFiles: 3 - recipe.images.length,
        multiple: true,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setRecipe(prevRecipe => ({
            ...prevRecipe,
            images: [...prevRecipe.images, result.info.secure_url]
          }));
        }
      }
    );

    widget.open();
  };

  const removeImage = (index) => {
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      images: prevRecipe.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recipe/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
        body: JSON.stringify({
          ...recipe,
          ingredients: recipe.ingredients, // Use the correct spelling for the API
          images: recipe.images.map(url => ({ image_url: url })) // Format images as expected by the API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }

      router.push('/profile');
    } catch (error) {
      console.error('Error updating recipe:', error);
      setError('Failed to update recipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push('/profile')}
            className="mb-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            ← Back to Profile
          </button>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Edit Recipe</h1>
              {recipe && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={recipe.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={recipe.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cooking_time" className="block text-sm font-medium text-gray-700">Cooking Time (minutes)</label>
                      <input
                        type="number"
                        id="cooking_time"
                        name="cooking_time"
                        value={recipe.cooking_time}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="servings" className="block text-sm font-medium text-gray-700">Servings</label>
                      <input
                        type="number"
                        id="servings"
                        name="servings"
                        value={recipe.servings}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={ingredient.ingredient_name}
                          onChange={(e) => handleIngredientChange(index, 'ingredient_name', e.target.value)}
                          placeholder="Ingredient name"
                          className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <input
                          type="text"
                          value={ingredient.quantity}
                          onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                          placeholder="Quantity"
                          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <input
                          type="text"
                          value={ingredient.unit}
                          onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Ingredient
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="mb-4 px-4 py-2 bg-[#007BFF] text-white rounded-lg shadow-lg hover:bg-[#0056b3] transition"
                    >
                      <FontAwesomeIcon icon={faCamera} className="mr-2" />
                      Upload Photos
                    </button>
                    <div className="flex flex-wrap gap-4">
                      {recipe.images.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={image}
                            alt={`Recipe image ${index + 1}`}
                            width={100}
                            height={100}
                            className="rounded-md object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => router.push('/profile')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditRecipePage;
