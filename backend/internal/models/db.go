package models

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {

	dsn := "host=localhost user=postgres password=password dbname=forekast port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		fmt.Println("Error connecting database", err)
	}

	if err := db.AutoMigrate(&User{}, &Wallet{}, &Market{}); err != nil {
		fmt.Println("Error in migrating", err)
	}

	return db

}
