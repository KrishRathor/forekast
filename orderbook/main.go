package main

import "orderbook/orderbook"

func main() {
  go orderbook.Subscribe()
	orderbook.StartWebSocketServer()
}
