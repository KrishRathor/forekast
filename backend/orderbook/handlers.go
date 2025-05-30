package orderbook

import (
	CustomErrors "backend/internal/errors"
	"encoding/json"
	"fmt"
	"sync"
	"time"

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
		return handlePlaceOrder(conn)
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

	if err := conn.WriteJSON(map[string]string{
		"message": "subscribed",
	}); err != nil {
		return CustomErrors.ErrWrite
	}

	return nil
}

func handlePlaceOrder(conn *websocket.Conn) error {

	ob := NewOrderBook("market1")

	// place a no order
	noOrder := LimitOrder{
		ID:        "1",
		UserID:    "user1no",
		MarketID:  "market1",
		Yes:       false,
		Price:     0.4,
		Quantity:  5,
		Timestamp: time.Now(),
	}
	ob.PlaceOrder(noOrder)

	// place a yes order later
	yesOrder := LimitOrder{
		ID:        "2",
		UserID:    "user2yes",
		MarketID:  "market1",
		Yes:       true,
		Price:     0.7,
		Quantity:  10,
		Timestamp: time.Now(),
	}
	ob.PlaceOrder(yesOrder)

	conn.WriteJSON(map[string]string{
		"message": "success",
	})

	return nil
}

func BroadcastOrderBook(ob *Orderbook) {
	fmt.Println("inside braodcast")
	submu.Lock()
	conns := subscribers[ob.MarketID]
	submu.Unlock()

	fmt.Println(len(conns))

	orderBookSnapshot := map[string]any{
		"type":     "orderbook:update",
		"marketID": ob.MarketID,
		"yesBids":  ob.YesOrders,
		"noBids":   ob.NoOrders,
	}

	for _, conn := range conns {
		if err := conn.WriteJSON(orderBookSnapshot); err != nil {
			fmt.Println(err)
		}
	}

}
