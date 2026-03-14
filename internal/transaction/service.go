package transaction

import (
"errors"
"time"

"github.com/Vydeh07/payflow/internal/fraud"
"github.com/Vydeh07/payflow/pkg/database"
)

type Transaction struct {
ID         string    `json:"id"`
SenderID   string    `json:"sender_id"`
ReceiverID string    `json:"receiver_id"`
Amount     float64   `json:"amount"`
Status     string    `json:"status"`
Flagged    bool      `json:"flagged"`
FlagReason string    `json:"flag_reason,omitempty"`
CreatedAt  time.Time `json:"created_at"`
}

type SendInput struct {
ReceiverUsername string  `json:"receiver_username" binding:"required"`
Amount           float64 `json:"amount"            binding:"required,gt=0"`
Note             string  `json:"note"`
}

func Send(senderID string, input SendInput) (*Transaction, error) {
var receiverID string
var senderBalance float64

err := database.DB.QueryRow(
`SELECT id FROM users WHERE username = $1`,
input.ReceiverUsername,
).Scan(&receiverID)
if err != nil {
return nil, errors.New("receiver not found")
}

if receiverID == senderID {
return nil, errors.New("cannot send money to yourself")
}

err = database.DB.QueryRow(
`SELECT balance FROM users WHERE id = $1`,
senderID,
).Scan(&senderBalance)
if err != nil {
return nil, errors.New("sender not found")
}

fraudResult := fraud.Check(senderID, input.Amount, senderBalance)
if fraudResult.Blocked {
return nil, errors.New("transaction blocked: " + fraudResult.Reason)
}

tx, err := database.DB.Begin()
if err != nil {
return nil, errors.New("failed to start transaction")
}
defer tx.Rollback()

_, err = tx.Exec(
`UPDATE users SET balance = balance - $1 WHERE id = $2`,
input.Amount, senderID,
)
if err != nil {
return nil, errors.New("failed to deduct balance")
}

_, err = tx.Exec(
`UPDATE users SET balance = balance + $1 WHERE id = $2`,
input.Amount, receiverID,
)
if err != nil {
return nil, errors.New("failed to credit receiver")
}

var txn Transaction
status := "completed"
if fraudResult.Flagged {
status = "flagged"
}

err = tx.QueryRow(`
INSERT INTO transactions
(sender_id, receiver_id, amount, status, flagged, flag_reason)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, sender_id, receiver_id, amount, status, flagged, flag_reason, created_at
`, senderID, receiverID, input.Amount, status,
fraudResult.Flagged, fraudResult.Reason,
).Scan(
&txn.ID, &txn.SenderID, &txn.ReceiverID,
&txn.Amount, &txn.Status, &txn.Flagged,
&txn.FlagReason, &txn.CreatedAt,
)
if err != nil {
return nil, errors.New("failed to record transaction")
}

if err := tx.Commit(); err != nil {
return nil, errors.New("failed to commit transaction")
}

return &txn, nil
}

func GetHistory(userID string) ([]Transaction, error) {
rows, err := database.DB.Query(`
SELECT id, sender_id, receiver_id, amount, status, flagged, flag_reason, created_at
FROM transactions
WHERE sender_id = $1 OR receiver_id = $1
ORDER BY created_at DESC
LIMIT 50
`, userID)
if err != nil {
return nil, errors.New("failed to fetch transactions")
}
defer rows.Close()

var txns []Transaction
for rows.Next() {
var t Transaction
if err := rows.Scan(
&t.ID, &t.SenderID, &t.ReceiverID,
&t.Amount, &t.Status, &t.Flagged,
&t.FlagReason, &t.CreatedAt,
); err != nil {
continue
}
txns = append(txns, t)
}

return txns, nil
}

func GetBalance(userID string) (float64, error) {
var balance float64
err := database.DB.QueryRow(
`SELECT balance FROM users WHERE id = $1`, userID,
).Scan(&balance)
if err != nil {
return 0, errors.New("user not found")
}
return balance, nil
}
