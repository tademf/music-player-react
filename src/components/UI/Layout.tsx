import React from 'react';
import { useMusicStore } from '../../store/useMusicStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentTrackIndex, playlist, theme, themeColor, wallpaper, fontStyle } = useMusicStore();
  const track = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const isDark = theme === 'dark';

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    rounded: 'font-rounded',
    display: 'font-display',
    italic: 'font-italic',
  };

  const themeColors = {
    indigo: { light: '#e0e7ff', dark: '#1e1b4b' },
    rose: { light: '#ffe4e6', dark: '#4c0519' },
    emerald: { light: '#d1fae5', dark: '#064e3b' },
    amber: { light: '#fef3c7', dark: '#78350f' },
    violet: { light: '#ede9fe', dark: '#2e1065' },
    fuchsia: { light: '#fae8ff', dark: '#4a044e' },
    cyan: { light: '#cffafe', dark: '#164e63' },
    teal: { light: '#ccfbf1', dark: '#115e59' },
    orange: { light: '#ffedd5', dark: '#7c2d12' },
  };

  const bgGradient = track?.palette && track.palette.length >= 3
    ? `radial-gradient(circle at 0% 0%, ${track.palette[0]}${isDark ? '80' : '60'}, transparent 50%),
       radial-gradient(circle at 100% 0%, ${track.palette[1]}${isDark ? '80' : '60'}, transparent 50%),
       radial-gradient(circle at 50% 100%, ${track.palette[2]}${isDark ? '80' : '60'}, transparent 50%),
       ${isDark ? `linear-gradient(135deg, ${themeColors[themeColor].dark} 0%, #000000 100%)` : `linear-gradient(135deg, ${themeColors[themeColor].light} 0%, #ffffff 100%)`}`
    : track?.dominantColor
      ? `radial-gradient(circle at 50% 0%, ${track.dominantColor}${isDark ? '80' : '60'}, ${isDark ? `${themeColors[themeColor].dark} 40%, #000000 100%` : `${themeColors[themeColor].light} 40%, #ffffff 100%`})`
      : isDark 
        ? `linear-gradient(135deg, ${themeColors[themeColor].dark} 0%, #000000 100%)`
        : `linear-gradient(135deg, ${themeColors[themeColor].light} 0%, #ffffff 100%)`;

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-0 sm:p-8 transition-all duration-1000 ease-in-out ${isDark ? 'dark' : ''} ${fontClasses[fontStyle]}`}
      style={{ 
        backgroundImage: wallpaper ? `url(${wallpaper})` : bgGradient, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="w-full sm:max-w-4xl lg:max-w-6xl mx-auto relative z-10 transition-all duration-500 h-full sm:h-auto">
        {children}
      </div>
    </div>
  );
};
