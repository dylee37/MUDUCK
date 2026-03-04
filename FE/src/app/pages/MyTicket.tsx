import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Calendar, Clock, MapPin, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

interface Ticket {
  id: number;
  musical: string;
  date: string;
  time: string;
  venue: string;
  seat: string;
  review?: string;
}

export default function MyTicket() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1,
      musical: "팬레터",
      date: "2026-02-18 (수)",
      time: "14:00",
      venue: "예술의전당 CJ 토월극장",
      seat: "R석 1층 B블록 10열 13번",
    },
    {
      id: 2,
      musical: "팬레터",
      date: "2026-02-15 (일)",
      time: "19:00",
      venue: "예술의전당 CJ 토월극장",
      seat: "R석 1층 B블록 9열 15번",
    },
    {
      id: 3,
      musical: "위키드",
      date: new Date().toISOString().split('T')[0],
      time: "14:00",
      venue: "블루스퀘어",
      seat: "OP석 1열 5번",
    },
    {
      id: 4,
      musical: "시카고",
      date: "2026-02-25",
      time: "20:00",
      venue: "샤롯데씨어터",
      seat: "1층 B열 20번",
    },
  ]);

  const [showAlert, setShowAlert] = useState<{ show: boolean; message: string; ticketId: number | null }>({
    show: false,
    message: "",
    ticketId: null,
  });

  const [newTicket, setNewTicket] = useState({
    musical: "",
    date: "",
    time: "",
    venue: "",
    seat: "",
  });

  const [reviewTicketId, setReviewTicketId] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    // Apply theme from localStorage
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty("--secondary", theme.secondary);
      document.documentElement.style.setProperty("--background", theme.bg);
      document.documentElement.style.setProperty("--foreground", theme.foreground);
    }

    // Check for D-day or D-1 alerts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tickets.forEach((ticket) => {
      const ticketDate = new Date(ticket.date);
      ticketDate.setHours(0, 0, 0, 0);

      const diffTime = ticketDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        setShowAlert({ show: true, message: `오늘은 ${ticket.musical} 관람일입니다! 🎭`, ticketId: ticket.id });
      } else if (diffDays === 1) {
        setShowAlert({ show: true, message: `내일은 ${ticket.musical} 관람일입니다! 🎭`, ticketId: ticket.id });
      }
    });
  }, [tickets]);

  const parseDateString = (dateStr: string) => {
    // Extract YYYY-MM-DD format (first 10 characters)
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    if (!match) return new Date(dateStr);
    return new Date(match[0]);
  };

  const calculateDday = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ticketDate = parseDateString(dateStr);
    ticketDate.setHours(0, 0, 0, 0);

    const diffTime = ticketDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-Day";
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const isPastTicket = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ticketDate = parseDateString(dateStr);
    ticketDate.setHours(0, 0, 0, 0);
    return ticketDate < today;
  };

  const handleAddTicket = () => {
    if (!newTicket.musical || !newTicket.date || !newTicket.time || !newTicket.venue) {
      return;
    }

    const ticket: Ticket = {
      id: Date.now(),
      ...newTicket,
    };

    setTickets([...tickets, ticket]);
    setNewTicket({ musical: "", date: "", time: "", venue: "", seat: "" });
  };

  const handleAddReview = (ticketId: number) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, review: reviewText } : ticket
      )
    );
    setReviewText("");
    setReviewTicketId(null);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Alert Popup */}
      {showAlert.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-2xl shadow-xl mb-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm">{showAlert.message}</p>
            <button
              onClick={() => setShowAlert({ show: false, message: "", ticketId: null })}
              className="text-white/80 hover:text-white text-sm"
            >
              닫기
            </button>
          </div>
        </motion.div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-foreground">나의 티켓</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-1" />
              티켓 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-white/40 max-w-[90%] rounded-[40px] p-8">
            <DialogHeader>
              <DialogTitle>티켓 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label htmlFor="musical" className="ml-2 text-muted-foreground/80 font-medium">뮤지컬명</Label>
                <Input
                  id="musical"
                  value={newTicket.musical}
                  onChange={(e) => setNewTicket({ ...newTicket, musical: e.target.value })}
                  placeholder="뮤지컬 이름을 입력하세요"
                  className="bg-gray-50 border-gray-100 rounded-2xl h-12 px-5 focus:ring-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="ml-2 text-muted-foreground/80 font-medium">관람 날짜</Label>
                  <Input
                    type="date"
                    value={newTicket.date}
                    onChange={(e) => setNewTicket({ ...newTicket, date: e.target.value })}
                    className="bg-gray-50 border-gray-100 rounded-2xl h-12 px-4 focus:ring-gray-200 text-sm appearance-none flex items-center justify-between"
                    style={{ colorScheme: 'light' }}
                  />
                  <style>{`
                    input[type="date"]::-webkit-calendar-picker-indicator {
                      filter: invert(0.5);
                    }
                  `}</style>
                </div>
                <div className="space-y-3">
                  <Label className="ml-2 text-muted-foreground/80 font-medium">관람 시간</Label>
                  <div className="flex gap-2">
                    <select
                      value={newTicket.time.split(':')[0] || "12"}
                      onChange={(e) => {
                        const mins = newTicket.time.split(':')[1] || "00";
                        setNewTicket({ ...newTicket, time: `${e.target.value}:${mins}` });
                      }}
                      className="bg-gray-50 border border-gray-100 rounded-2xl h-12 px-3 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm flex-1 appearance-none text-center"
                    >
                      {Array.from({ length: 13 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <select
                      value={newTicket.time.split(':')[1] || "00"}
                      onChange={(e) => {
                        const hours = newTicket.time.split(':')[0] || "12";
                        setNewTicket({ ...newTicket, time: `${hours}:${e.target.value}` });
                      }}
                      className="bg-gray-50 border border-gray-100 rounded-2xl h-12 px-3 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm flex-1 appearance-none text-center"
                    >
                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="venue" className="ml-2 text-muted-foreground/80 font-medium">공연장</Label>
                <Input
                  id="venue"
                  value={newTicket.venue}
                  onChange={(e) => setNewTicket({ ...newTicket, venue: e.target.value })}
                  placeholder="공연장 이름을 입력하세요"
                  className="bg-gray-50 border-gray-100 rounded-2xl h-12 px-5 focus:ring-gray-200"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="seat" className="ml-2 text-muted-foreground/80 font-medium">좌석</Label>
                <Input
                  id="seat"
                  value={newTicket.seat}
                  onChange={(e) => setNewTicket({ ...newTicket, seat: e.target.value })}
                  placeholder="예: 1층 B열 10번"
                  className="bg-gray-50 border-gray-100 rounded-2xl h-12 px-5 focus:ring-gray-200"
                />
              </div>

              <Button
                onClick={handleAddTicket}
                className="w-full h-14 bg-gray-500 hover:bg-gray-600 text-white rounded-[24px] text-lg font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98] mt-4"
              >
                티켓 추가하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg"

            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base text-foreground mb-1">{ticket.musical}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-lg">🎭</span>
                    <span>{ticket.venue}</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs bg-primary text-white">
                  {calculateDday(ticket.date)}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={14} />
                  <span>{ticket.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={14} />
                  <span>{ticket.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={14} />
                  <span>{ticket.seat}</span>
                </div>
              </div>

              {/* Review Section */}
              {isPastTicket(ticket.date) && (
                <div className="mt-4 pt-4 border-t border-primary/20">
                  {ticket.review ? (
                    <div className="bg-white/40 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-primary" />
                        <span className="text-xs text-primary">나의 후기</span>
                      </div>
                      <p className="text-xs text-foreground">{ticket.review}</p>
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-full border-primary/30 hover:bg-primary/10"
                          onClick={() => setReviewTicketId(ticket.id)}
                        >
                          <MessageSquare size={14} className="mr-1" />
                          후기 작성하기
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/95 backdrop-blur-xl border-white/40 max-w-[90%] rounded-3xl">
                        <DialogHeader>
                          <DialogTitle>후기 작성</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <Textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="관람 후기를 작성해주세요..."
                            className="bg-white/60 min-h-32"
                          />
                          <Button
                            onClick={() => handleAddReview(ticket.id)}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            저장하기
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
            </motion.div>
          ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          아직 등록된 티켓이 없습니다
          <br />
          첫 티켓을 추가해보세요! 🎭
        </div>
      )}
    </div>
  );
}
