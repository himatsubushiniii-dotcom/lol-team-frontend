import React, { useState } from 'react';
import { Users, Trash2, Shuffle, Loader2 } from 'lucide-react';

// ロールの定義
const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

// ロールアイコン(SVG)
const RoleIcon = ({ role, size = 24 }: { role: string; size?: number }) => {
  const icons: { [key: string]: JSX.Element } = {
    'TOP': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4.36v8.46c0 4.26-2.88 8.61-8 9.91-5.12-1.3-8-5.65-8-9.91V8.54l8-4.36zM11 9v2H9v2h2v2h2v-2h2v-2h-2V9h-2z"/>
      </svg>
    ),
    'JUNGLE': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
      </svg>
    ),
    'MID': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l-5.5 9h3.5v9h4v-9h3.5L12 2zm0 3.84L13.93 9h-1.43v7h-1v-7H10.07L12 5.84z"/>
      </svg>
    ),
    'ADC': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    ),
    'SUPPORT': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    )
  };
  return icons[role] || null;
};

// ティアからレートへの変換(簡易版)
const tierToRating = (tier, rank, lp) => {
  const tierValues = {
    'IRON': 0,
    'BRONZE': 400,
    'SILVER': 800,
    'GOLD': 1200,
    'PLATINUM': 1600,
    'EMERALD': 2000,
    'DIAMOND': 2400,
    'MASTER': 2800,
    'GRANDMASTER': 3200,
    'CHALLENGER': 3600
  };
  const rankValues = { 'IV': 0, 'III': 100, 'II': 200, 'I': 300 };
  return (tierValues[tier] || 0) + (rankValues[rank] || 0) + (lp || 0);
};

// Riot APIからランク情報を取得
const fetchRankFromAPI = async (gameName, tagLine) => {
  const API_URL = 'http://localhost:8080/api/rank';
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameName: gameName,
        tagLine: tagLine
      })
    });

    if (!response.ok) {
      throw new Error('');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('正しいアカウントを入力してください。(例:Player#JP1) ');
  }
};

// モックAPIレスポンス(テスト用・本番では削除)
const mockFetchRank = async (summonerName, tag) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const tiers = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND'];
  const ranks = ['IV', 'III', 'II', 'I'];
  const tier = tiers[Math.floor(Math.random() * tiers.length)];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  const lp = Math.floor(Math.random() * 100);
  return { tier, rank, lp, rating: tierToRating(tier, rank, lp) };
};

// チーム分けアルゴリズム
const divideTeams = (players) => {
  let bestDiff = Infinity;
  let bestTeams = null;
  
  const n = players.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    if (countBits(mask) !== 5) continue;
    
    const team1 = [];
    const team2 = [];
    
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) team1.push(players[i]);
      else team2.push(players[i]);
    }
    
    const sum1 = team1.reduce((s, p) => s + p.rating, 0);
    const sum2 = team2.reduce((s, p) => s + p.rating, 0);
    const diff = Math.abs(sum1 - sum2);
    
    if (diff < bestDiff) {
      bestDiff = diff;
      bestTeams = { team1, team2 };
    }
  }
  
  return bestTeams;
};

const countBits = (n) => {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
};

// ロール配分
const assignRoles = (team) => {
  const roleOrder = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const availableRoles = [...roleOrder];
  const assignments = [];
  
  const sorted = [...team].sort((a, b) => a.preferredRoles.length - b.preferredRoles.length);
  
  sorted.forEach(player => {
    const possibleRoles = availableRoles.filter(r => player.preferredRoles.includes(r));
    const assignedRole = possibleRoles.length > 0 ? possibleRoles[0] : availableRoles[0];
    assignments.push({ ...player, assignedRole });
    availableRoles.splice(availableRoles.indexOf(assignedRole), 1);
  });
  
  return assignments.sort((a, b) => 
    roleOrder.indexOf(a.assignedRole) - roleOrder.indexOf(b.assignedRole)
  );
};

