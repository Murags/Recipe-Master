"use client";

import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEllipsisV, faArrowLeft, faCamera, faAppleAlt, faCarrot, faEgg, faBreadSlice, faCheese, faDrumstickBite, faFish, faLemon, faPepperHot, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

const ingredientIcons = {
  apple: faAppleAlt,
  carrot: faCarrot,
  egg: faEgg,
  bread: faBreadSlice,
  cheese: faCheese,
  meat: faDrumstickBite,
  fish: faFish,
  lemon: faLemon,
  pepper: faPepperHot,
  herb: faLeaf,
  // Add more mappings as needed
};

const Ingredient = ({ ingredient }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ingredient',
    item: ingredient,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getIcon = (name) => {
    const lowercaseName = name.toLowerCase();
    for (const [key, value] of Object.entries(ingredientIcons)) {
      if (lowercaseName.includes(key)) {
        return value;
      }
    }
    return faAppleAlt; // Default to apple icon
  };

  return (
    <div
      ref={drag}
      className={`flex items-center p-3 bg-white border border-gray-200 cursor-pointer rounded-lg shadow-sm hover:bg-gray-50 transition ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full mr-3 flex items-center justify-center bg-gray-100">
        <FontAwesomeIcon icon={getIcon(ingredient.name)} className="text-gray-600" />
      </div>
      <span className="text-gray-800 font-medium">{ingredient.name}</span>
    </div>
  );
};

const DropArea = ({ onDrop }) => {
  const [, drop] = useDrop({
    accept: 'ingredient',
    drop: (item) => onDrop(item),
  });

  return (
    <div
      ref={drop}
      className="relative flex justify-center items-center border-none"
      style={{
        width: '100%',
        height: '60vh',
        maxHeight: '600px',
        backgroundImage: 'url(/images/mainBowl.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <p className="absolute text-gray text-xl font-semibold">Drag ingredients here</p>
    </div>
  );
};

const CreateRecipe = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [recipeName, setRecipeName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ingredientsList, setIngredients] = useState([]);
  const [creationStatus, setCreationStatus] = useState(null); // 'loading', 'success', or 'error'

  const router = useRouter();

  useEffect(()=>{
    const fetchIngridients = async () =>{
      const apiKey = '5e794aa16bb0459585dafb707fda2cab'; // Replace with your Spoonacular API key
      const query = 'd';
      const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=10&apiKey=${apiKey}`);

      console.log(response);
      const data = await response.json();
      console.log(data);
      setIngredients(data);
      // const fetchedIngredients = response.data.results;
      // console.log(fetchedIngredients);
    }
    fetchIngridients();
  }, []);

  const handleDrop = (ingredient) => {
    setSelectedIngredient(ingredient);
    setModalIsOpen(true);
  };

  const handleAddIngredient = () => {
    if (editingIngredient !== null) {
      setRecipeIngredients(recipeIngredients.map((item, index) =>
        index === editingIngredient ? { ...item, amount, unit } : item
      ));
      setEditingIngredient(null);
    } else {
      setRecipeIngredients([...recipeIngredients, { ...selectedIngredient, amount, unit }]);
    }
    setModalIsOpen(false);
    setAmount('');
    setUnit('');
  };

  const handleEditIngredient = (index) => {
    setSelectedIngredient(recipeIngredients[index]);
    setAmount(recipeIngredients[index].amount);
    setUnit(recipeIngredients[index].unit);
    setEditingIngredient(index);
    setModalIsOpen(true);
  };

  const handleRemoveIngredient = (index) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  // Cloudinary Upload Widget function
  const handleUploadClick = () => {
    if (photos.length >= 3) {
      alert('You can only upload a maximum of 3 images.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dgoviujpi',
        uploadPreset: 'ml_default',
        sources: ['local', 'url', 'camera'],
        maxFiles: 3 - photos.length, // Restrict the number of images to be uploaded
        multiple: true,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setPhotos((prevPhotos) => [...prevPhotos, result.info.secure_url]);
        }
      }
    );

    widget.open();
  };

  // Function to handle ingredient search
  const handleSearch = async (searchTerm) => {
    const apiKey = '5e794aa16bb0459585dafb707fda2cab';
    const filteredIngredients = ingredientsList.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredIngredients.length === 0) {
      try {
        // Fetch from Spoonacular API if ingredient is not in the initial list
        const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${searchTerm}&number=1&apiKey=${apiKey}`);
        const data = await response.json();

        if (data.length > 0) {
          const newIngredient = {
            id: uuidv4(),
            name: data[0].name,
          };
          setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
        }
      } catch (error) {
        console.error('Error fetching additional ingredients:', error);
      }
    }
  };

  const handleCreateRecipe = async () => {
    setCreationStatus('loading');
    // Create the data object to be sent to the server
    const recipeData = {
      title: recipeName,
      description: instructions,
      cook_time: parseInt(cookingTime),
      servings: parseInt(servings),
      ingredients: recipeIngredients.map(ingredient => ({
        name: ingredient.name,
        quantity: parseFloat(ingredient.amount),
        unit: ingredient.unit
      })),
      image_urls: photos,  // Include the photo URLs
    };

    console.log(recipeData)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token": `${token}`
        },
        body: JSON.stringify(recipeData)
      });

      if (!response.ok) {
        throw new Error("Failed to create recipe");
      }

      const result = await response.json();

      // Show loading animation for 3 seconds before success message
      setTimeout(() => {
        setCreationStatus('success');
        setTimeout(() => {
          setCreationStatus(null);
          router.push('/recipes');
        }, 2000);
      }, 3000);
    } catch (error) {
      // Show loading animation for 3 seconds before error message
      setTimeout(() => {
        setCreationStatus('error');
        setTimeout(() => setCreationStatus(null), 2000);
      }, 3000);
    }
  };


  const filteredIngredients = ingredientsList.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CreationStatus = ({ status }) => {
    if (status === 'loading') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <img
              src="/images/cooking-animation.gif"
              alt="Creating recipe"
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Recipe Created!</h2>
            <p className="text-gray-600">Redirecting to recipes page...</p>
          </div>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Creation Failed</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar/Topbar with Ingredients */}
        <div className="w-full md:w-1/4 bg-gray-50 p-4 border-b md:border-r border-gray-200 md:h-screen md:fixed overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Ingredients</h2>
          <input
            type="text"
            placeholder="Search ingredients..."
            className="w-full p-2 mb-4 border rounded"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredIngredients.map((ingredient) => (
              <Ingredient key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        </div>

        {/* Main Area for Creating Recipe */}
        <div className="flex-1 p-4 md:ml-[25%] overflow-y-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/recipes')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>

          {/* Recipe Name Input */}
          <input
            type="text"
            placeholder="Recipe Name"
            className="w-full text-xl font-semibold p-2 mb-6 border-b-2 border-gray-300 focus:outline-none focus:border-gray-500"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Servings Input */}
            <input
              type="text"
              placeholder="Servings"
              className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-gray-500"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />

            {/* Cooking Time Input */}
            <input
              type="text"
              placeholder="Cooking Time (e.g., 30 mins)"
              className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-gray-500"
              value={cookingTime}
              onChange={(e) => setCookingTime(e.target.value)}
            />
          </div>

          <h2 className="text-xl font-semibold mb-4">Create Your Recipe</h2>

          {/* Upload Photos Section */}
          <button
            onClick={handleUploadClick}
            className="mb-4 px-4 py-2 bg-[#007BFF] text-white rounded-lg shadow-lg hover:bg-[#0056b3] transition"
          >
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            Upload Photos
          </button>

          <div className="flex space-x-4 mb-6">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Recipe Photo ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>

          {/* Drop Area for Ingredients */}
          <DropArea onDrop={handleDrop} />

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Recipe Ingredients:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recipeIngredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="p-4 mb-4 bg-white border rounded-lg shadow-sm flex flex-col justify-between relative group"
                >
                  <div className="absolute top-2 right-3">
                    <FontAwesomeIcon icon={faEllipsisV} className="cursor-pointer text-gray-600" />
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg hidden group-hover:block">
                      <button
                        onClick={() => handleEditIngredient(index)}
                        className="block text-sm text-gray-600 hover:text-blue-500 px-4 py-2 w-full text-left">
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveIngredient(index)}
                        className="block text-sm text-gray-600 hover:text-red-500 px-4 py-2 w-full text-left">
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-medium text-[#1b130d]">{ingredient.name}</span>
                  <span className="text-gray-600">{ingredient.amount} {ingredient.unit}</span>
                </div>
              ))}
            </div>
          </div>


          {/* Instructions Input */}
          <textarea
            placeholder="Instructions..."
            className="w-full p-4 mb-6 border rounded-lg shadow-sm resize-none focus:outline-none focus:border-gray-500"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows="6"
          />

          {/* Submit Button */}
          <button
            onClick={handleCreateRecipe}
            className={`px-6 py-3 text-white rounded-lg shadow-lg ${isLoading ? "bg-gray-500" : "bg-[#007BFF] hover:bg-[#0056b3]"}`}
            disabled={isLoading}
          >
            {isLoading ? "Creating Recipe..." : "Create Recipe"}
          </button>
        </div>

        {/* Modal for Ingredient Amount */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          ariaHideApp={false}
          className="bg-white p-6 mx-auto rounded-lg shadow-lg w-1/3 mt-16"
        >
          <h2 className="text-lg font-semibold mb-4">
            {editingIngredient !== null ? "Edit" : "Add"} {selectedIngredient?.name}
          </h2>
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:border-gray-500"
          />
          <input
            type="text"
            placeholder="Unit (e.g., grams, cups)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:border-gray-500"
          />
          <button
            onClick={handleAddIngredient}
            className="px-4 py-2 bg-[#007BFF] text-white rounded-lg shadow-lg hover:bg-[#0056b3] transition"
          >
            {editingIngredient !== null ? "Update Ingredient" : "Add Ingredient"}
          </button>
        </Modal>

        <CreationStatus status={creationStatus} />
      </div>
    </DndProvider>
  );
};

export default CreateRecipe;
