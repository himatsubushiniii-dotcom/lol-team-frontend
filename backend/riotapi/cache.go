package riotapi

import (
	"encoding/json"
	"sync"
	"time"
)

// CacheItem はキャッシュされたデータとその有効期限を保持
type CacheItem struct {
	Data      interface{}
	ExpiresAt time.Time
}

// Cache はインメモリキャッシュ
type Cache struct {
	mu    sync.RWMutex
	items map[string]CacheItem
}

// NewCache は新しいキャッシュインスタンスを作成
func NewCache() *Cache {
	cache := &Cache{
		items: make(map[string]CacheItem),
	}

	// 定期的に期限切れアイテムをクリーンアップ
	go cache.cleanupExpired()

	return cache
}

// Get はキャッシュからデータを取得
func (c *Cache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, exists := c.items[key]
	if !exists {
		return nil, false
	}

	// 有効期限チェック
	if time.Now().After(item.ExpiresAt) {
		return nil, false
	}

	return item.Data, true
}

// Set はキャッシュにデータを保存
func (c *Cache) Set(key string, data interface{}, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = CacheItem{
		Data:      data,
		ExpiresAt: time.Now().Add(ttl),
	}
}

// Delete はキャッシュからデータを削除
func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
}

// cleanupExpired は期限切れのアイテムを定期的に削除
func (c *Cache) cleanupExpired() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for key, item := range c.items {
			if now.After(item.ExpiresAt) {
				delete(c.items, key)
			}
		}
		c.mu.Unlock()
	}
}

// GetOrFetch はキャッシュから取得するか、なければfetcherを実行してキャッシュ
func (c *Cache) GetOrFetch(key string, ttl time.Duration, fetcher func() (interface{}, error)) (interface{}, error) {
	// まずキャッシュを確認
	if data, exists := c.Get(key); exists {
		return data, nil
	}

	// キャッシュになければ取得
	data, err := fetcher()
	if err != nil {
		return nil, err
	}

	// 成功したらキャッシュに保存
	c.Set(key, data, ttl)

	return data, nil
}

// MarshalCacheData はキャッシュデータを指定の型にマッピング
func MarshalCacheData(data interface{}, target interface{}) error {
	// JSON経由で型変換（より安全な方法）
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	return json.Unmarshal(jsonData, target)
}
