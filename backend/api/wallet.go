package api

import (
	"backend/internal/models"
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

func WalletRoutes() http.Handler {

	r := chi.NewRouter()

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

	return r

}
