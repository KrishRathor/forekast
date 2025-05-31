package orderbook

import (
	CustomErrors "backend/internal/errors"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	fmt.Println("new connection: ", conn)

	if err != nil {
		fmt.Println(err)
		return
	}

	defer conn.Close()

	for {

		_, msg, err := conn.ReadMessage()

		if err != nil {
			fmt.Println("inside loop", err)
			break
		}

		err = WSHandler(msg, conn)

		if err != nil {

			if errors.Is(err, CustomErrors.ErrInvalidJson) {
				continue
			}

			if errors.Is(err, CustomErrors.ErrWrite) {
				break
			}

		}

	}

}

func StartWebSocketServer() {
	fmt.Println("here")
	http.HandleFunc("/ws", handleWS)
	fmt.Println("WebSocket server started at :8080/ws")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
