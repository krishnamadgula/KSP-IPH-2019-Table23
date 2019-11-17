package creds

import (
	"crypto/md5"
	"database/sql"
	"errors"
	"fmt"

	"github.com/KSP-IPH-2019-Table23/task-manager/entities"
)

type creds struct {
	DB *sql.DB
}

var pswdToken = map[string]int{
	"4c2933e1c49a3399710fa7105f12f12f": 1,
	"4f7abf980e59da322c604f16ac4a307c": 2,
	"de7e22d29a9351206ad5ed2658ccd64e": 3,
}

func New(db *sql.DB) creds {
	return creds{db}
}
func (c creds) Login(entity entities.Creds) (string, error) {

	userId := 0
	query := `SELECT id from users where phone_number = ?`
	err := c.DB.QueryRow(query, entity.UserPhone).Scan(&userId)
	if err != nil {
		return "", err
	}

	id := 0
	query = `SELECT id from creds where password = ? AND user_id = ?`
	err = c.DB.QueryRow(query, entity.Password, userId).Scan(&id)
	if err != nil {
		return "", err
	}
	if id == 0 {
		return "", errors.New("Invalid credentials")
	}
	token := generateHash(entity.Password)

	return token, nil
}

func generateHash(pswd string) string {

	data := `our secret key` + pswd
	hash := md5.Sum([]byte(data))

	return fmt.Sprintf("%x", hash)
}

func (c creds) Authenticate(token string) (int, error) {

	userId, _ := pswdToken[token]
	if userId == 0 {
		return userId, errors.New("Not Authorized")
	}

	return userId, nil
}
