package api

import (
	"backend/internal/models"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type UserCreatedEvent struct {
	Data struct {
		ID             string `json:"id"`
		FirstName      string `json:"first_name"`
		LastName       string `json:"last_name"`
		EmailAddresses []struct {
			EmailAddress string `json:"email_address"`
		} `json:"email_addresses"`
		ExternalAccounts []struct {
			AvatarURL string `json:"avatar_url"`
		} `json:"external_accounts"`
	} `json:"data"`
}

func UserRoutes() http.Handler {
	r := chi.NewRouter()

	r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		user, err := models.GetUserById(id)

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{
					"message": "user not found",
					"user":    "",
				})
				return
			}
			fmt.Println("Error Getting User: ", err)
		}

		userStr, _ := json.Marshal(user)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "success",
			"user":    string(userStr),
		})

	})

	r.Post("/createUserWebhook", func(w http.ResponseWriter, r *http.Request) {

		fmt.Println("here")

		var event UserCreatedEvent

		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		email := event.Data.EmailAddresses[0].EmailAddress
		avatar := event.Data.ExternalAccounts[0].AvatarURL
		name := fmt.Sprintf(event.Data.FirstName + event.Data.LastName)
		id := event.Data.ID

		fmt.Println("id ===>>>>> ", event.Data.ID)

		if err := models.SaveUserToDb(name, email, avatar, id); err != nil {
			fmt.Println("Error while saving users", err)
		}

		if err := models.AddBalanceToWallet(id, 10000); err != nil {
			fmt.Println("Error while creating wallet", err)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "success",
		})

	})

	r.Post("/publish", func(w http.ResponseWriter, r *http.Request) {
	})

	return r
}
