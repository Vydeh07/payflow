package auth

import (
"net/http"
"os"
"strings"

"github.com/gin-gonic/gin"
"github.com/golang-jwt/jwt/v5"
)

func Middleware() gin.HandlerFunc {
return func(c *gin.Context) {
authHeader := c.GetHeader("Authorization")
if authHeader == "" {
c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
c.Abort()
return
}

parts := strings.SplitN(authHeader, " ", 2)
if len(parts) != 2 || parts[0] != "Bearer" {
c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
c.Abort()
return
}

tokenStr := parts[1]
token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
return []byte(os.Getenv("JWT_SECRET")), nil
})

if err != nil || !token.Valid {
c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
c.Abort()
return
}

claims, ok := token.Claims.(jwt.MapClaims)
if !ok {
c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
c.Abort()
return
}

c.Set("user_id", claims["user_id"])
c.Next()
}
}
