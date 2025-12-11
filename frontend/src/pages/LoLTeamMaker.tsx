import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Twitter } from "lucide-react";
import LoLTeamMakerComponent from "../components/lol_team_maker";

export default function LoLTeamMaker(): JSX.Element {
  const navigate = useNavigate();

  const shareOnTwitter = (): void => {
    const text = encodeURIComponent(
      "LoL カスタムチーム分け - ランク情報を自動取得して公平なチーム編成！"
    );
    const url = encodeURIComponent(window.location.href);
    const hashtags = encodeURIComponent("LoL,LeagueOfLegends,カスタムゲーム");
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

      {/* LoLチーム分けコンポーネント */}
      <div className="flex-1">
        <LoLTeamMakerComponent />
      </div>

      {/* フッター */}
      <footer className="border-t border-white/10 backdrop-blur-sm bg-black/20 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-white text-sm font-medium">
              © 2025 暇つぶしサイト
            </p>
            <p className="text-blue-200/70 text-sm">
              お問い合わせ・ご要望・バグ報告は{" "}
              <a
                href="https://twitter.com/balloon_fps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
              >
                @balloon_fps
              </a>
              まで
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
