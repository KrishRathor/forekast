package orderbook

import (
	"container/heap"
	"sync"
	"time"
)

var orderbooks = make(map[string]*Orderbook)
var Obmu sync.Mutex

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

type Orderbook struct {
	MarketID string

	YesOrders map[float64][]LimitOrder
	NoOrders  map[float64][]LimitOrder

	YesHeap *PriceHeap
	NoHeap  *PriceHeap

	LastTradedPrice float64

	mu sync.Mutex
}

func NewOrderBook(marketID string) *Orderbook {
	yh := &PriceHeap{asc: false}
	nh := &PriceHeap{asc: true}
	heap.Init(yh)
	heap.Init(nh)

	return &Orderbook{
		MarketID:  marketID,
		YesOrders: make(map[float64][]LimitOrder),
		NoOrders:  make(map[float64][]LimitOrder),
		YesHeap:   yh,
		NoHeap:    nh,
	}
}

func CreateOrderBook(marketID string) *Orderbook {
	ob, exists := orderbooks[marketID]
	if !exists {
		ob = NewOrderBook(marketID)
		orderbooks[marketID] = ob
		return ob
	}
	return ob
}

func (ob *Orderbook) PlaceOrder(order LimitOrder) []Trade {
	ob.mu.Lock()
	ob, exists := orderbooks[order.MarketID]
	if !exists {
		ob = NewOrderBook(order.MarketID)
		orderbooks[order.MarketID] = ob
	}
	defer ob.mu.Unlock()

	var trades []Trade

	if order.Yes {
		trades = ob.match(
			ob.NoOrders, ob.NoHeap, &order,
			func(bid, ask float64) bool { return bid+ask >= 100.0 },
			true,
		)
		if order.Quantity > 0 {
			ob.addOrder(ob.YesOrders, ob.YesHeap, order)
		}
	} else {
		trades = ob.match(
			ob.YesOrders, ob.YesHeap, &order,
			func(ask, bid float64) bool { return ask+bid >= 100.0 },
			false,
		)
		if order.Quantity > 0 {
			ob.addOrder(ob.NoOrders, ob.NoHeap, order)
		}
	}

	BroadcastOrderBook(ob)
	return trades
}

func (ob *Orderbook) match(
	book map[float64][]LimitOrder,
	h *PriceHeap,
	incoming *LimitOrder,
	matchFunc func(incoming, bookPrice float64) bool,
	selectYes bool,
) []Trade {
	var trades []Trade
	now := time.Now()

	for incoming.Quantity > 0 && h.Len() > 0 {
		bestPrice := (*h).prices[0]

		if !matchFunc(incoming.Price, bestPrice) {
			break
		}

		ordersAtPrice := book[bestPrice]
		for len(ordersAtPrice) > 0 && incoming.Quantity > 0 {
			head := &ordersAtPrice[0]
			tradeQty := min(incoming.Quantity, head.Quantity)

			trades = append(trades, Trade{
				YesBuyer:  selectYesBuyer(incoming, head, selectYes),
				NoBuyer:   selectNoBuyer(incoming, head, selectYes),
				YesPrice:  getYesPrice(incoming, head, selectYes),
				Quantity:  tradeQty,
				Timestamp: now,
			})

			incoming.Quantity -= tradeQty
			head.Quantity -= tradeQty

			if head.Quantity == 0 {
				ordersAtPrice = ordersAtPrice[1:]
			} else {
				break
			}
		}

		if len(ordersAtPrice) == 0 {
			delete(book, bestPrice)
			heap.Pop(h)
		} else {
			book[bestPrice] = ordersAtPrice
		}
	}

	if len(trades) > 0 {
		ob.LastTradedPrice = trades[len(trades)-1].YesPrice
		BroadcastOrderBook(ob)
	}

	return trades
}

func (ob *Orderbook) addOrder(book map[float64][]LimitOrder, h *PriceHeap, order LimitOrder) {
	if _, exists := book[order.Price]; !exists {
		heap.Push(h, order.Price)
	}
	book[order.Price] = append(book[order.Price], order)
}

func selectYesBuyer(a, b *LimitOrder, isBuyYes bool) string {
	if isBuyYes {
		return a.UserID
	}
	return b.UserID
}

func getYesPrice(a, b *LimitOrder, isBuyYes bool) float64 {
	if isBuyYes {
		return min(a.Price, 100-b.Price)
	}
	return min(b.Price, 100-a.Price)
}

func selectNoBuyer(a, b *LimitOrder, isBuyYes bool) string {
	if isBuyYes {
		return b.UserID
	}
	return a.UserID

}

func (ob *Orderbook) BestYesPrice() (float64, bool) {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	if ob.YesHeap.Len() == 0 {
		return 0, false
	}

	return ob.YesHeap.prices[0], true
}

func (ob *Orderbook) BestNoPrice() (float64, bool) {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	if ob.NoHeap.Len() == 0 {
		return 0, false
	}

	return ob.NoHeap.prices[0], true
}
