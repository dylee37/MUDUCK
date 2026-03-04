import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, MapPin, ExternalLink, Info } from "lucide-react";
import { useState } from "react";

interface BookingSite {
    name: string;
    url: string;
}

interface CastingInfo {
    time: string;
    actors: string[];
}

interface DailyCasting {
    day: number;
    performances: CastingInfo[];
}

interface Musical {
    id: number;
    title: string;
    period: string;
    venue: string;
    image: string;
    description?: string;
    bookingSites?: BookingSite[];
}

interface MusicalDetailProps {
    musical: Musical;
    isOpen: boolean;
    onClose: () => void;
}

const mockCastingData: DailyCasting[] = [
    {
        day: 1,
        performances: [
            { time: "19:30", actors: ["박은태", "정선아", "서경수", "민경아"] }
        ]
    },
    {
        day: 5, // Friday
        performances: [
            { time: "15:00", actors: ["조승우", "홍광호", "옥주현", "카이"] },
            { time: "19:30", actors: ["박은태", "정선아", "서경수", "지혜근"] }
        ]
    },
    {
        day: 6, // Saturday
        performances: [
            { time: "14:00", actors: ["배나라", "아이비", "박지연", "김호영"] },
            { time: "18:30", actors: ["홍광호", "박은태", "정선아", "최민철"] }
        ]
    },
];

export default function MusicalDetail({ musical, isOpen, onClose }: MusicalDetailProps) {
    const [selectedDay, setSelectedDay] = useState<DailyCasting | null>(null);
    const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

    const defaultBookingSites = [
        { name: "인터파크", url: "#" },
        { name: "YES24", url: "#" },
        { name: "티켓링크", url: "#" }
    ];

    const bookingSites = musical.bookingSites || defaultBookingSites;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Close Button Only */}
                        <div className="flex justify-end p-4 absolute right-0 top-0 z-10">
                            <button
                                onClick={onClose}
                                className="p-2 bg-black/5 hover:bg-black/10 rounded-full text-foreground/60 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Header: Photo & Title/Info side by side */}
                            <div className="p-6 pb-0 flex gap-6">
                                {/* Poster Left */}
                                <div className="w-1/3 aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center text-7xl shadow-md border border-white/50 overflow-hidden shrink-0">
                                    {musical.image}
                                </div>

                                {/* Info Right */}
                                <div className="flex-1 space-y-4">
                                    <h2 className="text-2xl font-bold text-black leading-tight">
                                        {musical.title}
                                    </h2>

                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-foreground/80">
                                            <Calendar size={16} className="mt-1 text-primary" />
                                            <div>
                                                <span className="text-[10px] font-bold text-primary block uppercase">공연 기간</span>
                                                <span className="text-sm">{musical.period}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 text-foreground/80">
                                            <MapPin size={16} className="mt-1 text-primary" />
                                            <div>
                                                <span className="text-[10px] font-bold text-primary block uppercase">공연 장소</span>
                                                <span className="text-sm">{musical.venue}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Links */}
                                    <div className="pt-2">
                                        <span className="text-[10px] font-bold text-primary block uppercase mb-1">예매처</span>
                                        <div className="flex flex-wrap gap-2">
                                            {bookingSites.map((site) => (
                                                <a
                                                    key={site.name}
                                                    href={site.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2 py-1 bg-white border border-primary/20 hover:border-primary text-primary text-[10px] rounded-md transition-colors flex items-center gap-1 shadow-sm"
                                                >
                                                    {site.name}
                                                    <ExternalLink size={8} />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Casting Calendar Section */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                        캐스팅 달력
                                        <Info size={14} className="text-muted-foreground" />
                                    </h3>
                                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">2024. 03</span>
                                </div>

                                <div className="grid grid-cols-7 gap-1.5 leading-none">
                                    {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                                        <div key={day} className={`text-[10px] font-bold text-center py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground'}`}>
                                            {day}
                                        </div>
                                    ))}
                                    {daysInMonth.map((day) => {
                                        const casting = mockCastingData.find(c => c.day === day) ||
                                            (day % 4 === 0 ? { day, performances: [{ time: "19:00", actors: ["조승우", "정선아"] }] } : null);

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => casting && setSelectedDay(casting)}
                                                className={`aspect-[4/5] bg-white border ${casting ? 'border-primary/30 hover:bg-primary/5' : 'border-gray-100 opacity-50'} rounded-none p-1 flex flex-col items-start transition-all overflow-hidden`}
                                            >
                                                <span className="text-[9px] font-medium text-muted-foreground mb-0.5">{day}</span>
                                                {casting && (
                                                    <div className="w-full flex flex-col gap-0.5 overflow-hidden">
                                                        {casting.performances.map((perf, idx) => (
                                                            <div key={idx} className="flex flex-col items-start leading-tight mb-0.5">
                                                                <span className="text-[7px] text-primary font-bold">{perf.time}</span>
                                                                <span className="text-[6px] text-foreground truncate w-full text-left">
                                                                    {perf.actors.slice(0, 2).join(", ")}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Daily Casting Detail Overlay */}
                        <AnimatePresence>
                            {selectedDay && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute inset-0 bg-white/95 backdrop-blur-xl z-[210] p-6 flex flex-col"
                                >
                                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                                        <div>
                                            <h4 className="text-lg font-bold text-black">캐스팅 스케줄</h4>
                                            <p className="text-sm text-primary font-medium">3월 {selectedDay.day}일 공연 정보</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDay(null)}
                                            className="p-2 hover:bg-black/5 rounded-full transition-colors"
                                        >
                                            <X size={24} className="text-foreground" />
                                        </button>
                                    </div>

                                    <div className="flex-1 space-y-8 overflow-y-auto">
                                        {selectedDay.performances.map((perf, idx) => (
                                            <div key={idx} className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                        {perf.time} 공연
                                                    </div>
                                                    <div className="h-px flex-1 bg-primary/10"></div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {perf.actors.map((actor, aIdx) => (
                                                        <div key={aIdx} className="bg-white border border-primary/10 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                                                                👤
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-muted-foreground font-medium">배우</p>
                                                                <p className="text-sm font-bold text-foreground">{actor}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="mt-6 w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 text-sm font-bold shadow-lg"
                                    >
                                        닫기
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
