package orderbook

type PriceHeap struct {
	prices []float64
	asc    bool
}

func (h PriceHeap) Len() int {
	return len(h.prices)
}

func (h PriceHeap) Less(i, j int) bool {
	if h.asc {
		return h.prices[i] < h.prices[j]
	}
	return h.prices[j] < h.prices[i]
}

func (h PriceHeap) Swap(i, j int) {
	h.prices[i], h.prices[j] = h.prices[j], h.prices[i]
}

func (h *PriceHeap) Push(x any) { h.prices = append(h.prices, x.(float64)) }
func (h *PriceHeap) Pop() any {
	n := len(h.prices)
	x := h.prices[n-1]
	h.prices = h.prices[:n-1]
	return x
}
