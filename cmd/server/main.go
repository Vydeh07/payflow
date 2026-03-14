package main

import (
"io/fs"
"log"
"os"
"path/filepath"
"sort"

"github.com/gin-gonic/gin"
"github.com/joho/godotenv"

"github.com/Vydeh07/payflow/internal/auth"
"github.com/Vydeh07/payflow/internal/transaction"
"github.com/Vydeh07/payflow/internal/user"
"github.com/Vydeh07/payflow/pkg/database"
)

func runMigrations() {
files := []string{}
filepath.WalkDir("migrations", func(path string, d fs.DirEntry, err error) error {
if err != nil { return err }
if !d.IsDir() && filepath.Ext(path) == ".sql" {
files = append(files, path)
}
return nil
})
sort.Strings(files)

for _, f := range files {
content, err := os.ReadFile(f)
if err != nil {
log.Printf("Failed to read migration %s: %v", f, err)
continue
}
if _, err := database.DB.Exec(string(content)); err != nil {
log.Printf("Migration %s failed: %v", f, err)
} else {
log.Printf("Migration applied: %s", f)
}
}
}

func main() {
godotenv.Load()

database.ConnectPostgres()
database.ConnectRedis()
runMigrations()

r := gin.Default()

r.Use(func(c *gin.Context) {
c.Header("Access-Control-Allow-Origin", "*")
c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
if c.Request.Method == "OPTIONS" {
c.AbortWithStatus(204)
return
}
c.Next()
})

r.GET("/health", func(c *gin.Context) {
c.JSON(200, gin.H{"status": "ok", "service": "payflow"})
})

api := r.Group("/api")
{
api.POST("/auth/register", auth.RegisterHandler)
api.POST("/auth/login",    auth.LoginHandler)

protected := api.Group("/")
protected.Use(auth.Middleware())
{
protected.GET("/me", func(c *gin.Context) {
c.JSON(200, gin.H{"user_id": c.GetString("user_id")})
})
protected.GET("/balance",              transaction.BalanceHandler)
protected.POST("/transactions/send",   transaction.SendHandler)
protected.GET("/transactions/history", transaction.HistoryHandler)
protected.GET("/admin/users",          user.GetAllUsers)
protected.GET("/admin/flagged",        user.GetFlaggedTransactions)
protected.GET("/admin/stats",          user.GetStats)
}
}

port := os.Getenv("PORT")
if port == "" {
port = "8080"
}
log.Printf("Server starting on port %s", port)
r.Run(":" + port)
}
