import { motion } from "motion/react";

interface BirdLogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    animate?: boolean;
}

export default function BirdLogo({ className = "", size = "md", animate = true }: BirdLogoProps) {
    const sizeMap = {
        sm: "w-6 h-6",
        md: "w-9 h-9",
        lg: "w-16 h-16",
        xl: "w-40 h-40",
    };

    return (
        <motion.div
            animate={animate ? { y: [0, -2, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05, rotate: -3 }}
            className={`relative ${sizeMap[size]} flex items-center justify-center group ${className}`}
        >
            <div className={`absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-colors ${size === "xl" ? "blur-2xl" : "blur-lg"}`} />
            <svg viewBox="0 0 100 100" className="w-full h-full relative drop-shadow-sm select-none">
                {/* Duck Character Outline (Fatter, cuter body) */}
                <path
                    d="M75 62 C 90 62 95 82 85 90 C 75 98 25 98 15 88 C 5 75 12 62 22 62 C 22 62 18 45 28 32 C 38 18 62 18 72 32 C 82 45 75 62 75 62 Z"
                    fill="var(--primary)"
                />
                {/* Belly Area */}
                <path
                    d="M35 70 C 25 74 25 86 35 91 C 45 96 65 96 75 89 C 82 81 75 70 65 70 Z"
                    fill="white"
                    fillOpacity="0.25"
                />
                {/* Cute Dot Eyes */}
                <circle cx="65" cy="40" r="2.5" fill="white" />
                {/* <circle cx="70" cy="40" r="2.5" fill="white" /> */}

                {/* Blush */}
                <ellipse cx="65" cy="48" rx="6" ry="3.5" fill="#FFB8D9" fillOpacity="0.5" />
                {/* <ellipse cx="78" cy="48" rx="6" ry="3.5" fill="#FFB8D9" fillOpacity="0.5" /> */}

                {/* Cute Beak */}
                <path
                    d="M77 42 C 110 48 90 52 77 55 C Z"
                    fill="#FFB800"
                />

                {/* Wing (Animated) */}
                <motion.path
                    animate={animate ? { rotate: [-10, 0, -10] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originX: "40px", originY: "78px" }}
                    d="M45 74 C 32 70, 35 87, 48 84"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
        </motion.div>
    );
}
