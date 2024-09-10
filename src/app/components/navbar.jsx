"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const Navbar = () => {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'))

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  const handleLogout = async () => {
    try{
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'GET',
        headers: {
          "Content-type": "application/json",
          "X-Token": `${token}`
        }
      })
      if (response.ok) {
        console.log("Logged out succesfully");
        localStorage.setItem('token', "");
        window.location.reload();
        return;
      }
    } catch(err){
      console.log("Could not log out")
    }
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileMenuOpen(false);
  }

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsMenuOpen(false);
  }

  return (
    <header className="relative flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f3ece7] px-4 sm:px-10 py-3">
      <div className="flex items-center gap-4 text-[#1b130d]">
        <h2 onClick={() => { router.push('/') }} className="text-[#1b130d] text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer">RecipeMaster</h2>
      </div>

      {/* Hamburger menu for mobile */}
      <div className="sm:hidden">
        <button onClick={toggleMenu} className="text-[#1b130d]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>

      {/* Navigation for larger screens */}
      <div className="hidden sm:flex items-center gap-8">
        {token ? (
          <>
            <button
              onClick={()=>{ router.push("/create")}}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f3ece7] text-[#1b130d] text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Create</span>
            </button>
            <button
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f3ece7] text-[#1b130d] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
              <div className="text-[#1b130d]" data-icon="Bell" data-size="20px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                </svg>
              </div>
            </button>
            <button onClick={toggleProfileMenu} className="w-10 h-10 rounded-full bg-[#f3ece7] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#1b130d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { router.push('/auth/login') }}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f3ece7] text-[#1b130d] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Login</span>
            </button>
            <button
              onClick={() => { router.push('/auth/signup') }}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f3ece7] text-[#1b130d] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Signup</span>
            </button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="absolute top-full left-0 right-0 bg-white shadow-md z-20 sm:hidden">
          <div className="flex flex-col p-4">
            {token ? (
              <>
                <button
                  onClick={()=>{ router.push("/create"); setIsMenuOpen(false); }}
                  className="flex items-center justify-center py-2 px-4 mb-2 bg-[#f3ece7] text-[#1b130d] rounded-xl"
                >
                  Create
                </button>
                <button
                  onClick={()=>{ /* Handle notifications */ setIsMenuOpen(false); }}
                  className="flex items-center justify-center py-2 px-4 mb-2 bg-[#f3ece7] text-[#1b130d] rounded-xl"
                >
                  Notifications
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center py-2 px-4 bg-[#f3ece7] text-[#1b130d] rounded-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { router.push('/auth/login'); setIsMenuOpen(false); }}
                  className="flex items-center justify-center py-2 px-4 mb-2 bg-[#f3ece7] text-[#1b130d] rounded-xl"
                >
                  Login
                </button>
                <button
                  onClick={() => { router.push('/auth/signup'); setIsMenuOpen(false); }}
                  className="flex items-center justify-center py-2 px-4 bg-[#f3ece7] text-[#1b130d] rounded-xl"
                >
                  Signup
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile menu */}
      {isProfileMenuOpen && token && (
        <div ref={menuRef} className="absolute top-full right-0 mt-2 bg-white shadow-md z-20 rounded-xl">
          <div className="flex flex-col p-4">
            <button
              onClick={()=>{ router.push("/profile"); setIsProfileMenuOpen(false); }}
              className="flex items-center justify-start py-2 px-4 mb-2 hover:bg-[#f3ece7] text-[#1b130d] rounded-xl"
            >
              Profile
            </button>
            {/* <button
              onClick={()=>{ router.push("/settings"); setIsProfileMenuOpen(false); }}
              className="flex items-center justify-start py-2 px-4 mb-2 hover:bg-[#f3ece7] text-[#1b130d] rounded-xl"
            >
              Settings
            </button> */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-start py-2 px-4 hover:bg-[#f3ece7] text-[#1b130d] rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
};

export default Navbar;
