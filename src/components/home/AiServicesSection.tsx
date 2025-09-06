import React from 'react';
import { Squares2X2Icon, ChartBarSquareIcon, BoltIcon } from '@heroicons/react/24/solid';

const AiServicesSection = () => {
    return (
        <section className="bg-gray-900 py-16 md:py-24 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 max-w-7xl">
                <div className="flex flex-col items-center text-center">
                    <p className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-2">
                        OUR SERVICES
                    </p>
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-12">
                        AI-Powered Solutions For Your <br className="hidden md:block" /> Business
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {/* AI Consulting & Strategy Card */}
                    <ServiceCard
                        icon={<Squares2X2Icon className="h-8 w-8 text-teal-400" />}
                        title="AI Consulting & Strategy"
                        benefits={["Basic support (email only)", "Access to core AI functions"]}
                        imageUrl="/AI-01.jpg"
                    />

                    {/* AI Software Development Card */}
                    <ServiceCard
                        icon={<ChartBarSquareIcon className="h-8 w-8 text-teal-400" />}
                        title="AI Software Development"
                        benefits={["Basic support (email only)", "Access to core AI functions"]}
                        imageUrl="/AI-02.jpg"
                    />

                    {/* AI-Powered Automation Card */}
                    <ServiceCard
                        icon={<BoltIcon className="h-8 w-8 text-teal-400" />}
                        title="AI-Powered Automation"
                        benefits={["Basic support (email only)", "Access to core AI functions"]}
                        imageUrl="/AI-03.jpg"
                    />
                </div>

                <div className="mt-16 text-center">
                    <a href="#" className="inline-block border border-gray-600 hover:border-teal-400 text-sm font-medium py-3 px-8 rounded-full transition duration-300 ease-in-out">
                        Leading The AI Solutions Revolution.
                        <span className="ml-2 underline hover:no-underline">View More Details</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

const ServiceCard = ({ icon, title, benefits, imageUrl }) => (
    <div className="p-6 bg-gray-800 rounded-lg border-2 border-transparent transition-all duration-300 ease-in-out transform hover:scale-105 hover:border-teal-500 hover:shadow-2xl">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-700 rounded-full">{icon}</div>
            <h3 className="text-xl font-bold ml-4">{title}</h3>
        </div>
        <div className="mb-4 text-gray-400">
            {benefits.map((benefit, index) => (
                <p key={index} className="flex items-center mb-1 text-sm">
                    <span className="text-teal-400 font-bold mr-2">+</span>
                    {benefit}
                </p>
            ))}
        </div>
        <div className="rounded-lg overflow-hidden mt-4">
            <img
                src={imageUrl}
                alt={title}
                className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform hover:scale-110"
            />
        </div>
    </div>
);

export default AiServicesSection;