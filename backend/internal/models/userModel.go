package models

import (
	"fmt"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name      string
	Email     string
	AvatarUrl string
}

func SaveUserToDb(name, email, avatarUrl string) error {
	db := ConnectDB()

	sqldb, err := db.DB()
	if err != nil {
		fmt.Println("Error creating user: Getting db.DB()")
	}
	defer sqldb.Close()

	tx := db.Create(&User{Name: name, Email: email, AvatarUrl: avatarUrl})
	return tx.Error
}

func GetUserById(id uint) (User, error) {
	db := ConnectDB()

	sqldb, err := db.DB()
	if err != nil {
		fmt.Println("Error creating user: Getting db.DB()")
	}
	defer sqldb.Close()

	var user User
	tx := db.First(&user, id)
	return user, tx.Error

}
