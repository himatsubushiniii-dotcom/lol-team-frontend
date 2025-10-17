package riotapi

import (
	"fmt"
	"sync"
	"time"
)

// RateLimiter はRiot APIのレート制限を管理
type RateLimiter struct {
	mu sync.Mutex

	// 短期制限（20リクエスト/秒）
	shortRequests []time.Time
	shortLimit    int
	shortWindow   time.Duration

	// 長期制限（100リクエスト/2分）
	longRequests []time.Time
	longLimit    int
	longWindow   time.Duration
}

// NewRateLimiter は新しいレート制限マネージャーを作成
func NewRateLimiter() *RateLimiter {
	return &RateLimiter{
		shortRequests: make([]time.Time, 0),
		shortLimit:    20,
		shortWindow:   1 * time.Second,

		longRequests: make([]time.Time, 0),
		longLimit:    100,
		longWindow:   2 * time.Minute,
	}
}

// Wait はレート制限に達していれば待機
func (rl *RateLimiter) Wait() error {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()

	// 古いリクエストを削除
	rl.cleanupOldRequests(now)

	// 短期制限チェック
	if len(rl.shortRequests) >= rl.shortLimit {
		oldestShort := rl.shortRequests[0]
		waitDuration := rl.shortWindow - now.Sub(oldestShort)
		if waitDuration > 0 {
			fmt.Printf("INFO: Rate limit reached (short), waiting %v\n", waitDuration)
			time.Sleep(waitDuration)
			rl.cleanupOldRequests(time.Now())
		}
	}

	// 長期制限チェック
	if len(rl.longRequests) >= rl.longLimit {
		oldestLong := rl.longRequests[0]
		waitDuration := rl.longWindow - now.Sub(oldestLong)
		if waitDuration > 0 {
			fmt.Printf("INFO: Rate limit reached (long), waiting %v\n", waitDuration)
			time.Sleep(waitDuration)
			rl.cleanupOldRequests(time.Now())
		}
	}

	// リクエストを記録
	now = time.Now()
	rl.shortRequests = append(rl.shortRequests, now)
	rl.longRequests = append(rl.longRequests, now)

	return nil
}

// cleanupOldRequests は古いリクエスト記録を削除
func (rl *RateLimiter) cleanupOldRequests(now time.Time) {
	// 短期ウィンドウ外のリクエストを削除
	shortCutoff := now.Add(-rl.shortWindow)
	newShort := make([]time.Time, 0)
	for _, t := range rl.shortRequests {
		if t.After(shortCutoff) {
			newShort = append(newShort, t)
		}
	}
	rl.shortRequests = newShort

	// 長期ウィンドウ外のリクエストを削除
	longCutoff := now.Add(-rl.longWindow)
	newLong := make([]time.Time, 0)
	for _, t := range rl.longRequests {
		if t.After(longCutoff) {
			newLong = append(newLong, t)
		}
	}
	rl.longRequests = newLong
}

// GetStats は現在のレート制限状態を返す
func (rl *RateLimiter) GetStats() map[string]interface{} {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	rl.cleanupOldRequests(now)

	return map[string]interface{}{
		"short_remaining": rl.shortLimit - len(rl.shortRequests),
		"short_total":     rl.shortLimit,
		"long_remaining":  rl.longLimit - len(rl.longRequests),
		"long_total":      rl.longLimit,
	}
}
