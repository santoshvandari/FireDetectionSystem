import React from 'react';
import logo from '../assets/builtwithbolt.png'; // Adjust the path as necessary

const Logo = () => {
  return (
    <div className="fixed top-4 right-4 z-50 p-3 hover:scale-110 hover:rotate-3 transition-all duration-300 ease-in-out cursor-pointer">
      <img 
        src={logo} 
        alt="Built with Bolt" 
        className="h-16 w-auto block sm:h-12 md:h-16 lg:h-20 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
      />
    </div>
  );
};

export default Logo;