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

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

type Payload struct {
	MarketID string  `json:"marketid"`
	UserID   string  `json:"userid"`
	Yes      bool    `json:"yes"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
	Type     string  `json:"type"`
}

type Message struct {
	Payload   Payload `json:"payload"`
	Signature string  `json:"signature"`
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

		if verifySignature(received.Payload.MarketID+received.Payload.UserID, received.Signature, redisSecret) {
			log.Println("Verified message:", received.Payload)

			if received.Payload.Type == "place:limit:order" {
				fmt.Println(received.Payload.MarketID, received.Payload.UserID, received.Payload.Price, received.Payload.Quantity)

				Obmu.Lock()
				ob, exists := orderbooks[received.Payload.MarketID]
				Obmu.Unlock()

				if !exists {
					if err := rdb.Publish(ctx, "ch2:ws->http", "invalid market id").Err(); err != nil {
						fmt.Println(err)
					}
					continue
				}

				fmt.Println(ob.MarketID)

				uuid, err := uuid.NewUUID()
				if err != nil {
					fmt.Println(err)
				}

				order := LimitOrder{
					ID:       uuid.String(),
					MarketID: received.Payload.MarketID,
					UserID:   received.Payload.UserID,
					Yes:      received.Payload.Yes,
					Quantity: received.Payload.Quantity,
					Price:    received.Payload.Price,
				}

				trades := PlaceOrder(order)

				submu.Lock()
				conns := subscribers[received.Payload.MarketID]
				submu.Unlock()

				response := map[string]any{
					"type":      "placeorder",
					"success":   true,
					"alltrades": GetAllTrades(),
				}

				for _, conn := range conns {
					if err := conn.WriteJSON(response); err != nil {
						fmt.Println(err)
					}
				}

				fmt.Println("sending data...")
				dataToSend := map[string]any{
					"marketid": received.Payload.MarketID,
					"trades":   trades,
				}

				data, err := json.Marshal(dataToSend)
				if err != nil {
					fmt.Println("Failed to marshal data:", err)
					return
				}

				if err := rdb.Publish(ctx, "ch2:ws->http", data).Err(); err != nil {
					fmt.Println("Failed to publish trades:", err)
				}

			}

		} else {
			log.Println("Invalid signature")
		}
	}
}
