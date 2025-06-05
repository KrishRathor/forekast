package main

import (
	"backend/api"
	"backend/internal/redis"
	// "backend/orderbook"
)

func main() {
	// go orderbook.StartWebSocketServer()
  go redis.Subscribe()
	api.CreateServer()

}
