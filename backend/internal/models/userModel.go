package models

import (
	"fmt"
	"time"
)

type User struct {
	ID        string `gorm:"primarykey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Name      string
	Email     string `gorm:"uniqueIndex"`
	AvatarUrl string
}

func SaveUserToDb(name, email, avatarUrl, id string) error {
	db := ConnectDB()

	sqldb, err := db.DB()
	if err != nil {
		fmt.Println("Error creating user: Getting db.DB()")
	}
	defer sqldb.Close()

	tx := db.Create(&User{Name: name, Email: email, AvatarUrl: avatarUrl, ID: id})
	return tx.Error
}

func GetUserById(id string) (User, error) {
	db := ConnectDB()

	sqldb, err := db.DB()
	if err != nil {
		fmt.Println("Error creating user: Getting db.DB()")
	}
	defer sqldb.Close()

	var user User
	tx := db.Where("ID = ?", id).First(&user)
	return user, tx.Error

}
