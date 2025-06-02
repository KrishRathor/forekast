package middleware

import (
	"context"
	"net/http"
	"strings"

	clerk "github.com/clerk/clerk-sdk-go/v2"
)

func ClerkAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Missing or invalid Authorization header", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		sessClaims, err := clerk.OAuthAccessTokenList
		if err != nil {
			http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "clerkUserID", sessClaims.Subject)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

