"use client";

import { motion } from "framer-motion";
import { UserPlus, ChefHat, Heart, UtensilsCrossed } from "lucide-react";

const STEPS = [
    {
        icon: UserPlus,
        title: "Create an Account",
        description:
            "Sign up in seconds and join a community of food lovers sharing recipes every day.",
    },
    {
        icon: ChefHat,
        title: "Browse & Add Recipes",
        description:
            "Explore recipes from around the world, or share your own creations with the community.",
    },
    {
        icon: Heart,
        title: "Save Your Favorites",
        description:
            "Like, favorite, and organize the recipes you love so you can find them anytime.",
    },
    {
        icon: UtensilsCrossed,
        title: "Cook & Enjoy",
        description:
            "Follow step-by-step instructions and bring delicious homemade meals to your table.",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export default function HowItWorks() {
    return (
        <section className="max-w-7xl mx-auto px-4 my-16">
            <div className="text-center mb-12">
                <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                    Simple Process
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-2">How It Works</h2>
                <div className="w-10 h-1 bg-green-600 rounded-full mt-3 mx-auto" />
                <p className="text-gray-500 text-sm sm:text-[15px] max-w-xl mx-auto mt-4">
                    Getting started on RecipeHub takes just a few steps — from
                    signing up to cooking your next favorite meal.
                </p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <motion.div
                            key={step.title}
                            variants={itemVariants}
                            className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                        >
                            <span className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                                {index + 1}
                            </span>
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                                <Icon size={22} className="text-green-600" strokeWidth={2} />
                            </div>
                            <h3 className="font-semibold text-[15px] mb-2">
                                {step.title}
                            </h3>
                            <p className="text-[13.5px] text-gray-500 leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
}