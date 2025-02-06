package main

import (
	"log"
	"time"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"regexlab/internal/handlers"
	"regexlab/internal/repository"
	"regexlab/internal/service"
)

func main() {
	repo := repository.NewFileRepository("./shared_regexes")
	regexService := service.NewRegexService(repo)
	regexHandler := handlers.NewRegexHandler(regexService)
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept"}
	r.Use(cors.New(config))
	regexHandler.RegisterRoutes(r)

	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			if err := repo.CleanupExpiredShares(); err != nil {
				log.Printf("Error cleaning up expired shares: %v", err)
			}
		}
	}()
	
	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}