package auth

import (
	"database/sql"
	"errors"
)

type auth struct {
	DB *sql.DB
}

func New(db *sql.DB) auth {
	return auth{db}
}

func (a auth) Authenticate(userId int, role string) error {

	desigId := 0
	query := `SELECT id from user_designation_mapping where user_id = ?`
	a.DB.QueryRow(query, userId).Scan(&desigId)
	if desigId == 0 {
		return errors.New("Not Authorized")
	}

	query = `SELECT name from roles inner join role_designation_mapping rd on rd.role_id =  roles.id WHERE rd.designation_id = ?`
	rows, err := a.DB.Query(query, desigId)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		r := ""
		rows.Scan(&r)
		if r == role {
			return nil
		}
	}
	return errors.New("Not Authorized")
}
