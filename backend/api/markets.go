package api

import (
	"backend/internal/models"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type CreateNewMarketEvent struct {
	Data struct {
		Question string    `json:"question"`
		Time     time.Time `json:"time"`
	} `json:"data"`
}

func MarketRoutes() http.Handler {
	r := chi.NewRouter()

	r.Post("/createNewMarket", func(w http.ResponseWriter, r *http.Request) {

		var event CreateNewMarketEvent
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		if err := models.CreateNewMarket(event.Data.Question, event.Data.Time); err != nil {
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

	r.Get("/getMarketByID", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		market, err := models.GetMarketByID(id)

		if err != nil {
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
		json.NewEncoder(w).Encode(map[string]any{
			"message":  "success",
			"response": market,
		})

	})

	r.Get("/getAllLiveMarkets", func(w http.ResponseWriter, r *http.Request) {
		markets, err := models.GetLiveMarkets()

		if err != nil {
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
		json.NewEncoder(w).Encode(map[string]any{
			"message":  "success",
			"response": markets,
		})
	})

	return r
}
