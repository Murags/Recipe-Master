"use client";

import ReviewsSection from "./components/ReviewSection";
import TopRatedRecipes from "./components/TopRatedRecipes";
import { useRouter } from "next/navigation";
import Navbar from "./components/navbar";


export default function Home() {
  const router = useRouter()

  return (
    <main>
      <Navbar/>
      <div className="px-30 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[1080px] flex-1">
          <div className="@container">
            <div className="@[480px]:p-4">
              <div
                className="flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl rounded-xl items-start justify-end px-4 pb-10 @[480px]:px-10 overflow-hidden"
                style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%), url("/images/hero-img.jpg")' }}
              >
                <div className="flex flex-col gap-2 text-left">
                  <h1
                    className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                    Your personal recipe guide, on-demand
                  </h1>
                  <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                    Discover delicious recipes tailored to your taste, right at your fingertips. Cook like a pro with step-by-step instructions, anytime, anywhere.
                  </h2>
                </div>
                <div className="flex-wrap gap-3 flex">
                  <button
                    onClick={()=>{ router.push('/auth/signup')}}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#ee7f2b] text-[#1b130d] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                  >
                    <span className="truncate">Get Started</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 px-4 py-10 @container">
            <div className="flex flex-col gap-4">
              <h1
                className="text-[#1b130d] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
              >
                How Our Recipe App Works
              </h1>
              <p className="text-[#1b130d] text-base font-normal leading-normal max-w-[720px]">
                Discover, cook, and enjoy your favorite recipes with ease using our step-by-step guides.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                  style={{ backgroundImage: 'url("/images/browsing-images.jpg")' }}
                ></div>
                <div>
                  <p className="text-[#1b130d] text-base font-medium leading-normal">Browse Recipes</p>
                  <p className="text-[#9a6e4c] text-sm font-normal leading-normal">Explore a wide range of delicious recipes tailored to your taste and preferences.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                  style={{ backgroundImage: 'url("/images/following-instructions.jpg")' }}
                ></div>
                <div>
                  <p className="text-[#1b130d] text-base font-medium leading-normal">Follow Step-by-Step Instructions</p>
                  <p className="text-[#9a6e4c] text-sm font-normal leading-normal">Cook with confidence using easy-to-follow steps and tips from culinary experts.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                  style={{ backgroundImage: 'url("/images/save-fav.jpg")' }}
                ></div>
                <div>
                  <p className="text-[#1b130d] text-base font-medium leading-normal">Save Your Favorites</p>
                  <p className="text-[#9a6e4c] text-sm font-normal leading-normal">Easily save and organize your favorite recipes to access anytime, anywhere.</p>
                </div>
              </div>
            </div>

            <TopRatedRecipes/>
            <ReviewsSection/>

          </div>

        </div>
      </div>
    </main>

  );
}
