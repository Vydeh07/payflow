package auth

import (
"database/sql"
"errors"
"os"
"time"

"github.com/golang-jwt/jwt/v5"
"golang.org/x/crypto/bcrypt"

"github.com/Vydeh07/payflow/pkg/database"
)

type User struct {
ID        string    `json:"id"`
Username  string    `json:"username"`
Email     string    `json:"email"`
Balance   float64   `json:"balance"`
CreatedAt time.Time `json:"created_at"`
}

type RegisterInput struct {
Username string `json:"username" binding:"required,min=3"`
Email    string `json:"email"    binding:"required,email"`
Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
Email    string `json:"email"    binding:"required,email"`
Password string `json:"password" binding:"required"`
}

func Register(input RegisterInput) (string, error) {
hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
if err != nil {
return "", errors.New("failed to hash password")
}

var userID string
query := `
INSERT INTO users (username, email, password)
VALUES ($1, $2, $3)
RETURNING id
`
err = database.DB.QueryRow(query, input.Username, input.Email, string(hashed)).Scan(&userID)
if err != nil {
return "", errors.New("username or email already exists")
}

return generateToken(userID)
}

func Login(input LoginInput) (string, *User, error) {
var user User
var hashedPassword string

query := `
SELECT id, username, email, balance, password, created_at
FROM users WHERE email = $1
`
err := database.DB.QueryRow(query, input.Email).Scan(
&user.ID, &user.Username, &user.Email,
&user.Balance, &hashedPassword, &user.CreatedAt,
)
if err == sql.ErrNoRows {
return "", nil, errors.New("invalid email or password")
}
if err != nil {
return "", nil, errors.New("database error")
}

if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(input.Password)); err != nil {
return "", nil, errors.New("invalid email or password")
}

token, err := generateToken(user.ID)
if err != nil {
return "", nil, err
}

return token, &user, nil
}

func generateToken(userID string) (string, error) {
claims := jwt.MapClaims{
"user_id": userID,
"exp":     time.Now().Add(24 * time.Hour).Unix(),
}

token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
