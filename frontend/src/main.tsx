import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import TopPage from './pages/TopPage'
import LoLTeamMaker from './pages/LoLTeamMaker'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/loLautoBalance" element={<LoLTeamMaker />} />  {/* ← ここを変更 */}
        {/* 今後のサービスをここに追加 */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)