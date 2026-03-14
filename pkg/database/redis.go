package database

import (
"context"
"log"
"os"

"github.com/redis/go-redis/v9"
)

var Redis *redis.Client

func ConnectRedis() {
client := redis.NewClient(&redis.Options{
Addr: os.Getenv("REDIS_ADDR"),
})

if err := client.Ping(context.Background()).Err(); err != nil {
log.Fatal("Failed to connect to Redis:", err)
}

Redis = client
log.Println("Redis connected successfully")
}
