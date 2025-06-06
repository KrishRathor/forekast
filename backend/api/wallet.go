package api

import (
	CustomErrors "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/redis"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/go-chi/chi/v5"
)

type BalanceUpdatedEvent struct {
	Data struct {
		Balance float64 `json:"balance"`
	} `json:"data"`
}

type PlaceLimitOrderEvent struct {
	Data struct {
		UserID   string  `json:"userid"`
		MarketID string  `json:"marketid"`
		Yes      bool    `json:"yes"`
		Quantity int     `json:"quantity"`
		Price    float64 `json:"price"`
	} `json:"data"`
}

func WalletRoutes() http.Handler {

	r := chi.NewRouter()

	r.Post("/getAllTradesOfUser", func(w http.ResponseWriter, r *http.Request) {
		claims, ok := clerk.SessionClaimsFromContext(r.Context())

		if !ok {
			fmt.Println("here")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"access": "unauthorized"}`))
			return
		}

		usr, err := user.Get(r.Context(), claims.Subject)

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"access": "unauthorized"}`))
			return
		}

		trades, err := models.GetAllTradesOfUser(usr.ID)

		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{"message": "notfound"}`))
			return

		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"message":  "success",
			"response": trades,
		})

	})

	r.Post("/getBalanceAndReserve", func(w http.ResponseWriter, r *http.Request) {
		claims, ok := clerk.SessionClaimsFromContext(r.Context())

		if !ok {
			fmt.Println("here")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"access": "unauthorized"}`))
			return
		}

		usr, err := user.Get(r.Context(), claims.Subject)

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"access": "unauthorized"}`))
			return
		}

		balance, reserve, err2 := models.GetWalletBalanceAndReserve(usr.ID)

    fmt.Println("balcned : ", balance, reserve)

		if err2 != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"message": "err while gettting funds"}`))
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "success",
			"balance": balance,
			"reserve": reserve,
		})

	})

	r.Post("/subtractBalance", func(w http.ResponseWriter, r *http.Request) {
		claims, ok := clerk.SessionClaimsFromContext(r.Context())

		if !ok {
			fmt.Println("here")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"access": "unauthorized"}`))
			return
		}

		usr, err := user.Get(r.Context(), claims.Subject)

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"access": "unauthorized"}`))
			return
		}

		var event BalanceUpdatedEvent

		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		fmt.Println("balance ==>> ", event.Data.Balance)

		if err := models.GetMoneyFromWallet(usr.ID, event.Data.Balance); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{
				"message":  "error",
				"response": err.Error(),
			})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message":  "success",
			"response": "nil",
		})

	})

	r.Post("/addBalance", func(w http.ResponseWriter, r *http.Request) {
		claims, ok := clerk.SessionClaimsFromContext(r.Context())

		if !ok {
			fmt.Println("here")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"access": "unauthorized"}`))
			return
		}

		usr, err := user.Get(r.Context(), claims.Subject)

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"access": "unauthorized"}`))
			return
		}

		var event BalanceUpdatedEvent

		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		fmt.Println("balance ==>> ", event.Data.Balance)

		models.AddBalanceToWallet(usr.ID, event.Data.Balance)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "success",
		})

	})

	r.Post("/placeLimitOrder", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("insdie place order")

		var event PlaceLimitOrderEvent

		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		amountRequired := event.Data.Price * float64(event.Data.Quantity)

		err := models.ReserveFunds(event.Data.UserID, event.Data.MarketID, amountRequired)

		if err != nil {
			switch err {
			case CustomErrors.ErrWalletNotFound:
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(`{"message": "StatusInternalServerError"}`))
				return
			case CustomErrors.ErrInsufficientBalance:
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte(`{"message": "insufficient balance"}`))
				return
			default:
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(`{"message": "StatusInternalServerError"}`))
				return
			}
		}

		payload := CustomErrors.Payload{
			Type:     "place:limit:order",
			MarketID: event.Data.MarketID,
			UserID:   event.Data.UserID,
			Yes:      event.Data.Yes,
			Price:    event.Data.Price,
			Quantity: event.Data.Quantity,
		}

		err = redis.Publish(payload)
		if err != nil {
			fmt.Println(err)
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "success"}`))

	})

	return r

}
