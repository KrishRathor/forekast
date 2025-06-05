package models

import (
	CustomErrors "backend/internal/errors"
	"errors"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Wallet struct {
	gorm.Model
	UserID  string `gorm:"uniqueIndex"`
	Balance float64
	Reserve float64
	User    User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}

type Reserve struct {
	gorm.Model
	UserID   string `gorm:"index"`
	MarketID string `gorm:"index"`
	Reserve  float64

	User   User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Market Market `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}

func GetMoneyFromWallet(userId string, balance float64) error {
	db := ConnectDB()

	sqldb, err := db.DB()
	if err != nil {
		fmt.Println("Error creating user: Getting db.DB()")
	}
	defer sqldb.Close()

	return db.Transaction(func(tx *gorm.DB) error {
		var wallet Wallet
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", userId).First(&wallet).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("0 money")
			}
			return err
		}

		if wallet.Reserve < balance {
			return errors.New("insufficient balance")
		} else {
			wallet.Reserve -= balance
			if err := tx.Save(&wallet).Error; err != nil {
				return err
			}
		}

		return nil
	})

}

func AddBalanceToWallet(userID string, balance float64) error {

	db := ConnectDB()

	sqldb, err := db.DB()
	if err != nil {
		fmt.Println("Error creating user: Getting db.DB()")
	}
	defer sqldb.Close()

	return db.Transaction(func(tx *gorm.DB) error {
		var wallet Wallet

		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("user_id = ?", userID).
			First(&wallet).Error

		if errors.Is(err, gorm.ErrRecordNotFound) {
			wallet = Wallet{
				UserID:  userID,
				Balance: balance,
			}
			if err := tx.Create(&wallet).Error; err != nil {
				return err
			}
		} else if err != nil {
			return err
		} else {
			wallet.Balance += balance
			if err := tx.Save(&wallet).Error; err != nil {
				return err
			}
		}

		return nil
	})

}

func ReserveFunds(userId string, marketId string, amount float64) error {
	db := ConnectDB()

	sqldb, err := db.DB()
	if err != nil {
		fmt.Println("Error: Getting db.DB()")
	}
	defer sqldb.Close()

	return db.Transaction(func(tx *gorm.DB) error {
		var wallet Wallet

		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", userId).First(&wallet).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return CustomErrors.ErrWalletNotFound
			}
			return err
		}

		if wallet.Balance < amount {
			return CustomErrors.ErrInsufficientBalance
		}

		wallet.Balance -= amount
		wallet.Reserve += amount

		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		marketReserve := Reserve{
			UserID:   userId,
			MarketID: marketId,
			Reserve:  amount,
		}

		if err := tx.Create(&marketReserve).Error; err != nil {
			return err
		}

		return nil
	})
}

func GetWalletBalanceAndReserve(userID string) (balance float64, reserve float64, err error) {
	db := ConnectDB()
	sqlDB, err := db.DB()
	if err != nil {
		return 0, 0, err
	}
	defer sqlDB.Close()

	var wallet Wallet
	if err := db.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, 0, CustomErrors.ErrWalletNotFound
		}
		return 0, 0, err
	}

	return wallet.Balance, wallet.Reserve, nil
}
