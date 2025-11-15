import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Twitter } from "lucide-react";
import LoLFlashbackComponent from "../components/lol-flashback";

export default function LoLFlashback(): JSX.Element {
  const navigate = useNavigate();

  const shareOnTwitter = (): void => {
    const text = encodeURIComponent(
      "LoL 2025 Flashback - 自分のプレイスタイルをクイズで確認！"
    );
    const url = encodeURIComponent(window.location.href);
    const hashtags = encodeURIComponent("LoL,LeagueOfLegends,LoLFlashback");
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=balloon_fps`,
      "_blank",
      "width=550,height=420"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 戻るボタン */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>トップに戻る</span>
        </button>
      </div>

      {/* X共有ボタン */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={shareOnTwitter}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-all"
        >
          <Twitter className="w-5 h-5" />
          <span>Xで共有</span>
        </button>
      </div>

      {/* LoL Flashbackコンポーネント */}
      <div className="flex-1">
        <LoLFlashbackComponent />
      </div>
    </div>
  );
}