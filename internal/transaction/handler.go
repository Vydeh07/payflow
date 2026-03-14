package transaction

import (
"net/http"

"github.com/gin-gonic/gin"
)

func SendHandler(c *gin.Context) {
senderID := c.GetString("user_id")

var input SendInput
if err := c.ShouldBindJSON(&input); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}

txn, err := Send(senderID, input)
if err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}

c.JSON(http.StatusOK, gin.H{
"message":     "transaction successful",
"transaction": txn,
})
}

func HistoryHandler(c *gin.Context) {
userID := c.GetString("user_id")

txns, err := GetHistory(userID)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
return
}

c.JSON(http.StatusOK, gin.H{"transactions": txns})
}

func BalanceHandler(c *gin.Context) {
userID := c.GetString("user_id")

balance, err := GetBalance(userID)
if err != nil {
c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
return
}

c.JSON(http.StatusOK, gin.H{"balance": balance})
}
