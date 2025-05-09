package api

import (
	"backend/internal/models"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type UserCreatedWebhookEvent struct {
	Data struct {
		EmailAddresses []struct {
			EmailAddress string `json:"email_address"`
		} `json:"email_addresses"`
		ExternalAccounts []struct {
			AvatarURL string `json:"avatar_url"`
			FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
		} `json:"external_accounts"`
	} `json:"data"`
}

func UserRoutes() http.Handler {
	r := chi.NewRouter()

	r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		numId, err1 := strconv.ParseUint(id, 10, 64)

		if err1 != nil {
			fmt.Println("Can't convert number")
		}

		user, err := models.GetUserById(uint(numId))
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
		var event UserCreatedWebhookEvent

		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		email := event.Data.EmailAddresses[0].EmailAddress
		avatar := event.Data.ExternalAccounts[0].AvatarURL
		name := fmt.Sprintf("%s %s", event.Data.ExternalAccounts[0].FirstName, event.Data.ExternalAccounts[0].LastName)

		if err := models.SaveUserToDb(name, email, avatar); err != nil {
			fmt.Println("Error while saving users", err)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "success",
		})

	})

	return r
}
