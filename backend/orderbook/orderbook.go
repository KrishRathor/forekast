package orderbook

import (
	"container/heap"
	"fmt"
	"sync"
	"time"
)

type LimitOrder struct {
	ID        string
	UserID    string
	MarketID  string
	Yes       bool
	Price     float64
	Quantity  int
	Timestamp time.Time
}

type Trade struct {
	YesBuyer  string
	NoBuyer   string
	YesPrice  float64
	Quantity  int
	Timestamp time.Time
}

type PriceHeap struct {
	prices []float64
	asc    bool
}

func (h PriceHeap) Len() int { return len(h.prices) }
func (h PriceHeap) Less(i, j int) bool {
	if h.asc {
		return h.prices[i] < h.prices[j]
	}
	return h.prices[i] > h.prices[j]
}
func (h PriceHeap) Swap(i, j int)       { h.prices[i], h.prices[j] = h.prices[j], h.prices[i] }
func (h *PriceHeap) Push(x interface{}) { h.prices = append(h.prices, x.(float64)) }
func (h *PriceHeap) Pop() interface{} {
	n := len(h.prices)
	x := h.prices[n-1]
	h.prices = h.prices[:n-1]
	return x
}

func (h *PriceHeap) Peek() (float64, bool) {
	if len(h.prices) == 0 {
		return 0, false
	}
	return h.prices[0], true
}

type Orderbook struct {
	MarketID string

	YesOrders map[float64][]*LimitOrder
	NoOrders  map[float64][]*LimitOrder

	YesHeap *PriceHeap
	NoHeap  *PriceHeap

	LastTradedPrice float64

	mu sync.Mutex
}

func NewOrderBook(marketID string) *Orderbook {
	yh := &PriceHeap{asc: false}
	nh := &PriceHeap{asc: false}
	heap.Init(yh)
	heap.Init(nh)

	return &Orderbook{
		MarketID:  marketID,
		YesOrders: make(map[float64][]*LimitOrder),
		NoOrders:  make(map[float64][]*LimitOrder),
		YesHeap:   yh,
		NoHeap:    nh,
	}
}

var (
	orderbooks = make(map[string]*Orderbook)
	Obmu       sync.Mutex
)

func CreateOrderBook(marketID string) *Orderbook {
	Obmu.Lock()
	defer Obmu.Unlock()

	ob, exists := orderbooks[marketID]
	if !exists {
		ob = NewOrderBook(marketID)
		orderbooks[marketID] = ob
	}
	return ob
}

func (ob *Orderbook) addOrder(book map[float64][]*LimitOrder, h *PriceHeap, order *LimitOrder) {
	if _, exists := book[order.Price]; !exists {
		heap.Push(h, order.Price)
	}
	book[order.Price] = append(book[order.Price], order)
}

func (ob *Orderbook) removePriceLevelIfEmpty(book map[float64][]*LimitOrder, h *PriceHeap, price float64) {
	if len(book[price]) == 0 {
		delete(book, price)
		for i, p := range h.prices {
			if p == price {
				heap.Remove(h, i)
				break
			}
		}
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func PlaceOrder(order LimitOrder) []Trade {

	fmt.Println("placed order 1 : ", order.Yes, order.Price, order.Quantity)

	Obmu.Lock()
	ob, exists := orderbooks[order.MarketID]
	if !exists {
		ob = NewOrderBook(order.MarketID)
		orderbooks[order.MarketID] = ob
	}
	Obmu.Unlock()

	fmt.Println("placed order 2 : ", ob.MarketID == order.MarketID, order.Price, order.Quantity)

	ob.mu.Lock()
	defer ob.mu.Unlock()

	var trades []Trade
	now := time.Now()

	if order.Yes {

		fmt.Println("placed order 3 : ", ob.MarketID == order.MarketID, order.Price, order.Quantity)

		for order.Quantity > 0 {
			bestNoPrice, ok := ob.NoHeap.Peek()
			fmt.Println("place order 4: ", bestNoPrice)

			if !ok {
				break
			}
			if bestNoPrice < 100-order.Price {
				break
			}

			fmt.Println("place order 5: ", bestNoPrice)

			ordersAtPrice := ob.NoOrders[bestNoPrice]
			for len(ordersAtPrice) > 0 && order.Quantity > 0 {
				resting := ordersAtPrice[0]
				tradeQty := min(order.Quantity, resting.Quantity)

				yesPrice := 100 - resting.Price

				trades = append(trades, Trade{
					YesBuyer:  order.UserID,
					NoBuyer:   resting.UserID,
					YesPrice:  yesPrice,
					Quantity:  tradeQty,
					Timestamp: now,
				})

				order.Quantity -= tradeQty
				resting.Quantity -= tradeQty

				if resting.Quantity == 0 {
					ordersAtPrice = ordersAtPrice[1:]
				} else {
					break
				}
			}

			if len(ordersAtPrice) == 0 {
				delete(ob.NoOrders, bestNoPrice)
				heap.Pop(ob.NoHeap)
			} else {
				ob.NoOrders[bestNoPrice] = ordersAtPrice
			}
		}

		if order.Quantity > 0 {
			ob.addOrder(ob.YesOrders, ob.YesHeap, &order)
		}

	} else {
		for order.Quantity > 0 {
			bestYesPrice, ok := ob.YesHeap.Peek()
			if !ok {
				break
			}
			if bestYesPrice < 100-order.Price {
				break
			}

			ordersAtPrice := ob.YesOrders[bestYesPrice]
			for len(ordersAtPrice) > 0 && order.Quantity > 0 {
				resting := ordersAtPrice[0]
				tradeQty := min(order.Quantity, resting.Quantity)

				yesPrice := bestYesPrice

				trades = append(trades, Trade{
					YesBuyer:  resting.UserID,
					NoBuyer:   order.UserID,
					YesPrice:  yesPrice,
					Quantity:  tradeQty,
					Timestamp: now,
				})

				order.Quantity -= tradeQty
				resting.Quantity -= tradeQty

				if resting.Quantity == 0 {
					ordersAtPrice = ordersAtPrice[1:]
				} else {
					break
				}
			}

			if len(ordersAtPrice) == 0 {
				delete(ob.YesOrders, bestYesPrice)
				heap.Pop(ob.YesHeap)
			} else {
				ob.YesOrders[bestYesPrice] = ordersAtPrice
			}
		}

		if order.Quantity > 0 {
			ob.addOrder(ob.NoOrders, ob.NoHeap, &order)
		}
	}

	if len(trades) > 0 {
		ob.LastTradedPrice = trades[len(trades)-1].YesPrice
	}

	BroadcastOrderBook(ob)
	return trades
}

func (ob *Orderbook) BestYesPrice() (float64, bool) {
	ob.mu.Lock()
	defer ob.mu.Unlock()
	return ob.YesHeap.Peek()
}

func (ob *Orderbook) BestNoPrice() (float64, bool) {
	ob.mu.Lock()
	defer ob.mu.Unlock()
	return ob.NoHeap.Peek()
}
