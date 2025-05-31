package orderbook

import (
	CustomErrors "backend/internal/errors"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var subscribers = make(map[string][]*websocket.Conn)
var submu sync.Mutex

type MessageType string

const (
	TypeInit      MessageType = "init"
	TypeOrder     MessageType = "order"
	TypeCancel    MessageType = "cancel"
	TypeOrderBook MessageType = "subscribe:orderbook"
)

type GeneralData struct {
	Type MessageType     `json:"type"`
	Data json.RawMessage `json:"data"`
}

func WSHandler(msg []byte, conn *websocket.Conn) error {

	fmt.Println("recieved msg: ", msg)

	var generalData GeneralData
	if err := json.Unmarshal(msg, &generalData); err != nil {
		fmt.Println(err)
		return CustomErrors.ErrInvalidJson
	}

	switch generalData.Type {
	case TypeInit:
		// handle init
	case TypeOrder:
		return handlePlaceLimitOrder(generalData.Data, conn)
	case TypeCancel:
	// handle cancel
	case TypeOrderBook:
		fmt.Println("type orderbook")
		return handleSubscribeOrderBook(generalData.Data, conn)
	default:
		return CustomErrors.ErrInvalidType
	}

	if err := conn.WriteJSON(map[string]string{
		"message": "success",
	}); err != nil {
		return CustomErrors.ErrWrite
	}

	return nil

}

type OrderBookPayload struct {
	MarketID string `json:"marketid"`
}

func handleSubscribeOrderBook(msg []byte, conn *websocket.Conn) error {

	var orderbookPayload OrderBookPayload
	if err := json.Unmarshal(msg, &orderbookPayload); err != nil {
		fmt.Println(err)
		return CustomErrors.ErrInvalidJson
	}

	fmt.Println("adding ", conn, " in map")

	submu.Lock()
	defer submu.Unlock()
	subscribers[orderbookPayload.MarketID] = append(subscribers[orderbookPayload.MarketID], conn)

	Obmu.Lock()
	ob, exists := orderbooks[orderbookPayload.MarketID]
	Obmu.Unlock()

	if exists {
		BroadcastOrderBookToConn(ob, conn)
	} else {
		fmt.Println("no orderbook with market id", orderbookPayload.MarketID, " so creating one")
		ob := CreateOrderBook(orderbookPayload.MarketID)
		BroadcastOrderBookToConn(ob, conn)
	}

	if err := conn.WriteJSON(map[string]string{
		"message": "subscribed",
	}); err != nil {
		return CustomErrors.ErrWrite
	}

	return nil
}

func BroadcastOrderBookToConn(ob *Orderbook, conn *websocket.Conn) {
	fmt.Println("broadcast to conn was called with market id: ", ob.MarketID)

	yesHeapData := make([]float64, len(ob.YesHeap.prices))
	copy(yesHeapData, ob.YesHeap.prices)

	noHeapData := make([]float64, len(ob.NoHeap.prices))
	copy(noHeapData, ob.NoHeap.prices)

	yesOrders := make([]map[string]any, 0, len(ob.YesOrders))
	for price, orders := range ob.YesOrders {
		yesOrders = append(yesOrders, map[string]any{
			"price":  price,
			"orders": orders,
		})
	}

	noorders := make([]map[string]any, 0, len(ob.NoOrders))
	for price, orders := range ob.NoOrders {
		noorders = append(noorders, map[string]any{
			"price":  price,
			"orders": orders,
		})
	}

	orderBookSnapshot := map[string]any{
		"type":         "orderbook:update",
		"marketID":     ob.MarketID,
		"yesHeap":      yesHeapData,
		"noHeap":       noHeapData,
		"yesorders":    yesOrders,
		"noorders":     noorders,
		"currentPrice": ob.LastTradedPrice,
	}

	if err := conn.WriteJSON(orderBookSnapshot); err != nil {
		fmt.Println(err)
	}
}

type PlaceLimitOrderPayload struct {
	MarketID string  `json:"marketid"`
	UserID   string  `json:"userid"`
	Yes      bool    `json:"yes"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

func handlePlaceLimitOrder(msg []byte, conn *websocket.Conn) error {

	fmt.Println("inside place order")

	var placeLimitOrderPayload PlaceLimitOrderPayload
	if err := json.Unmarshal(msg, &placeLimitOrderPayload); err != nil {
		fmt.Println(err)
		return CustomErrors.ErrInvalidJson
	}

	Obmu.Lock()
	ob, exists := orderbooks[placeLimitOrderPayload.MarketID]
	Obmu.Unlock()

	if !exists {
		if err := conn.WriteJSON(map[string]any{
			"type":    "placeorder",
			"success": false,
		}); err != nil {
			fmt.Println(err)
		}
	}

	fmt.Println(ob.MarketID)

	uuid, err := uuid.NewUUID()
	if err != nil {
		fmt.Println(err)
		return err
	}

	order := LimitOrder{
		ID:       uuid.String(),
		MarketID: placeLimitOrderPayload.MarketID,
		UserID:   placeLimitOrderPayload.UserID,
		Yes:      placeLimitOrderPayload.Yes,
		Quantity: placeLimitOrderPayload.Quantity,
		Price:    placeLimitOrderPayload.Price,
	}

	trades := ob.PlaceOrder(order)
	fmt.Println("generated order ", ob.YesHeap)

	response := map[string]any{
		"type":    "placeorder",
		"success": true,
		"trades":  trades,
	}

	if err := conn.WriteJSON(response); err != nil {
		fmt.Println(err)
	}

	return nil
}

func BroadcastOrderBook(ob *Orderbook) {
	fmt.Println("inside braodcast")
	submu.Lock()
	conns := subscribers[ob.MarketID]
	submu.Unlock()

	fmt.Println(len(conns))

	yesHeapData := make([]float64, len(ob.YesHeap.prices))
	copy(yesHeapData, ob.YesHeap.prices)

	noHeapData := make([]float64, len(ob.NoHeap.prices))
	copy(noHeapData, ob.NoHeap.prices)

	yesOrders := make([]map[string]any, 0, len(ob.YesOrders))
	for price, orders := range ob.YesOrders {
		yesOrders = append(yesOrders, map[string]any{
			"price":  price,
			"orders": orders,
		})
	}

	noorders := make([]map[string]any, 0, len(ob.NoOrders))
	for price, orders := range ob.NoOrders {
		noorders = append(noorders, map[string]any{
			"price":  price,
			"orders": orders,
		})
	}

	orderBookSnapshot := map[string]any{
		"type":         "orderbook:update",
		"marketID":     ob.MarketID,
		"yesHeap":      yesHeapData,
		"noHeap":       noHeapData,
		"yesorders":    yesOrders,
		"noorders":     noorders,
		"currentPrice": ob.LastTradedPrice,
	}

	fmt.Println("from braod ", ob.YesHeap)

	for _, conn := range conns {
		if err := conn.WriteJSON(orderBookSnapshot); err != nil {
			fmt.Println(err)
		}
	}

}
