package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"regexlab/internal/service"
)

type RegexHandler struct {
	regexService *service.RegexService
}

func NewRegexHandler(regexService *service.RegexService) *RegexHandler {
	return &RegexHandler{regexService: regexService}
}

func (h *RegexHandler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/regex")
	{
		api.POST("/share", h.shareRegex)
		api.GET("/:id", h.getSharedRegex)
		api.POST("/validate", h.validateRegex)
		api.POST("/test", h.testRegex)
	}
}

func (h *RegexHandler) shareRegex(c *gin.Context) {
	var req struct {
		Pattern    string `json:"pattern"`
		TestString string `json:"testString"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	regexShare, err := h.regexService.ShareRegex(req.Pattern, req.TestString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"shareId": regexShare.ID})
}

func (h *RegexHandler) getSharedRegex(c *gin.Context) {
	id := c.Param("id")
	regexShare, err := h.regexService.GetSharedRegex(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Regex not found or expired"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"pattern":    regexShare.Pattern,
		"testString": regexShare.TestString,
	})
}

func (h *RegexHandler) validateRegex(c *gin.Context) {
	var req struct {
		Pattern string `json:"pattern"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	isValid := h.regexService.ValidateRegex(req.Pattern)
	c.JSON(http.StatusOK, gin.H{"isValid": isValid})
}

func (h *RegexHandler) testRegex(c *gin.Context) {
	var req struct {
		Pattern    string `json:"pattern"`
		TestString string `json:"testString"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	matches, err := h.regexService.TestRegex(req.Pattern, req.TestString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"matches": matches})
}