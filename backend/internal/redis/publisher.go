package redis

import (
	CustomErrors "backend/internal/errors"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

type Message struct {
	Payload   CustomErrors.Payload `json:"payload"`
	Signature string `json:"signature"`
}

func sign(payload, redisSecret string) string {
	h := hmac.New(sha256.New, []byte(redisSecret))
	h.Write([]byte(payload))
	return hex.EncodeToString(h.Sum(nil))
}

func Publish(payload CustomErrors.Payload) error {
	if err := godotenv.Load(); err != nil {
		fmt.Println("can't load env file")
	}

	redisSecret := os.Getenv("REDIS_SECRET")
	if redisSecret == "" {
		return fmt.Errorf("no redis secret found")
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		return fmt.Errorf("no redis addr found")
	}

	redisChannel := os.Getenv("REDIS_CHANNEL")
	if redisChannel == "" {
		return fmt.Errorf("no redis channel found")
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	sig := sign(payload.MarketID + payload.UserID, redisSecret)
	msg := Message{
		Payload:   payload,
		Signature: sig,
	}

	jsonMsg, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	if err := rdb.Publish(ctx, redisChannel, jsonMsg).Err(); err != nil {
		return err
	}

	fmt.Println("message published")
	return nil
}
