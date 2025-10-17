package riotapi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client is the main Riot API client
type Client struct {
	APIKey      string
	HTTPClient  *http.Client
	RegionalURL string
	GlobalURL   string
	Cache       *Cache
	RateLimiter *RateLimiter
}

// APIError represents an error response from the Riot API
type APIError struct {
	Status struct {
		Message    string `json:"message"`
		StatusCode int    `json:"status_code"`
	} `json:"status"`
}

func (e *APIError) Error() string {
	return fmt.Sprintf("Riot API Error %d: %s", e.Status.StatusCode, e.Status.Message)
}

// NewClient creates a new Riot API client
// region: Regional routing value (e.g., "jp1", "na1", "euw1")
// continent: Continental routing value (e.g., "asia", "americas", "europe")
func NewClient(apiKey string, region string, continent string) *Client {
	return &Client{
		APIKey: apiKey,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		RegionalURL: fmt.Sprintf("https://%s.api.riotgames.com", region),
		GlobalURL:   fmt.Sprintf("https://%s.api.riotgames.com", continent),
		Cache:       NewCache(),
		RateLimiter: NewRateLimiter(),
	}
}

// makeRequest performs an HTTP GET request to the Riot API
// endpoint: The API endpoint path
// target: Pointer to struct where response will be decoded
// useGlobal: If true, uses GlobalURL; otherwise uses RegionalURL
func (c *Client) makeRequest(endpoint string, target interface{}, useGlobal bool) error {
	var baseURL string
	if useGlobal {
		baseURL = c.GlobalURL
	} else {
		baseURL = c.RegionalURL
	}

	url := baseURL + endpoint

	// キャッシュキーを生成
	cacheKey := url

	// キャッシュから取得を試みる
	if cached, exists := c.Cache.Get(cacheKey); exists {
		return MarshalCacheData(cached, target)
	}

	// レート制限を確認して待機
	if err := c.RateLimiter.Wait(); err != nil {
		return fmt.Errorf("rate limiter error: %w", err)
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("X-Riot-Token", c.APIKey)
	req.Header.Set("Accept", "application/json")

	// リトライロジック追加
	maxRetries := 3
	var resp *http.Response
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		resp, lastErr = c.HTTPClient.Do(req)

		if lastErr == nil && resp.StatusCode == 429 {
			// レート制限エラー - リトライヘッダーを確認
			retryAfter := resp.Header.Get("Retry-After")
			if retryAfter != "" {
				if seconds, err := time.ParseDuration(retryAfter + "s"); err == nil {
					fmt.Printf("INFO: Rate limited by API, waiting %v\n", seconds)
					time.Sleep(seconds)
					continue
				}
			}
			// Retry-Afterがなければ1秒待機
			time.Sleep(time.Second)
			continue
		}

		if lastErr == nil {
			break
		}

		// 他のエラーの場合は短い待機後リトライ
		if i < maxRetries-1 {
			time.Sleep(time.Duration(i+1) * time.Second)
		}
	}

	if lastErr != nil {
		return fmt.Errorf("failed to execute request after %d retries: %w", maxRetries, lastErr)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	// エラーステータスチェック
	if resp.StatusCode >= 400 {
		var apiErr APIError
		if err := json.Unmarshal(body, &apiErr); err != nil {
			return fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
		}
		return &apiErr
	}

	// レスポンスをデコード
	if err := json.Unmarshal(body, target); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	// 成功したらキャッシュに保存（TTLは種類によって変える）
	cacheTTL := c.getCacheTTL(endpoint)
	c.Cache.Set(cacheKey, target, cacheTTL)

	return nil
}

// getCacheTTL はエンドポイントに応じたキャッシュ有効期限を返す
func (c *Client) getCacheTTL(endpoint string) time.Duration {
	// ランク情報: 5分
	if contains(endpoint, "/league/") || contains(endpoint, "/league-exp/") {
		return 5 * time.Minute
	}

	// サモナー情報: 10分
	if contains(endpoint, "/summoner/") {
		return 10 * time.Minute
	}

	// アカウント情報: 30分
	if contains(endpoint, "/account/") {
		return 30 * time.Minute
	}

	// マッチ情報: 1時間（過去のマッチは変わらない）
	if contains(endpoint, "/match/") {
		return 1 * time.Hour
	}

	// その他: 15分
	return 15 * time.Minute
}

// contains は文字列に部分文字列が含まれるかチェック
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		(len(s) > len(substr) &&
			(s[:len(substr)] == substr ||
				s[len(s)-len(substr):] == substr ||
				findSubstring(s, substr))))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
