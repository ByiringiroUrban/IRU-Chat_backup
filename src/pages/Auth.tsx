import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState('signIn'); // 'signIn' or 'signUp'

    const renderSignInForm = () => (
        <>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h2>
            <p className="text-gray-600 mb-6">Sign in to your account to continue chatting</p>

            <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                        Password
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                    </a>
                </div>
                <input
                    type="password"
                    id="password"
                    placeholder="•••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <Button className="w-full btn-hero">
                Sign In
            </Button>
        </>
    );

    const renderSignUpForm = () => (
        <>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create an account</h2>
            <p className="text-gray-600 mb-6">Join our platform to access powerfull AI model</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="email-signup" className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                </label>
                <input
                    type="email"
                    id="email-signup"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-6">
                <label htmlFor="password-signup" className="block text-gray-700 text-sm font-medium mb-2">
                    Password
                </label>
                <input
                    type="password"
                    id="password-signup"
                    placeholder="•••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* The "Please fill out this field" tooltip is typically handled by browser validation or a custom validation library */}
            </div>

            <Button className="w-full btn-hero">
                Create Account
            </Button>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">IRU ASSISTANT</h1>
                <p className="text-lg text-gray-600">Your journey to tech excellence starts here</p>
            </div>

            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
                {/* Tab Buttons */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
                    <button
                        className={`flex-1 py-2 text-center rounded-md text-lg font-medium transition-all duration-300 ${activeTab === 'signIn'
                            ? 'bg-white shadow text-gray-800'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                        onClick={() => setActiveTab('signIn')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 py-2 text-center rounded-md text-lg font-medium transition-all duration-300 ${activeTab === 'signUp'
                            ? 'bg-white shadow text-gray-800'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                        onClick={() => setActiveTab('signUp')}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form Content */}
                {activeTab === 'signIn' ? renderSignInForm() : renderSignUpForm()}
            </div>
        </div>
    );
};

export default AuthPage;