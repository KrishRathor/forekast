package api

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/clerk/clerk-sdk-go/v2"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
)

func CreateServer() {

	if err := godotenv.Load(); err != nil {
		fmt.Println("can't load env file")
	}

	clerkKey := os.Getenv("CLERK_SECRET_KEY")
	fmt.Println(clerkKey)
	if clerkKey == "" {
		fmt.Println("can't file clerk key")
	}
	clerk.SetKey(clerkKey)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any browser
	}))

	r.Use(middleware.Logger)

	r.Mount("/api/v1/users", UserRoutes())
	r.Mount("/api/v1/markets", MarketRoutes())
	r.Mount("/api/v1/wallet", clerkhttp.WithHeaderAuthorization()(WalletRoutes()))

	http.ListenAndServe(":3000", r)
}
