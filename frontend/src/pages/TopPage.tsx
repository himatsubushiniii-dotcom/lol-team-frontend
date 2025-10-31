import { useNavigate } from "react-router-dom";
import { Users, Gamepad2, Sparkles } from "lucide-react";

export default function TopPage(): JSX.Element {
  const navigate = useNavigate();

  const services = [
    {
      id: "lol",
      title: "LoL カスタムチーム分け",
      description:
        "League of Legendsのカスタムゲーム用チーム分けツール。ランク情報を自動取得し、公平なチーム編成を実現します。",
      icon: Users,
      color: "from-blue-500 to-purple-600",
      path: "/lolAutoBalance",
      available: true,
    },
    {
      id: "service2",
      title: "サービス2",
      description: "近日公開予定のサービスです",
      icon: Gamepad2,
      color: "from-green-500 to-teal-600",
      path: "/service2",
      available: false,
    },
    {
      id: "service3",
      title: "サービス3",
      description: "近日公開予定のサービスです",
      icon: Sparkles,
      color: "from-orange-500 to-red-600",
      path: "/service3",
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* ヘッダー */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            暇つぶしサイト
          </h1>
          <p className="text-blue-200/70 mt-2">あなたの時間を楽しく</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">サービス一覧</h2>
          <p className="text-blue-200/70 text-lg">
            利用したいサービスを選択してください
          </p>
        </div>

        {/* サービスカードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => service.available && navigate(service.path)}
                className={`
                  relative overflow-hidden rounded-xl p-6 
                  bg-gradient-to-br ${service.color}
                  ${
                    service.available
                      ? "cursor-pointer hover:scale-105"
                      : "cursor-not-allowed opacity-60"
                  }
                  transition-all duration-300
                  shadow-lg hover:shadow-2xl
                  border border-white/20
                `}
              >
                {!service.available && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {service.title}
                  </h3>
                </div>

                <p className="text-white/90 leading-relaxed">
                  {service.description}
                </p>

                {service.available && (
                  <div className="mt-4 flex items-center text-white/80 text-sm">
                    <span>詳細を見る</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* お知らせセクション */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">📢 お知らせ</h3>
          <div className="space-y-3 text-blue-200/80">
            <p>• LoLカスタムチーム分けツールをリリースしました!</p>
            <p>• 新しいサービスを順次追加予定です</p>
            <p>• ご要望・バグ報告はTwitter DMまで</p>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-white/10 backdrop-blur-sm bg-black/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-blue-200/70 text-sm mb-2">© 2025 暇つぶしサイト</p>
          <p className="text-blue-200/50 text-sm">
            お問い合わせ・ご要望・バグ報告は{" "}
            <a
              href="https://twitter.com/balloon_fps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              @balloon_fps
            </a>
            のDMまで
          </p>
        </div>
      </footer>
    </div>
  );
}
