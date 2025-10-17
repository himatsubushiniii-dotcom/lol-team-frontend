package main

import (
	"encoding/json"
	"fmt"
	"log"
	"lol-team-backend/riotapi"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

type RankRequest struct {
	GameName string `json:"gameName"`
	TagLine  string `json:"tagLine"`
}

type RankResponse struct {
	Tier        string `json:"tier"`
	Rank        string `json:"rank"`
	LP          int    `json:"lp"`
	Rating      int    `json:"rating"`
	ProfileIcon int    `json:"profileIcon"`
}

type RoleMMRRequest struct {
	PUUID      string `json:"puuid"`
	Role       string `json:"role"`
	MatchCount int    `json:"matchCount"`
}

func main() {
	// .envファイルを読み込む（存在しない場合はスキップ）
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// 環境変数からAPIキーを取得
	apiKey := os.Getenv("RIOT_API_KEY")
	if apiKey == "" {
		log.Fatal("ERROR: RIOT_API_KEY environment variable is not set")
	}

	log.Printf("INFO: Server starting with API key: %s...\n", apiKey[:10]+"***")

	// APIキーをグローバル変数に設定（後で使用するため）
	riotAPIKey = apiKey
	// グローバルクライアントを初期化（キャッシュとレート制限を共有）
	globalClient = riotapi.NewClient(apiKey, "jp1", "asia")

	// 環境変数から許可するオリジンを取得
	allowedOrigins := getAllowedOrigins()
	http.HandleFunc("/api/rank", corsMiddleware(getRankHandler, allowedOrigins))
	http.HandleFunc("/api/role-mmr", corsMiddleware(getRoleMMRHandler, allowedOrigins))
	http.HandleFunc("/api/rate-limit-stats", corsMiddleware(getRateLimitStatsHandler, allowedOrigins))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on :%s...\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}

// 許可するオリジンを取得
func getAllowedOrigins() []string {
	originsEnv := os.Getenv("ALLOWED_ORIGINS")
	if originsEnv == "" {
		// デフォルト値（開発環境用）
		return []string{"http://localhost:5173", "http://localhost:3000"}
	}
	// カンマ区切りで複数指定可能
	return strings.Split(originsEnv, ",")
}

// CORS設定を修正
func corsMiddleware(next http.HandlerFunc, allowedOrigins []string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// オリジンが許可リストに含まれているかチェック
		if isOriginAllowed(origin, allowedOrigins) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// 本番の場合下記をコメントアウトを解除する
// func corsMiddleware(next http.HandlerFunc, allowedOrigins []string) http.HandlerFunc {
//     return func(w http.ResponseWriter, r *http.Request) {
//         origin := r.Header.Get("Origin")

//         // オリジンが空の場合は拒否（直接APIを叩いている可能性）
//         if origin == "" {
//             http.Error(w, "Origin header required", http.StatusForbidden)
//             return
//         }

//         // 許可リストチェック
//         if !isOriginAllowed(origin, allowedOrigins) {
//             http.Error(w, "Origin not allowed", http.StatusForbidden)
//             return
//         }

//         w.Header().Set("Access-Control-Allow-Origin", origin)
//         w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
//         w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//         w.Header().Set("Access-Control-Max-Age", "3600") // プリフライトキャッシュ

//         if r.Method == "OPTIONS" {
//             w.WriteHeader(http.StatusOK)
//             return
//         }

//         next(w, r)
//     }
// }

// オリジンが許可されているかチェック
func isOriginAllowed(origin string, allowedOrigins []string) bool {
	for _, allowed := range allowedOrigins {
		if origin == allowed {
			return true
		}
	}
	return false
}

// グローバル変数としてAPIキーを保持
var (
	riotAPIKey   string
	globalClient *riotapi.Client
	clientMutex  sync.Mutex
)

// getRankHandler を修正（既存の関数を置き換え）
func getRankHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RankRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("ERROR: Invalid request body: %v\n", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	fmt.Printf("INFO: Received request - GameName: %s, TagLine: %s\n", req.GameName, req.TagLine)

	regions := []string{"jp1", "kr", "na1", "euw1", "eun1", "br1", "la1", "la2", "oc1", "tr1", "ru"}
	continents := map[string]string{
		"jp1":  "asia",
		"kr":   "asia",
		"na1":  "americas",
		"br1":  "americas",
		"la1":  "americas",
		"la2":  "americas",
		"euw1": "europe",
		"eun1": "europe",
		"tr1":  "europe",
		"ru":   "europe",
		"oc1":  "sea",
	}

	var rankInfo *RankResponse
	var lastError error
	var summonerInfo *riotapi.Summoner

	for _, region := range regions {
		continent := continents[region]
		fmt.Printf("INFO: Trying region %s (continent: %s)\n", region, continent)

		// グローバルクライアントを使用（キャッシュとレート制限を共有）⬅️ 修正
		clientMutex.Lock()
		globalClient.RegionalURL = fmt.Sprintf("https://%s.api.riotgames.com", region)
		globalClient.GlobalURL = fmt.Sprintf("https://%s.api.riotgames.com", continent)
		client := globalClient
		clientMutex.Unlock()

		account, err := client.GetAccountByRiotID(req.GameName, req.TagLine)
		if err != nil {
			fmt.Printf("INFO: Account not found in continent %s: %v\n", continent, err)
			lastError = err
			continue
		}

		fmt.Printf("INFO: Account found - PUUID: %s\n", account.PUUID)

		summoner, err := client.GetSummonerByPUUID(account.PUUID)
		if err != nil {
			fmt.Printf("INFO: Summoner info not found in region %s: %v\n", region, err)
			lastError = err
			continue
		}

		summonerInfo = summoner
		fmt.Printf("INFO: Summoner found - ProfileIconID: %d\n", summoner.ProfileIconID)

		entries, err := client.GetLeagueEntriesByPUUID(account.PUUID)
		if err != nil {
			fmt.Printf("INFO: League entries not found in region %s: %v\n", region, err)
			lastError = err
			continue
		}

		fmt.Printf("INFO: Found %d league entries in region %s\n", len(entries), region)

		var bestEntry *riotapi.LeagueEntry
		for i := range entries {
			entry := &entries[i]
			if entry.QueueType == "RANKED_SOLO_5x5" {
				bestEntry = entry
				break
			}
		}

		if bestEntry == nil && len(entries) > 0 {
			bestEntry = &entries[0]
		}

		if bestEntry == nil {
			rankInfo = &RankResponse{
				Tier:        "UNRANKED",
				Rank:        "",
				LP:          0,
				Rating:      0,
				ProfileIcon: summonerInfo.ProfileIconID,
			}
		} else {
			rating := tierToRating(bestEntry.Tier, bestEntry.Rank, bestEntry.LeaguePoints)
			rankInfo = &RankResponse{
				Tier:        bestEntry.Tier,
				Rank:        bestEntry.Rank,
				LP:          bestEntry.LeaguePoints,
				Rating:      rating,
				ProfileIcon: summonerInfo.ProfileIconID,
			}
		}

		break
	}

	if rankInfo == nil {
		fmt.Printf("ERROR: Failed to get rank from all regions: %v\n", lastError)
		http.Error(w, fmt.Sprintf("Failed to get player information: %v", lastError), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rankInfo)
}

// レート制限状態を確認するエンドポイントを追加
func getRateLimitStatsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	clientMutex.Lock()
	stats := globalClient.RateLimiter.GetStats()
	clientMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func getRoleMMRHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RoleMMRRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("ERROR: Invalid request body: %v\n", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	fmt.Printf("INFO: Received role MMR request - PUUID: %s, Role: %s, MatchCount: %d\n",
		req.PUUID, req.Role, req.MatchCount)

	validRoles := map[string]bool{
		"TOP": true, "JUNGLE": true, "MID": true, "ADC": true, "SUPPORT": true,
	}
	if !validRoles[req.Role] {
		fmt.Printf("ERROR: Invalid role: %s\n", req.Role)
		http.Error(w, "Invalid role. Must be one of: TOP, JUNGLE, MID, ADC, SUPPORT", http.StatusBadRequest)
		return
	}

	if req.MatchCount <= 0 {
		req.MatchCount = 20
	}

	regions := []string{"jp1", "kr", "na1", "euw1", "eun1", "br1", "la1", "la2", "oc1", "tr1", "ru"}
	continents := map[string]string{
		"jp1":  "asia",
		"kr":   "asia",
		"na1":  "americas",
		"br1":  "americas",
		"la1":  "americas",
		"la2":  "americas",
		"euw1": "europe",
		"eun1": "europe",
		"tr1":  "europe",
		"ru":   "europe",
		"oc1":  "sea",
	}

	var mmrResult *riotapi.RoleMMRResult
	var lastError error

	for _, region := range regions {
		continent := continents[region]
		fmt.Printf("INFO: Trying region %s (continent: %s) for role MMR\n", region, continent)

		client := riotapi.NewClient(riotAPIKey, region, continent)

		result, err := client.GetRoleMMR(req.PUUID, req.Role, req.MatchCount)
		if err != nil {
			fmt.Printf("INFO: Failed to get role MMR in region %s: %v\n", region, err)
			lastError = err
			continue
		}

		if result.GamesPlayed > 0 {
			mmrResult = result
			fmt.Printf("INFO: Successfully retrieved role MMR from region %s: MMR=%d, Games=%d\n",
				region, result.MMR, result.GamesPlayed)
			break
		}

		if mmrResult == nil {
			mmrResult = result
		}
	}

	if mmrResult == nil {
		fmt.Printf("ERROR: Failed to get role MMR from all regions: %v\n", lastError)
		http.Error(w, fmt.Sprintf("Failed to get role MMR: %v", lastError), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mmrResult)
}

func tierToRating(tier, rank string, lp int) int {
	tierValues := map[string]int{
		"IRON":        0,
		"BRONZE":      400,
		"SILVER":      800,
		"GOLD":        1200,
		"PLATINUM":    1600,
		"EMERALD":     2000,
		"DIAMOND":     2400,
		"MASTER":      2800,
		"GRANDMASTER": 3200,
		"CHALLENGER":  3600,
	}

	rankValues := map[string]int{
		"IV":  0,
		"III": 100,
		"II":  200,
		"I":   300,
	}

	tierVal := tierValues[tier]
	rankVal := rankValues[rank]

	return tierVal + rankVal + lp
}
