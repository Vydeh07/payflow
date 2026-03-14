package fraud

import (
"context"
"fmt"
"time"

"github.com/Vydeh07/payflow/pkg/database"
)

type Result struct {
Flagged bool
Blocked bool
Reason  string
}

func Check(senderID string, amount float64, balance float64) Result {
if amount > 50000 {
return Result{
Flagged: true,
Blocked: true,
Reason:  "amount exceeds ₹50,000 threshold",
}
}

if amount > balance {
return Result{
Flagged: false,
Blocked: true,
Reason:  "insufficient balance",
}
}

if isVelocityBreached(senderID) {
return Result{
Flagged: true,
Blocked: true,
Reason:  "velocity limit exceeded: too many transactions",
}
}

if amount > 10000 {
return Result{
Flagged: true,
Blocked: false,
Reason:  "large transaction flagged for review",
}
}

return Result{Flagged: false, Blocked: false}
}

func isVelocityBreached(senderID string) bool {
ctx := context.Background()
key := fmt.Sprintf("velocity:%s", senderID)

count, err := database.Redis.Incr(ctx, key).Result()
if err != nil {
return false
}

if count == 1 {
database.Redis.Expire(ctx, key, 60*time.Second)
}

return count > 5
}
