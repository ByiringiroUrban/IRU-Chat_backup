import React from 'react';
import { ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ProcessSection = () => {
    return (
        <section className="relative overflow-hidden py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
            {/* Background blobs for a dynamic feel */}
            <div className="absolute top-0 -right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 -left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

            {/* Main Content Container */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 max-w-7xl">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-16">
                    {/* Left Content Area - Title and "How We Work" */}
                    <div className="lg:w-2/5 text-center lg:text-left">
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-center lg:justify-start">
                            <span className="w-8 h-px bg-blue-600 dark:bg-blue-400 mr-2"></span> OUR PROCESS
                        </p>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                            Easy Dynamic And <br className="hidden md:block" /> Optimal Workflows
                        </h1>

                        {/* Vertically oriented "How We Work" button */}
                        <div className="hidden lg:flex flex-col items-center mt-24">
                            <Link to='/about'>
                                <Button className="relative transform rotate-90 text-sm font-semibold text-white px-6 py-3 rounded-full shadow-lg transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800">
                                    <span className="relative z-10">How We Work</span>
                                    {/* <ChevronRightIcon className="absolute top-1/2 left-full -ml-3 transform -translate-y-1/2 h-5 w-5 rotate-90" /> */}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Content Area - Step Cards */}
                    <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <StepCard
                            step="01"
                            title="Sign Up & Connect"
                            description="Create your secure IRU Chat account and connect your teams, clients, or customers in minutes. Choose between web, mobile, or desktop for seamless access anywhere."
                        />
                        <StepCard
                            step="02"
                            title="Smart & Secure Messaging"
                            description="Send instant messages, voice notes, or video calls—all protected by end-to-end encryption. AI filters and spam protection ensure a clean, distraction free environment."
                        />
                        <StepCard
                            step="03"
                            title="AI-Powered Assistance"
                            description="Enable IRU Chat AI Assistants to automate tasks, answer questions, translate conversations instantly, and analyze customer needs in real-time."
                        />
                        <StepCard
                            step="04"
                            title="Collaborate & Share"
                            description="Share files, documents, and media instantly. Create group chats or project channels to keep your work organized and accessible."
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

const StepCard = ({ step, title, description }) => (
    <div className="p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-blue-500">
        <div className="flex items-center mb-4">
            <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-gray-700">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{step}</span>
                <div className="absolute w-16 h-16 rounded-full bg-blue-100 dark:bg-gray-700 -z-10 animate-ping opacity-75"></div>
            </div>
            <div className="ml-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    STEP
                </p>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-1">
                    {title}
                </h3>
            </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
        </p>
    </div>
);

export default ProcessSection;