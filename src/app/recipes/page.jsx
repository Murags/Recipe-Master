"use client"

import { useEffect, useState } from "react";
import RecipeItem from "../components/RecipeItem";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const RecipesPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [allRecipes, setAllRecipes] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [token, setToken] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/recipes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        setAllRecipes(data.recipes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching all recipes:", error);
        setLoading(false);
      }
    };

    const fetchMyRecipes = async () => {
      const token = localStorage.getItem('token');
      setToken(token);
      if (token) {
        try {
          const response = await fetch("http://localhost:5000/api/me/recipes", {
            method: "GET",
            headers: {
              "X-Token": `${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch my recipes");
          }

          const data = await response.json();
          setMyRecipes(data.recipes);
        } catch (error) {
          console.error("Error fetching my recipes:", error);
        }
      }
    };

    fetchAllRecipes();
    fetchMyRecipes();
  }, []);

  const handleTabChange = (tab) => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRecipes = (activeTab === "all" ? allRecipes : myRecipes).filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[900px] flex-1">
          <div className="flex items-center justify-between px-2 pb-2 pt-4 border-b border-gray-300">
            <div className="flex space-x-4">
              <h3
                className={`text-[#111318] text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer relative ${
                  activeTab === "all" ? "underline-active" : ""
                }`}
                onClick={() => handleTabChange("all")}
              >
                Recipes
              </h3>
              {token && (
                <h3
                  className={`text-[#111318] text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer relative ${
                    activeTab === "my" ? "underline-active" : ""
                  }`}
                  onClick={() => handleTabChange("my")}
                >
                  My Recipes
                </h3>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="minimal-loader" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 p-4">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <RecipeItem
                    key={recipe.id}
                    id={recipe.id}
                    imageUrl={recipe.images[0]}
                    title={recipe.title}
                    rating={recipe.average_rating || 0}
                    reviews={recipe.review_count || 0}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 w-full">
                  No recipes found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecipesPage;
