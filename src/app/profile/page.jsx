"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Toaster, toast } from 'react-hot-toast';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const deleteInputRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState('');
  const deleteAccountInputRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserRecipes();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      console.log('Fetched user data:', userData);
      setUser(userData); // Access index 0 of the user data array
      setUpdatedUser({
        username: userData.username,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/me/recipes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user recipes');
      }

      const data = await response.json();
      console.log('Fetched recipes:', data);
      setRecipes(data.recipes);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  };

  const handleInputChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const dataToUpdate = {
        username: updatedUser.username,
        oldPassword,
        newPassword,
      };
      const response = await fetch('http://localhost:5000/api/me/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();

      // Show success toast
      toast.success(result.message, {
        duration: 3000,
        position: 'top-center',
      });

      // Update local user state
      setUser({ ...user, username: updatedUser.username });
      setEditMode(false);
      setOldPassword('');
      setNewPassword('');

      // Refresh user data
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error toast
      toast.error(error.message, {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteAccountModal(true);
    setDeleteAccountConfirmation('');
    setTimeout(() => {
      deleteAccountInputRef.current?.focus();
    }, 100);
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteAccountConfirmation.toLowerCase() !== 'delete my account') {
      toast.error("Please type 'delete my account' to confirm.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      localStorage.removeItem('token');
      router.push('/');
      toast.success('Your account and all associated data have been deleted successfully.');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setShowDeleteAccountModal(false);
    }
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setShowDeleteModal(true);
    setDeleteConfirmation('');
    setTimeout(() => {
      deleteInputRef.current?.focus();
    }, 100);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.toLowerCase() !== recipeToDelete.title.toLowerCase()) {
      toast.error("The recipe name you entered doesn't match. Please try again.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recipe/:id?id=${recipeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete recipe');
      }

      setShowDeleteModal(false);
      fetchUserRecipes(); // Refresh recipes after deletion
      toast.success('Recipe and all associated data deleted successfully');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error(error.message || 'Failed to delete recipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push('/recipes')}
            className="mb-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            ← Back to Recipes
          </button>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Profile</h1>
              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={updatedUser.username}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">Old Password</label>
                    <input
                      type="password"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Updating...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">My Recipes</h2>
              {recipes.length > 0 ? (
                <div className="space-y-4">
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex items-start space-x-4 mb-4 sm:mb-0 w-full sm:w-3/4">
                        {recipe.images && recipe.images.length > 0 && (
                          <Image
                            src={recipe.images[0]}
                            alt={recipe.title}
                            width={80}
                            height={80}
                            className="rounded-md object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-grow min-w-0">
                          <h3 className="font-semibold text-lg truncate">{recipe.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Cooking time: {recipe.cooking_time} mins | Servings: {recipe.servings}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(recipe)}
                          className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">You haven't created any recipes yet.</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Management</h2>
              <button
                onClick={handleDeleteAccountClick}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Delete Recipe</h3>
            </div>
            <p className="mb-4 text-gray-600">
              This action cannot be undone. This will permanently delete the recipe "{recipeToDelete?.title}".
            </p>
            <p className="mb-4 text-gray-600">
              Please type <span className="font-semibold">{recipeToDelete?.title}</span> to confirm.
            </p>
            <input
              type="text"
              ref={deleteInputRef}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="Type the recipe name to confirm"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
            </div>
            <p className="mb-4 text-gray-600">
              This action cannot be undone. This will permanently delete your account and all associated data.
            </p>
            <p className="mb-4 text-gray-600">
              Please type <span className="font-semibold">delete my account</span> to confirm.
            </p>
            <input
              type="text"
              ref={deleteAccountInputRef}
              value={deleteAccountConfirmation}
              onChange={(e) => setDeleteAccountConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="Type 'delete my account' to confirm"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
