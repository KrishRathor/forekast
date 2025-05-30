package models

import (
	"errors"
	"fmt"
	"time"
)

type Market struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Question  string    `gorm:"not null"`
	Expiry    time.Time `gorm:"not null"`
	isActive  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

func CreateNewMarket(question string, expiry time.Time) error {
	db := ConnectDB()
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("db connection error: %w", err)
	}
	defer sqlDB.Close()

	if time.Now().After(expiry) {
		return errors.New("expiry time has also passed")
	}

	tx := db.Create(&Market{Question: question, Expiry: expiry, isActive: true})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func GetMarketByID(id string) (Market, error) {
	db := ConnectDB()
	sqlDB, err := db.DB()
	if err != nil {
		fmt.Println("db connection error: %w", err)
	}
	defer sqlDB.Close()

	var market Market
	tx := db.First(&market, id)
	return market, tx.Error
}

func GetLiveMarkets() ([]Market, error) {
	db := ConnectDB()
	sqlDB, err := db.DB()
	if err != nil {
		fmt.Println("db connection error: %w", err)
	}
	defer sqlDB.Close()

	var markets []Market
	tx := db.Where("expiry > ?", time.Now()).Find(&markets)
	return markets, tx.Error
}

