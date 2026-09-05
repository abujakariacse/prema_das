'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const bannerImages = [
    {
        id: 1,
        src: '/burger.jpg',
        alt: 'Delicious Burger',
        title: 'Delicious Homemade Burger',
        description: 'Juicy, fresh, and packed with flavor — the perfect burger recipe for any occasion.',
        buttonText: 'See Recipe',
    },
    {
        id: 2,
        src: '/cake.jpg',
        alt: 'Delicious Cake',
        title: 'Rich Chocolate Cake',
        description: 'A decadent chocolate cake topped with fresh berries — perfect for celebrations.',
        buttonText: 'See Recipe',
    },
    {
        id: 3,
        src: '/salad.jpg',
        alt: 'Fresh Salad',
        title: 'Healthy Fresh Salad',
        description: 'Light, crisp, and full of nutrients — a perfect start to any meal.',
        buttonText: 'See Recipe',
    },
];

// টেক্সট লাইনগুলো একটার পর একটা animate হওয়ার জন্য
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.25, // প্রতিটা লাইনের মধ্যে delay
            delayChildren: 0.3,    // ছবি load হওয়ার পর শুরু হওয়ার delay
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export default function Banner() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="max-w-7xl w-full mx-auto h-[400px] md:h-[600px] mt-4 mb-4 bg-gray-200 animate-pulse rounded-2xl" />
        );
    }

    return (
        <div className="max-w-7xl w-full mx-auto h-[400px] md:h-[600px] mt-4 mb-4 overflow-hidden relative rounded-2xl shadow-lg">
            <Swiper
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                className="w-full h-full"
            >
                {bannerImages.map((image, index) => (
                    <SwiperSlide key={image.id} className="relative w-full h-full">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            priority={image.id === 1}
                            quality={95}
                            sizes="100vw"
                            className="object-cover object-center"
                        />

                        {/* Text overlay panel - শুধু active slide এ animate হবে */}
                        <AnimatePresence mode="wait">
                            {activeIndex === index && (
                                <motion.div
                                    key={image.id}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    className="absolute left-0 top-0 bottom-0 w-full md:w-[45%] 
                                               bg-black/40 
                                               flex flex-col justify-center 
                                               px-6 md:px-12 py-8
                                               border-l-4 border-green-500"
                                >
                                    <motion.h2
                                        variants={itemVariants}
                                        className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight"
                                    >
                                        {image.title}
                                    </motion.h2>

                                    <motion.p
                                        variants={itemVariants}
                                        className="text-gray-200 text-base md:text-lg mb-6"
                                    >
                                        {image.description}
                                    </motion.p>

                                    <motion.button
                                        variants={itemVariants}
                                        className="bg-green-600 hover:bg-green-700 transition-colors
                                                   text-white font-semibold px-6 py-3 rounded-md w-fit"
                                    >
                                        {image.buttonText}
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}