export default function LoLTeamMaker() {
  const [players, setPlayers] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [addResults, setAddResults] = useState(null);
  const [sortType, setSortType] = useState('none');
  
  // ソート済みプレイヤーリストを取得
  const getSortedPlayers = () => {
    const sorted = [...players];
    
    switch (sortType) {
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = `${a.summonerName}#${a.tag}`.toLowerCase();
          const nameB = `${b.summonerName}#${b.tag}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'rating-high':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-low':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  // プレイヤーのロールを切り替える関数
  const togglePlayerRole = (playerId, role) => {
    setPlayers(players.map(player => {
      if (player.id === playerId) {
        const hasRole = player.preferredRoles.includes(role);
        const newRoles = hasRole
          ? player.preferredRoles.filter(r => r !== role)
          : [...player.preferredRoles, role];
        return { ...player, preferredRoles: newRoles };
      }
      return player;
    }));
    setResult(null);
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
    setResult(null);
  };
const addPlayer = async () => {
    setAddResults(null);

    if (!currentInput.trim()) {
      return;
    }

    // 改行で分割してプレイヤーリストを作成
    const inputLines = currentInput.split('\n').filter(line => line.trim());
    
    if (inputLines.length === 0) {
      return;
    }

    // 10人を超える場合はチェック
    if (players.length + inputLines.length > 10) {
      setAddResults({
        success: [],
        failed: inputLines.map(line => ({
          input: line,
          error: `登録上限です。現在${players.length}人登録済み。あと${10 - players.length}人まで追加可能です。`
        }))
      });
      return;
    }

    setLoading(true);
    const successList = [];
    const failedList = [];

    for (const line of inputLines) {
      // 不要な文字を削除してクリーンアップ
      let trimmedLine = line.trim()
        .replace(/\u2066/g, '') // ⁦を削除
        .replace(/\u2069/g, '') // ⁩を削除
        .replace(/\s+/g, '')    // 全ての空白（半角・全角）を削除
        .replace(/がロビーに参加しました。$/g, ''); // 語尾の「がロビーに参加しました。」を削除
      
      if (!trimmedLine.includes('#')) {
        failedList.push({
          input: trimmedLine,
          error: 'サモナー名#タグの形式で入力してください(例:Player#JP1)'
        });
        continue;
      }
      // 重複チェック
      const [checkName, checkTag] = trimmedLine.split('#');
      const isDuplicate = players.some(p => 
        p.summonerName.toLowerCase() === checkName.toLowerCase() && 
        p.tag.toLowerCase() === checkTag.toLowerCase()
      );
      
      if (isDuplicate) {
        failedList.push({
          input: trimmedLine,
          error: '既に登録されています'
        });
        continue;
      }

      try {
        const [summonerName, tag] = trimmedLine.split('#');
        
        // 本番環境ではこちらを使用
        const rankData = await fetchRankFromAPI(summonerName, tag);
        
        // テスト用(モックデータ)
        // const rankData = await mockFetchRank(summonerName, tag);
        
        const newPlayer = {
          id: Date.now() + Math.random(), // 同時追加対応
          summonerName,
          tag,
          preferredRoles: [...ROLES], // デフォルトで全ロール選択
          ...rankData
        };

        successList.push({
          input: trimmedLine,
          player: newPlayer
        });

      } catch (error) {
        failedList.push({
          input: trimmedLine,
          error: error.message || 'プレイヤー情報の取得に失敗しました'
        });
      }
    }

    // 成功したプレイヤーを追加
    if (successList.length > 0) {
      setPlayers([...players, ...successList.map(s => s.player)]);
    }

    // 結果を表示
    setAddResults({
      success: successList,
      failed: failedList
    });

    // 失敗したプレイヤーのみ入力欄に残す
    if (failedList.length > 0) {
      setCurrentInput(failedList.map(f => f.input).join('\n'));
    } else {
      setCurrentInput('');
    }

    setLoading(false);
  };
  const createTeams = () => {
    if (players.length !== 10) {
      alert('10人揃ってから実行してください');
      return;
    }

    const teams = divideTeams(players);
    const team1WithRoles = assignRoles(teams.team1);
    const team2WithRoles = assignRoles(teams.team2);
    
    const avgRating1 = team1WithRoles.reduce((s, p) => s + p.rating, 0) / 5;
    const avgRating2 = team2WithRoles.reduce((s, p) => s + p.rating, 0) / 5;
    
    setResult({
      blueTeam: team1WithRoles,
      redTeam: team2WithRoles,
      avgRating1,
      avgRating2,
      diff: Math.abs(avgRating1 - avgRating2)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4" style={{
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(10, 132, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(200, 170, 110, 0.1) 0%, transparent 50%)'
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3" style={{
            background: 'linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <Users className="w-10 h-10" style={{ color: '#C89B3C' }} />
            LoL カスタムチーム分けシステム
          </h1>
          <p className="text-blue-300">公平なチーム分けとロール配分</p>
        </div>
        {players.length < 10 && (
          <div className="rounded-lg p-6 mb-6 border-2" style={{
            background: 'linear-gradient(135deg, rgba(1, 10, 19, 0.9) 0%, rgba(0, 9, 19, 0.95) 100%)',
            borderColor: '#0A1428',
            boxShadow: '0 0 30px rgba(10, 132, 255, 0.3), inset 0 0 30px rgba(10, 132, 255, 0.05)'
          }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#C89B3C' }}>プレイヤー追加</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-semibold mb-2 block" style={{ color: '#C89B3C' }}>
                  サモナー名#タグ (複数行で一括追加可能)
                </label>
                <textarea
                  placeholder="例:&#10;Player1#JP1&#10;Player2#JP1&#10;Player3#JP1"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 rounded text-white placeholder-white/50 border-2 border-blue-500/50 focus:border-blue-400 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(1, 10, 19, 0.6)',
                    boxShadow: '0 0 10px rgba(10, 132, 255, 0.2)'
                  }}
                />
                <p className="mt-2 text-sm text-blue-300">
                  💡 改行区切りで複数のプレイヤーを一括追加できます。やりたいロールは登録後に選択できます。
                </p>
              </div>

              {addResults && (
                <div className="space-y-3">
                  {addResults.success.length > 0 && (
                    <div className="rounded-lg p-4 border-2 border-green-500/50" style={{
                      background: 'rgba(34, 197, 94, 0.1)'
                    }}>
                      <h3 className="font-bold text-green-400 mb-2">✅ 追加成功 ({addResults.success.length}人)</h3>
                      <div className="space-y-1">
                        {addResults.success.map((item, idx) => (
                          <div key={idx} className="text-sm text-green-300">
                            • {item.input}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {addResults.failed.length > 0 && (
                    <div className="rounded-lg p-4 border-2 border-red-500/50" style={{
                      background: 'rgba(239, 68, 68, 0.1)'
                    }}>
                      <h3 className="font-bold text-red-400 mb-2">❌ 追加失敗 ({addResults.failed.length}人)</h3>
                      <div className="space-y-2">
                        {addResults.failed.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="text-red-300">• {item.input}</div>
                            <div className="text-red-400 ml-4 text-xs">→ {item.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={addPlayer}
                disabled={loading || !currentInput.trim()}
                className="w-full px-6 py-3 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 relative"
                style={{
                  background: (loading || !currentInput.trim()) ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                  border: '2px solid #0A84FF',
                  boxShadow: (loading || !currentInput.trim()) ? '' : '0 0 20px rgba(10, 132, 255, 0.5)'
                }}
              >
                {loading && (
                  <>
                    <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </>
                )}
                {loading ? '取得中...' : '追加'}
              </button>
            </div>
          </div>
        )}
        {players.length > 0 && (
          <div className="rounded-lg p-6 mb-6 border-2" style={{
            background: 'linear-gradient(135deg, rgba(1, 10, 19, 0.9) 0%, rgba(0, 9, 19, 0.95) 100%)',
            borderColor: '#0A1428',
            boxShadow: '0 0 30px rgba(10, 132, 255, 0.3), inset 0 0 30px rgba(10, 132, 255, 0.05)'
          }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#C89B3C' }}>登録プレイヤー ({players.length}/10)</h2>
            <div className="space-y-2">
              {players.map(player => (
                <div key={player.id} className="rounded p-3 flex items-center justify-between" style={{
                  background: 'rgba(10, 132, 255, 0.05)',
                  border: '1px solid rgba(10, 132, 255, 0.2)'
                }}>
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
  {/* プロフィールアイコン */}
  <img 
    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profileIcon || 29}.png`}
    alt="Profile Icon"
    className="w-12 h-12 rounded-full border-2 flex-shrink-0"
    style={{ borderColor: '#0A84FF' }}
    onError={(e) => {
      e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png';
    }}
  />
  <span className="text-white font-semibold w-[180px] truncate block flex-shrink-0">
    {player.summonerName}#{player.tag}
  </span>
  <span className="font-bold w-[140px] flex-shrink-0" style={{ color: '#C89B3C' }}>
    {player.tier} {player.rank}
  </span>
  <span className="w-[120px] flex-shrink-0" style={{ color: '#0A84FF' }}>
    Rating: {player.rating}
  </span>
                    <div className="flex gap-1">
                      {ROLES.map(role => {
                        const isSelected = player.preferredRoles.includes(role);
                        return (
                          <button
                            key={role}
                            onClick={() => togglePlayerRole(player.id, role)}
                            className="px-2 py-1 rounded text-sm flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                            style={{
                              background: isSelected ? 'rgba(10, 132, 255, 0.8)' : 'rgba(50, 50, 50, 0.4)',
                              color: isSelected ? '#fff' : 'rgba(150, 150, 150, 0.8)',
                              border: isSelected ? '1px solid rgba(10, 132, 255, 0.8)' : '1px solid rgba(100, 100, 100, 0.3)'
                            }}
                          >
                            <RoleIcon role={role} size={14} />
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={createTeams}
              disabled={players.length !== 10}
              className="mt-4 w-full px-6 py-3 text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: players.length === 10
                  ? 'linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)'
                  : 'rgba(100, 100, 100, 0.3)',
                border: players.length === 10 ? '2px solid #C89B3C' : '2px solid rgba(100, 100, 100, 0.5)',
                boxShadow: players.length === 10 ? '0 0 30px rgba(200, 155, 60, 0.5)' : '',
                color: players.length === 10 ? '#0A1428' : '#666'
              }}
            >
              <Shuffle className="w-6 h-6" />
              チーム分け実行 {players.length !== 10 && `(${10 - players.length}人不足)`}
            </button>
          </div>
        )}

        {result && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2" style={{
              background: 'linear-gradient(135deg, rgba(1, 10, 19, 0.98) 0%, rgba(0, 9, 19, 0.98) 100%)',
              borderColor: '#C89B3C',
              boxShadow: '0 0 50px rgba(200, 155, 60, 0.5)'
            }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold" style={{
                  background: 'linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>チーム分け結果</h2>
                <button
                  onClick={() => setResult(null)}
                  className="text-white/70 hover:text-white text-2xl px-4"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="rounded-lg p-6 border-2" style={{
                  background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(10, 132, 255, 0.05) 100%)',
                  borderColor: '#0A84FF',
                  boxShadow: '0 0 30px rgba(10, 132, 255, 0.3)'
                }}>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#0A84FF' }}>ブルーチーム</h3>
                  <p className="text-white mb-4 text-sm">平均Rating: {result.avgRating1.toFixed(0)}</p>
                  <div className="space-y-3">
                    {result.blueTeam.map(player => (
                      <div key={player.id} className="rounded-lg p-4" style={{
                        background: 'rgba(10, 132, 255, 0.1)',
                        border: '1px solid rgba(10, 132, 255, 0.3)'
                      }}>
                        <div className="flex items-start gap-3">
                          <div style={{ color: '#0A84FF' }}>
                            <RoleIcon role={player.assignedRole} size={32} />
                          </div>
                          <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                    <img 
                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profileIcon || 29}.png`}
                      alt="Profile Icon"
                      className="w-12 h-12 rounded-full border-2"
                      style={{ borderColor: '#0A84FF' }}
                      onError={(e) => {
                        // 画像読み込みエラー時のフォールバック
                        e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png';
                      }}
                    />
                            <span className="text-white font-semibold text-xs text-center break-all w-full">{player.summonerName}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">
                              <span className="font-bold text-lg block" style={{ color: '#5DADE2' }}>{player.assignedRole}</span>
                            </div>
                            <div className="text-sm text-gray-300">
                              <div className="truncate">{player.tier} {player.rank}</div>
                              <div>Rating: {player.rating}</div>
                            </div>
                            <div className="flex gap-1 flex-wrap mt-2">
                              {player.preferredRoles.map(role => (
                                <span 
                                  key={role} 
                                  className="px-2 py-0.5 rounded text-xs flex items-center gap-1"
                                  style={{
                                    background: role === player.assignedRole ? '#0A84FF' : 'rgba(100, 100, 100, 0.3)',
                                    color: role === player.assignedRole ? '#fff' : '#aaa'
                                  }}
                                >
                                  <RoleIcon role={role} size={12} />
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg p-6 border-2" style={{
                  background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
                  borderColor: '#DC3545',
                  boxShadow: '0 0 30px rgba(220, 53, 69, 0.3)'
                }}>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#DC3545' }}>レッドチーム</h3>
                  <p className="text-white mb-4 text-sm">平均Rating: {result.avgRating2.toFixed(0)}</p>
                  <div className="space-y-3">
                    {result.redTeam.map(player => (
                      <div key={player.id} className="rounded-lg p-4" style={{
                        background: 'rgba(220, 53, 69, 0.1)',
                        border: '1px solid rgba(220, 53, 69, 0.3)'
                      }}>
                        <div className="flex items-start gap-3">
                          <div style={{ color: '#DC3545' }}>
                          <RoleIcon role={player.assignedRole} size={32} />
                          </div>
                          <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">

                                                <img 
                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profileIcon || 29}.png`}
                      alt="Profile Icon"
                      className="w-12 h-12 rounded-full border-2"
                      style={{ border: '2px solid #DC3545' }}
                      onError={(e) => {
                        // 画像読み込みエラー時のフォールバック
                        e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png';
                      }}
                    />
                            <span className="text-white font-semibold text-xs text-center break-all w-full">{player.summonerName}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">
                              <span className="font-bold text-lg block" style={{ color: '#FF6B7A' }}>{player.assignedRole}</span>
                            </div>
                            <div className="text-sm text-gray-300">
                              <div className="truncate">{player.tier} {player.rank}</div>
                              <div>Rating: {player.rating}</div>
                            </div>
                            <div className="flex gap-1 flex-wrap mt-2">
                              {player.preferredRoles.map(role => (
                                <span 
                                  key={role} 
                                  className="px-2 py-0.5 rounded text-xs flex items-center gap-1"
                                  style={{
                                    background: role === player.assignedRole ? '#DC3545' : 'rgba(100, 100, 100, 0.3)',
                                    color: role === player.assignedRole ? '#fff' : '#aaa'
                                  }}
                                >
                                  <RoleIcon role={role} size={12} />
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center rounded-lg p-4 border-2" style={{
                background: 'rgba(200, 155, 60, 0.1)',
                borderColor: '#C89B3C'
              }}>
                <p className="text-white text-lg">
                  レート差: <span className="font-bold" style={{ color: '#C89B3C' }}>{result.diff.toFixed(0)}</span>
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}