import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ChatBubbleLeftRightIcon, UserGroupIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import echoLogo from '../img/echo.png';

const Landing: React.FC = () => {
  const { isDarkMode } = useTheme();

  const features = [
    {
      icon: <ChatBubbleLeftRightIcon className="h-8 w-8" />,
      title: "Share Your Vibes",
      description: "Express yourself through public echoes or keep your thoughts private. Choose your mood and let your voice be heard."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Connect with Friends",
      description: "Add friends using their unique Echo ID. Build your network and stay connected with those who matter."
    },
    {
      icon: <LockClosedIcon className="h-8 w-8" />,
      title: "Private Vibes",
      description: "Keep your personal thoughts secure in your private space. Share them only when you're ready."
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "Weekly Echo ID",
      description: "Your Echo ID changes weekly for enhanced privacy. Share your current ID to connect with friends."
    }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden lg:min-h-[600px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Welcome to</span>
                <span className="block text-primary">Echo</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                A space where your thoughts find their voice. Share your vibes, connect with friends, and express yourself freely.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/auth"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-secondary md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            {/* Image Container */}
            <div className="mt-10 lg:mt-0 lg:col-span-6 lg:flex lg:items-end lg:justify-end">
              <img 
                className="h-64 w-full object-contain sm:h-80 md:h-96 lg:w-auto lg:h-[500px]"
                src={echoLogo} 
                alt="Echo Logo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to express yourself
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    {feature.icon}
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary dark:bg-primary-dark">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start?</span>
            <span className="block text-white">Join Echo today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <span className="text-gray-400 dark:text-gray-500 text-sm">by Claude</span>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400 dark:text-gray-500">
              &copy; 2025 Echo. Made with love by Hibachi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 