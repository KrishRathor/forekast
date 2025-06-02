package orderbook

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

type Message struct {
	Payload   string `json:"payload"`
	Signature string `json:"signature"`
}

func verifySignature(payload, signature, sharedSecret string) bool {
	h := hmac.New(sha256.New, []byte(sharedSecret))
	h.Write([]byte(payload))
	expectedSig := hex.EncodeToString(h.Sum(nil))
	return hmac.Equal([]byte(expectedSig), []byte(signature))
}

func Subscribe() {

	fmt.Println("inside subs")

	if err := godotenv.Load(); err != nil {
		fmt.Println("can't load env file")
	}

	redisSecret := os.Getenv("REDIS_SECRET")
	fmt.Println(redisSecret)
	if redisSecret == "" {
		fmt.Println("no redis secret found")
		return
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	fmt.Println(redisAddr)
	if redisAddr == "" {
		fmt.Println("no redis addr found")
		return
	}

	redisChannel := os.Getenv("REDIS_CHANNEL")
	fmt.Println(redisChannel)
	if redisAddr == "" {
		fmt.Println("no redis chnl found")
		return
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	sub := rdb.Subscribe(ctx, redisChannel)
	ch := sub.Channel()

	log.Println("Subscribed to channel:", redisChannel)

	for msg := range ch {
		var received Message
		if err := json.Unmarshal([]byte(msg.Payload), &received); err != nil {
			log.Println("Invalid message format")
			continue
		}

		if verifySignature(received.Payload, received.Signature, redisSecret) {
			log.Println("Verified message:", received.Payload)

			var parsedPayload map[string]any
			if err := json.Unmarshal([]byte(received.Payload), &parsedPayload); err != nil {
				log.Fatal(err)
			}

			fmt.Println("Payload Type:", parsedPayload["type"])
			fmt.Println("Payload Data:", parsedPayload["data"])

		} else {
			log.Println("Invalid signature")
		}
	}
}
