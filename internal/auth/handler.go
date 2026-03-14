package auth

import (
"net/http"

"github.com/gin-gonic/gin"
)

func RegisterHandler(c *gin.Context) {
var input RegisterInput
if err := c.ShouldBindJSON(&input); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}

token, err := Register(input)
if err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}

c.JSON(http.StatusCreated, gin.H{
"message": "registration successful",
"token":   token,
})
}

func LoginHandler(c *gin.Context) {
var input LoginInput
if err := c.ShouldBindJSON(&input); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}

token, user, err := Login(input)
if err != nil {
c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
return
}

c.JSON(http.StatusOK, gin.H{
"message": "login successful",
"token":   token,
"user":    user,
})
}
