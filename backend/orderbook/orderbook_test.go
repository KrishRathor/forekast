package orderbook

import (
	"fmt"
	"testing"
	"time"
)

func TestOrderBook_PlaceOrder(t *testing.T) {
	ob := NewOrderBook("market1")

	// Place a buy order (Yes) at 0.6 price, quantity 10
	order1 := LimitOrder{
		ID:        "o1",
		UserID:    "user1",
		MarketID:  "market1",
		Yes:       true,
		Price:     0.6,
		Quantity:  10,
		Timestamp: time.Now(),
	}
	trades := ob.PlaceOrder(order1)
	if len(trades) != 0 {
		t.Fatalf("expected no trades, got %d", len(trades))
	}

	// Place a sell order (No) at 0.5 price, quantity 5
	order2 := LimitOrder{
		ID:        "o2",
		UserID:    "user2",
		MarketID:  "market1",
		Yes:       false,
		Price:     0.5,
		Quantity:  5,
		Timestamp: time.Now(),
	}
	trades = ob.PlaceOrder(order2)

	fmt.Println("first trade executed => ", trades[0])

	// Price cross check: 0.6 + 0.5 = 1.1 >= 1.0, so trade happens
	if len(trades) != 1 {
		t.Fatalf("expected 1 trade, got %d", len(trades))
	}
	trade := trades[0]
	if trade.Quantity != 5 {
		t.Errorf("expected trade quantity 5, got %d", trade.Quantity)
	}
	if trade.YesBuyer != "user1" || trade.NoBuyer != "user2" {
		t.Errorf("incorrect buyers in trade")
	}

	// The leftover buy order quantity should be 5 now (10 - 5)
	if ob.YesOrders[0.6][0].Quantity != 5 {
		t.Errorf("expected leftover buy quantity 5, got %d", ob.YesOrders[0.6][0].Quantity)
	}

	order3 := LimitOrder{
		ID:        "o3",
		UserID:    "user3",
		MarketID:  "market1",
		Yes:       false,
		Price:     0.4,
		Quantity:  5,
		Timestamp: time.Now(),
	}
	trades = ob.PlaceOrder(order3)
	if len(trades) != 1 {
		t.Fatalf("expected no trades, got %d", len(trades))
	}

	// The new sell order should be inserted into noOrders map at 0.4 price
	if len(ob.NoOrders[0.4]) != 0 {
		t.Errorf("expected 1 sell order at price 0.4, got %d", len(ob.NoOrders[0.4]))
	}
}

func TestOrderBook_MatchFullFill(t *testing.T) {
	ob := NewOrderBook("market2")

	// Place sell order 10 qty at 0.4
	sell := LimitOrder{
		ID:        "s1",
		UserID:    "seller1",
		MarketID:  "market2",
		Yes:       false,
		Price:     0.4,
		Quantity:  10,
		Timestamp: time.Now(),
	}
	ob.PlaceOrder(sell)

	// Place buy order 10 qty at 0.6 (should fully match)
	buy := LimitOrder{
		ID:        "b1",
		UserID:    "buyer1",
		MarketID:  "market2",
		Yes:       true,
		Price:     0.6,
		Quantity:  10,
		Timestamp: time.Now(),
	}
	trades := ob.PlaceOrder(buy)

	if len(trades) != 1 {
		t.Fatalf("expected 1 trade, got %d", len(trades))
	}
	if len(ob.NoOrders[0.4]) != 0 {
		t.Errorf("expected no sell orders left at price 0.4")
	}
	if len(ob.YesOrders) != 0 || ob.YesHeap.Len() != 0 {
		// buy fully matched, so no buy orders should be left
		t.Errorf("expected no buy orders left")
	}
}

func TestHeapOrder(t *testing.T) {
	h := &PriceHeap{asc: false} // max-heap for buy side
	h.Push(0.5)
	h.Push(0.7)
	h.Push(0.6)

	if h.Len() != 3 {
		t.Fatalf("expected heap size 3, got %d", h.Len())
	}
	top := h.Pop()
	if top != 0.7 {
		t.Errorf("expected top to be 0.7, got %f", top)
	}
	top = h.Pop()
	if top != 0.6 {
		t.Errorf("expected next top to be 0.6, got %f", top)
	}
}
