// About the Developer
const AboutDeveloperApp = () => {
    const darkMode = useStore(s => s.darkMode);

    return (
        <div className={`h-full overflow-y-auto ${darkMode ? 'bg-[#1e1e1e] text-white' : 'bg-gradient-to-b from-gray-50 to-white text-gray-900'}`}>
            <div className="max-w-[520px] mx-auto py-10 px-8">
                {/* Profile photo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-[130px] h-[130px] rounded-full overflow-hidden shadow-lg ring-4 ring-white/30 mb-4">
                        <img src="AboutPhoto/MePhoto.jpeg" alt="Amit Mozapi"
                            className="w-full h-full object-cover" draggable="false"/>
                    </div>
                    <h1 className="text-[26px] font-bold tracking-tight">Amit Mozapi</h1>
                    <p className={`text-[14px] mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Developer &bull; 16 years old &bull; Israel</p>
                </div>

                {/* Divider */}
                <div className={`h-px mb-6 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}/>

                {/* About text */}
                <div className={`text-[14px] leading-relaxed space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p>
                        Hi, I'm Amit Mozapi — a 16 years old developer from Israel with a passion for building things on the web.
                    </p>
                    <p>
                        I'm currently a high school student majoring in <span className="font-semibold">Biotechnology</span> and <span className="font-semibold">Biology</span>, but when I'm not in the lab, I'm writing code. This macOS Sonoma replica was built entirely from scratch using React, Tailwind CSS, and a lot of attention to detail — from the dock magnification and window management to a working file system, App Store, and fully playable apps.
                    </p>
                    <p>
                        I love pushing the limits of what's possible in a browser and coding in general.
                    </p>
                </div>

                {/* Divider */}
                <div className={`h-px my-6 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}/>

                {/* Contact */}
                <div className="flex flex-col items-center gap-3">
                    <p className={`text-[13px] font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Get in touch for any questions!
                    </p>
                    <a href="https://instagram.com/am1tt3" target="_blank" rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:scale-105 active:scale-95 ${
                            darkMode
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                        }`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                        @am1tt3
                    </a>
                </div>

                {/* Footer */}
                <div className={`text-center text-[11px] mt-8 pb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    Built with React, Tailwind CSS & passion
                </div>
            </div>
        </div>
    );
};

window.AboutDeveloperApp = AboutDeveloperApp;
