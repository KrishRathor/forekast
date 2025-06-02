package CustomErrors

import "errors"

var (
	ErrInvalidJson         = errors.New("invalid json")
	ErrWrite               = errors.New("cannot write")
	ErrInvalidType         = errors.New("invlaid type")
	ErrInsufficientBalance = errors.New("ErrInsufficientBalance")
	ErrWalletNotFound      = errors.New("ErrWalletNotFound")
)

type Payload struct {
	MarketID string  `json:"marketid"`
	UserID   string  `json:"userid"`
	Yes      bool    `json:"yes"`
	Price    float64 `json:"price"`
	Quantity int `json:"quantity"`
	Type     string  `json:"type"`
}
