package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func CreateServer() {

	r := chi.NewRouter()
	r.Use(middleware.Logger)

  r.Mount("/users", UserRoutes())

	http.ListenAndServe(":3000", r)
}
