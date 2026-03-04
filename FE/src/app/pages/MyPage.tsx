import { useState } from "react";
import { motion } from "motion/react";
import { Camera, LogOut, Palette, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router";
import "../../styles/theme.css";

const colorThemes = [
  { primary: "#c7768d", secondary: "#c7768d", bg: "#fef1f3", foreground: "#4a1f2b" },
  { primary: "#dac259ff", secondary: "#dac259ff", bg: "#fefbf1ff", foreground: "#4a481f" },
  { primary: "#8b9bc3", secondary: "#8b9bc3", bg: "#f1f3fe", foreground: "#1f2b4a" },
  { primary: "#b98eca", secondary: "#b98eca", bg: "#f4ecf7", foreground: "#401f4a" },
  { primary: "#f5b9ebff", secondary: "#f5b9ebff", bg: "#f8eff6ff", foreground: "#401f4a" },
  { primary: "#b4b4b4", secondary: "#b4b4b4", bg: "#ffffff", foreground: "#333333" },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("뮤지컬 러버");
  const [profileImage, setProfileImage] = useState("🎟️");
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
  const [tempNickname, setTempNickname] = useState(nickname);
  const [tempProfileImage, setTempProfileImage] = useState(profileImage);

  const handleSaveProfile = () => {
    setNickname(tempNickname);
    setProfileImage(tempProfileImage);
  };

  const handleLogout = () => {
    localStorage.removeItem("hasSeenOnboarding");
    navigate("/onboarding");
  };

  const handleThemeChange = (theme: typeof colorThemes[0]) => {
    setSelectedTheme(theme);
    document.documentElement.style.setProperty("--primary", theme.primary);
    document.documentElement.style.setProperty("--secondary", theme.secondary);
    document.documentElement.style.setProperty("--background", theme.bg);
    document.documentElement.style.setProperty("--foreground", theme.foreground);
    localStorage.setItem("selectedTheme", JSON.stringify(theme));
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-2xl"
      >
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-5xl border-4 border-white/40 shadow-lg">
              {profileImage}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera size={16} className="text-white" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-xl border-white/40 max-w-[90%] rounded-3xl">
                <DialogHeader>
                  <DialogTitle>프로필 수정</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="nickname" className="mb-2 inline-block">닉네임</Label>
                    <Input
                      id="nickname"
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      className="bg-white/60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-emoji" className="mb-2 inline-block">프로필 이모지</Label>
                    <Input
                      id="profile-emoji"
                      value={tempProfileImage}
                      onChange={(e) => setTempProfileImage(e.target.value)}
                      className="bg-white/60 text-center text-3xl"
                      maxLength={2}
                    />
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full bg-primary hover:bg-primary/90">
                    저장하기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <h2 className="text-lg text-foreground mb-1">{nickname}</h2>
        </div>
      </motion.div>

      {/* Settings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-full">
              <Palette size={18} className="text-primary" />
            </div>
            <h3 className="text-sm text-foreground">테마 컬러</h3>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-4 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {colorThemes.map((theme, index) => (
              <button
                key={index}
                onClick={() => handleThemeChange(theme)}
                className={`flex-shrink-0 w-16 aspect-square rounded-2xl transition-all duration-300 ${selectedTheme.primary === theme.primary
                  ? "scale-110 z-10"
                  : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                }}
              >
                <span className="sr-only">테마 {index + 1}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg"
        >

          <div className="space-y-3">
            <button className="w-full text-left text-sm text-foreground hover:bg-white/40 rounded-2xl px-4 py-3 transition-colors">
              비밀번호 변경
            </button>
            <button className="w-full text-left text-sm text-foreground hover:bg-white/40 rounded-2xl px-4 py-3 transition-colors">
              알림 설정
            </button>
            <button className="w-full text-left text-sm text-foreground hover:bg-white/40 rounded-2xl px-4 py-3 transition-colors">
              개인정보 처리방침
            </button>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2"
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} className="mr-2" />
            로그아웃
          </Button>
        </motion.div>
      </div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center py-4"
      >
        <p className="text-xs text-muted-foreground mb-1">MUDUCK v1.0.0</p>
        <p className="text-xs text-muted-foreground">© 2024 MUDUCK. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
