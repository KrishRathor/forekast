package redis

import (
	"backend/internal/models"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Trade struct {
	YesBuyer  string
	NoBuyer   string
	YesPrice  float64
	Quantity  int
	Timestamp time.Time
}

type TradesMessage struct {
	MarketID string  `json:"marketid"`
	Trades   []Trade `json:"trades"`
}

func Subscribe() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		log.Fatal("REDIS_ADDR not set")
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	channel := "ch2:ws->http"
	sub := rdb.Subscribe(ctx, channel)
	ch := sub.Channel()

	fmt.Println("Subscribed to channel:", channel)

	for msg := range ch {
		fmt.Println("Received message:", msg.Payload)

		var msgWrapper TradesMessage
		if err := json.Unmarshal([]byte(msg.Payload), &msgWrapper); err != nil {
			log.Println("Failed to parse trades message:", err)
			continue
		}

		fmt.Println("Parsed market ID:", msgWrapper.MarketID)
		fmt.Println("Parsed trades:", msgWrapper.Trades)

		for _, trade := range msgWrapper.Trades {
			go ProcessTrade(trade, msgWrapper.MarketID)
		}

	}
}

func ProcessTrade(trade Trade, market_id string) {
	db := models.ConnectDB()
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	err := db.Transaction(func(tx *gorm.DB) error {
		yesAmount := trade.YesPrice * float64(trade.Quantity)
		noAmount := (100 - trade.YesPrice) * float64(trade.Quantity)

		if err := models.GetMoneyFromWallet(trade.YesBuyer, yesAmount); err != nil {
			return err
		}
		if err := models.GetMoneyFromWallet(trade.NoBuyer, noAmount); err != nil {
			return err
		}

		if err := tx.Where("user_id = ? AND market_id = ?", trade.YesBuyer, market_id).Delete(&models.Reserve{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ? AND market_id = ?", trade.NoBuyer, market_id).Delete(&models.Reserve{}).Error; err != nil {
			return err
		}

		newTrade := models.Trade{
			User1ID:  trade.YesBuyer,
			User2ID:  trade.NoBuyer,
			Price:    trade.YesPrice,
			Quantity: float64(trade.Quantity),
		}
		if err := tx.Create(&newTrade).Error; err != nil {
			return err
		}

		txn1 := models.Transaction{
			UserID:  trade.YesBuyer,
			TradeID: newTrade.ID,
			Amount:  -yesAmount,
		}
		txn2 := models.Transaction{
			UserID:  trade.NoBuyer,
			TradeID: newTrade.ID,
			Amount:  -noAmount,
		}

		if err := tx.Create(&txn1).Error; err != nil {
			return err
		}
		if err := tx.Create(&txn2).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		log.Println("Trade processing failed:", err)
	} else {
		log.Println("Trade processed for:", trade.YesBuyer, "and", trade.NoBuyer)
	}
}
