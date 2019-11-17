package users

import (
	"database/sql"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/guregu/null"

	"github.com/KSP-IPH-2019-Table23/admin/entities"
)

type user struct {
	DB *sql.DB
}

func New(db *sql.DB) user {
	return user{db}
}

func (u user) List() ([]entities.User, error) {

	query := `SELECT id, name, age, phone_number, designation_id, supervisor_id from users `
	users := make([]entities.User, 0)

	rows, err := u.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		user := entities.User{}
		var supId, desigId null.Int
		rows.Scan(&user.ID, &user.Name, &user.Age, &user.PhoneNumber, &desigId, &supId)

		if !supId.IsZero() {
			sup, _ := u.Read(strconv.Itoa(int(supId.Int64)))
			user.Supervisor = &sup
		}

		//TO-DO designation
		user.Supervisor = &entities.User{}
		user.Supervisor.ID, user.Designation.ID = int(supId.Int64), int(desigId.Int64)
		users = append(users, user)
	}

	return users, nil
}

func (u user) Read(id string) (entities.User, error) {

	query := `SELECT id, name, age, phone_number, designation_id, supervisor_id from users where id = ?`
	user := entities.User{}

	var supId, desigId null.Int
	err := u.DB.QueryRow(query, id).Scan(&user.ID, &user.Name, &user.Age, &user.PhoneNumber, &desigId, &supId)

	if err == sql.ErrNoRows {
		return user, errors.New("No user")
	}
	if !supId.IsZero() {
		sup, _ := u.Read(strconv.Itoa(int(supId.Int64)))
		user.Supervisor = &sup
	}

	return user, nil

}

func (r user) Create(entity entities.User) (entities.User, error) {

	query := `INSERT INTO users(id, name, phone_number,age,supervisor_id,designation_id) VALUES(?,?,?,?,?,?)`
	user := entities.User{}

	var supId null.Int

	if entity.Supervisor != nil && entity.Supervisor.ID != 0 {
		supId.Int64 = int64(entity.Supervisor.ID)
		supId.Valid = true
	}

	res, err := r.DB.Exec(query, entity.ID, entity.Name, entity.PhoneNumber, entity.Age, supId, entity.Designation.ID)
	if err != nil {
		return user, err
	}
	id, _ := res.LastInsertId()

	return r.Read(strconv.Itoa(int(id)))
}

func (r user) Update(id string, entity entities.User) (entities.User, error) {

	query := `UPDATE users SET `
	var values []interface{}

	if entity.Name != "" {
		query += ` name = ? ,`
		values = append(values, entity.Name)
	}

	if entity.Designation.ID != 0 {
		query += ` designation_id = ? ,`
		values = append(values, entity.Designation.ID)
	}

	if entity.Supervisor != nil && entity.Supervisor.ID != 0 {
		query += ` supervisor_id = ? ,`
		values = append(values, entity.Supervisor.ID)
	}
	query = strings.TrimSuffix(query, ",")
	query += " WHERE id = ?"

	values = append(values, id)

	_, err := r.DB.Exec(query, values...)
	if err != nil {
		return entities.User{}, err
	}

	return r.Read(id)
}

func (r user) Delete(id string) error {

	query := `UPDATE users SET deleted_at = ? WHERE id = ?`

	_, err := r.DB.Exec(query, time.Now(), id)
	if err != nil {
		return err
	}

	return nil

}
