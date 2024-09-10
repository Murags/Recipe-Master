"use client"

import RecipeItem from "./RecipeItem";
import { useRouter } from 'next/navigation';

const TopRatedRecipes = () => {
    const router = useRouter();

    const recipes = [
        {
            imageUrl: "https://cdn.usegalileo.ai/stability/08db570b-323e-4e75-ba93-ff06ed9056a8.png",
            title: "Mountain House Beef Stroganoff with Noodles",
            rating: "5.0",
            reviews: "100"
        },
        {
            imageUrl: "https://cdn.usegalileo.ai/stability/08db570b-323e-4e75-ba93-ff06ed9056a8.png",
            title: "Mountain House Beef Stroganoff with Noodles",
            rating: "4.9",
            reviews: "79"
        },
        {
            imageUrl: "https://cdn.usegalileo.ai/stability/a469ecb7-9ea2-45e5-ba75-55bdba0b350d.png",
            title: "Mountain House Chicken Teriyaki with Rice",
            rating: "4.6",
            reviews: "45"
        },
        {
            imageUrl: "https://cdn.usegalileo.ai/stability/fddb5b6b-53ce-4995-a725-42a2e9735454.png",
            title: "Mountain House Spaghetti with Meat Sauce",
            rating: "4.4",
            reviews: "121"
        }
    ];

    return (
        <div className="flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                <h3 className="text-[#111318] text-lg font-bold leading-tight tracking-[-0.015em] px-2 pb-2 pt-4">
                    Top Rated Recipes
                </h3>
                <div className="flex flex-wrap gap-4 p-4">
                    {recipes.map((recipe, index) => (
                        <RecipeItem
                            key={index}
                            imageUrl={recipe.imageUrl}
                            title={recipe.title}
                            rating={recipe.rating}
                            reviews={recipe.reviews}
                        />
                    ))}
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => router.push('/recipes')}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#ee7f2b] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                    >
                        More Recipes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopRatedRecipes;

