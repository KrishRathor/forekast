package orderbook

import (
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
		return ErrInvalidJson
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
		return ErrInvalidType
	}

	if err := conn.WriteJSON(map[string]string{
		"message": "success",
	}); err != nil {
		return ErrWrite
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
		return ErrInvalidJson
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
		"type": "subscribe",
	}); err != nil {
		return ErrWrite
	}

	return nil
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
		return ErrInvalidJson
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

	trades := PlaceOrder(order)
	fmt.Println("generated order ", ob.YesHeap)

	submu.Lock()
	conns := subscribers[placeLimitOrderPayload.MarketID]
	submu.Unlock()

	response := map[string]any{
		"type":    "placeorder",
		"success": true,
		"trades":  trades,
    	"alltrades": GetAllTrades(),
	}

	for _, conn := range conns {
		if err := conn.WriteJSON(response); err != nil {
			fmt.Println(err)
		}
	}

	return nil
}

func BroadcastOrderBookToConn(ob *Orderbook, conn *websocket.Conn) {

	yesOrders := make([]map[string]any, 0, len(ob.YesHeap.prices))
	for i := len(ob.YesHeap.prices) - 1; i >= 0; i-- {
		price := ob.YesHeap.prices[i]
		if orders, ok := ob.YesOrders[price]; ok {
			qty := 0
			for _, o := range orders {
				qty += o.Quantity
			}
			yesOrders = append(yesOrders, map[string]any{
				"price":    price,
				"quantity": qty,
				"total":    price * float64(qty),
			})
		}
	}

	noOrders := make([]map[string]any, 0, len(ob.NoHeap.prices))
	for i := len(ob.NoHeap.prices) - 1; i >= 0; i-- {
		price := ob.NoHeap.prices[i]
		if orders, ok := ob.NoOrders[price]; ok {
			qty := 0
			for _, o := range orders {
				qty += o.Quantity
			}
			noOrders = append(noOrders, map[string]any{
				"price":    price,
				"quantity": qty,
				"total":    price * float64(qty),
			})
		}
	}

	orderBookSnapshot := map[string]any{
		"type":         "orderbook:update",
		"marketID":     ob.MarketID,
		"yesorders":    yesOrders,
		"noorders":     noOrders,
		"currentPrice": ob.LastTradedPrice,
	}

	if err := conn.WriteJSON(orderBookSnapshot); err != nil {
		fmt.Println(err)
	}
}

func BroadcastOrderBook(ob *Orderbook) {
	fmt.Println("inside broadcast")
	submu.Lock()
	conns := subscribers[ob.MarketID]
	submu.Unlock()

	yesOrders := make([]map[string]any, 0, len(ob.YesHeap.prices))
	for i := len(ob.YesHeap.prices) - 1; i >= 0; i-- {
		price := ob.YesHeap.prices[i]
		if orders, ok := ob.YesOrders[price]; ok {
			qty := 0
			for _, o := range orders {
				qty += o.Quantity
			}
			yesOrders = append(yesOrders, map[string]any{
				"price":    price,
				"quantity": qty,
				"total":    price * float64(qty),
			})
		}
	}

	noOrders := make([]map[string]any, 0, len(ob.NoHeap.prices))
	for i := len(ob.NoHeap.prices) - 1; i >= 0; i-- {
		price := ob.NoHeap.prices[i]
		if orders, ok := ob.NoOrders[price]; ok {
			qty := 0
			for _, o := range orders {
				qty += o.Quantity
			}
			noOrders = append(noOrders, map[string]any{
				"price":    price,
				"quantity": qty,
				"total":    price * float64(qty),
			})
		}
	}

	orderBookSnapshot := map[string]any{
		"type":         "orderbook:update",
		"marketID":     ob.MarketID,
		"yesorders":    yesOrders,
		"noorders":     noOrders,
		"currentPrice": ob.LastTradedPrice,
	}

	for _, conn := range conns {
		if err := conn.WriteJSON(orderBookSnapshot); err != nil {
			fmt.Println(err)
		}
	}
}
