package user

import (
"net/http"

"github.com/gin-gonic/gin"
"github.com/Vydeh07/payflow/pkg/database"
)

type UserSummary struct {
ID        string  `json:"id"`
Username  string  `json:"username"`
Email     string  `json:"email"`
Balance   float64 `json:"balance"`
TxnCount  int     `json:"transaction_count"`
}

type FlaggedTxn struct {
ID         string  `json:"id"`
SenderID   string  `json:"sender_id"`
ReceiverID string  `json:"receiver_id"`
Amount     float64 `json:"amount"`
FlagReason string  `json:"flag_reason"`
Status     string  `json:"status"`
CreatedAt  string  `json:"created_at"`
}

func GetAllUsers(c *gin.Context) {
rows, err := database.DB.Query(`
SELECT u.id, u.username, u.email, u.balance,
       COUNT(t.id) as txn_count
FROM users u
LEFT JOIN transactions t
       ON u.id = t.sender_id OR u.id = t.receiver_id
GROUP BY u.id
ORDER BY u.created_at DESC
`)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch users"})
return
}
defer rows.Close()

var users []UserSummary
for rows.Next() {
var u UserSummary
if err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.Balance, &u.TxnCount); err != nil {
continue
}
users = append(users, u)
}

c.JSON(http.StatusOK, gin.H{"users": users})
}

func GetFlaggedTransactions(c *gin.Context) {
rows, err := database.DB.Query(`
SELECT id, sender_id, receiver_id, amount,
       flag_reason, status, created_at
FROM transactions
WHERE flagged = true
ORDER BY created_at DESC
`)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flagged transactions"})
return
}
defer rows.Close()

var txns []FlaggedTxn
for rows.Next() {
var t FlaggedTxn
if err := rows.Scan(&t.ID, &t.SenderID, &t.ReceiverID,
&t.Amount, &t.FlagReason, &t.Status, &t.CreatedAt); err != nil {
continue
}
txns = append(txns, t)
}

c.JSON(http.StatusOK, gin.H{"flagged_transactions": txns})
}

func GetStats(c *gin.Context) {
var totalUsers, totalTxns, flaggedTxns int
var totalVolume float64

database.DB.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&totalUsers)
database.DB.QueryRow(`SELECT COUNT(*) FROM transactions`).Scan(&totalTxns)
database.DB.QueryRow(`SELECT COUNT(*) FROM transactions WHERE flagged = true`).Scan(&flaggedTxns)
database.DB.QueryRow(`SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed'`).Scan(&totalVolume)

c.JSON(http.StatusOK, gin.H{
"total_users":         totalUsers,
"total_transactions":  totalTxns,
"flagged_transactions": flaggedTxns,
"total_volume":        totalVolume,
})
}
