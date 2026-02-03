
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black bg-opacity-20 mt-8 py-4">
      <div className="container mx-auto px-4 text-center text-amber-200 opacity-70">
        <p>&copy; {new Date().getFullYear()} Glyph Circle. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
