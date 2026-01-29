// 라우팅 설정
// main.jsx는 깔끔하게 두고 App.jsx에서 어떤 주소(path)로 들어왔을 때,
// 어떤 페이지(element)를 보여줄건지 보여주기

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import Calendar from './pages/Calendar'; // 나중에 만들 페이지들
// import MyPage from './pages/MyPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* "/" 경로로 들어오면 Home 컴포넌트를 보여줘! */}
        <Route path="/" element={<Home />} />
        
        {/* 나중에 이런 식으로 추가됩니다 */}
        {/* <Route path="/calendar" element={<Calendar />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
