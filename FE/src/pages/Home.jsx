import React from 'react';

// 나중에 DB에서 받아올 데이터의 예시 (더미)
const dummyMusicals = [
  { id: 1, title: "지저스 크라이스트 수퍼스타", venue: "광림아트센터", poster: "https://via.placeholder.com/150" },
  { id: 2, title: "레미제라블", venue: "블루스퀘어", poster: "https://via.placeholder.com/150" },
];

const Home = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🎭 MUDUCK 공연 목록</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {dummyMusicals.map(musical => (
          <div key={musical.id} className="musical-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
            <img src={musical.poster} alt={musical.title} style={{ width: '100%' }} />
            <h3>{musical.title}</h3>
            <p>{musical.venue}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;