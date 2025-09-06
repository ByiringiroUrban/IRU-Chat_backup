import React from "react";
import { CheckIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Features = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-gray-900 to-blue-950">
      {/* Background blobs now in shades of blue and cyan */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-10 right-20 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-10 left-10 w-64 h-64 bg-sky-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Container with Max Width and Padding */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-24 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content Area */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <p className="text-xs sm:text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center justify-center lg:justify-start">
              <span className="w-8 h-px bg-cyan-400 mr-2"></span>
              ABOUT US
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-extrabold text-white leading-snug mb-6">
              Seamless IT Solutions <br className="hidden md:block" /> For
              Business Growth
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start mb-8">
              <span className="text-blue-400 text-5xl sm:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold mr-4 mb-4 sm:mb-0">
                25+
              </span>
              <p className="text-base sm:text-lg text-gray-300 max-w-md">
                <span className="font-bold text-cyan-400">Years of experience</span>{" "}
                we are dedicated to safeguarding your digital world. Founded on
                the principles of innovation, trust, and resilience, we
                specialize in providing cutting-edge IT solutions to businesses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-10">
              <FeatureItem text="Transforming Ideas into Solutions" />
              <FeatureItem text="Where Strategy Meets Technology" />
              <FeatureItem text="Innovation: Strategy. Success." />
              <FeatureItem text="Building Digital Futures Together" />
            </div>

            <div className="flex justify-center lg:justify-start space-x-4">
              <Link to='/about'>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                  See More About
                </Button>
              </Link>
              <Link to='/about'>
                <button className="bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-100/10 font-semibold py-3 px-3 rounded-full transition duration-300 ease-in-out">
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="lg:w-1/2 flex justify-center relative mt-12 lg:mt-0 px-4 sm:px-0">
            <div className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-in-out">
              <img
                src="/About.jpg"
                alt="Team Collaboration"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ text }) => (
  <div className="flex items-center text-gray-200">
    <CheckIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
    <span className="text-sm sm:text-base lg:text-lg">{text}</span>
  </div>
);

export default Features;