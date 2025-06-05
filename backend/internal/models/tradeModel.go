package models

import (
	"gorm.io/gorm"
)

type Trade struct {
	gorm.Model
	User1ID string `gorm:"not null"`
	User2ID string `gorm:"not null"`
	User1   User   `gorm:"foreignKey:User1ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	User2   User   `gorm:"foreignKey:User2ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Price    float64 `gorm:"not null"`
	Quantity float64 `gorm:"not null"`

	Transactions []Transaction
}

type Transaction struct {
	gorm.Model
	UserID string `gorm:"not null"`
	User   User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	TradeID uint  `gorm:"not null"`
	Trade   Trade `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	Amount float64 `gorm:"not null"`
}

func closeDB(db *gorm.DB) {
	sqldb, err := db.DB()
	if err == nil {
		sqldb.Close()
	}
}

func GetAllTradesOfUser(userID string) ([]Trade, error) {
	db := ConnectDB()
	defer closeDB(db)

	var trades []Trade

	err := db.
		Where("user1_id = ? OR user2_id = ?", userID, userID).
		Find(&trades).Error

	return trades, err
}

func GetAllTransactionsOfUser(userID string) ([]Transaction, error) {
	db := ConnectDB()
	defer closeDB(db)

	var txns []Transaction

	err := db.
		Where("user_id = ?", userID).
		Find(&txns).Error

	return txns, err
}

func CreateTrade(user1ID, user2ID string, price, quantity float64) (*Trade, error) {
	db := ConnectDB()
	defer closeDB(db)

	trade := Trade{
		User1ID:  user1ID,
		User2ID:  user2ID,
		Price:    price,
		Quantity: quantity,
	}

	err := db.Create(&trade).Error
	return &trade, err
}

func CreateTransaction(userID string, tradeID uint, amount float64) (*Transaction, error) {
	db := ConnectDB()
	defer closeDB(db)

	if amount >= 0 {
		AddBalanceToWallet(userID, amount)
	} else {
    GetMoneyFromWallet(userID, amount)
  }

	txn := Transaction{
		UserID:  userID,
		TradeID: tradeID,
		Amount:  amount,
	}

	err := db.Create(&txn).Error
	return &txn, err
}
