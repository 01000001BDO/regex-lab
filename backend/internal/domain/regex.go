package domain

import (
	"crypto/md5"
	"fmt"
	"time"
)

type RegexShare struct {
	ID         string    `json:"id"`
	Pattern    string    `json:"pattern"`
	TestString string    `json:"testString"`
	CreatedAt  time.Time `json:"createdAt"`
	ExpiresAt  time.Time `json:"expiresAt"`
}

func NewRegexShare(pattern, testString string) *RegexShare {
	now := time.Now()
	return &RegexShare{
		ID:         generateUniqueID(),
		Pattern:    pattern,
		TestString: testString,
		CreatedAt:  now,
		ExpiresAt:  now.Add(24 * time.Hour),
	}
}

func generateUniqueID() string {
	return fmt.Sprintf("%x", md5.Sum([]byte(time.Now().String())))[:8]
}

func (r *RegexShare) IsExpired() bool {
	return time.Now().After(r.ExpiresAt)
}