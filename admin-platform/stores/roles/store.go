package roles

import (
	"database/sql"
	"errors"
	"strconv"
	"time"

	"github.com/KSP-IPH-2019-Table23/admin/entities"
)

type role struct {
	DB *sql.DB
}

func New(db *sql.DB) role {
	return role{db}
}

func (r role) List() ([]entities.Role, error) {

	query := `SELECT id, name from roles `
	roles := make([]entities.Role, 0)

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		role := entities.Role{}
		rows.Scan(&role.ID, &role.Name)
		roles = append(roles, role)
	}

	return roles, nil
}

func (r role) Read(id string) (entities.Role, error) {

	query := `SELECT id, name from roles where id = ?`
	role := entities.Role{}

	err := r.DB.QueryRow(query, id).Scan(&role.ID, &role.Name)
	if err == sql.ErrNoRows {
		return role, errors.New("No role")
	}

	return role, nil

}

func (r role) Create(entity entities.Role) (entities.Role, error) {

	query := `INSERT INTO roles(id, name) VALUES(?,?)`
	role := entities.Role{}

	res, err := r.DB.Exec(query, entity.ID, entity.Name)
	if err != nil {
		return role, err
	}
	id, _ := res.LastInsertId()

	return r.Read(strconv.Itoa(int(id)))
}

func (r role) Update(id string, entity entities.Role) (entities.Role, error) {

	query := `UPDATE roles SET name = ? WHERE id = ?`
	role := entities.Role{}

	_, err := r.DB.Exec(query, entity.Name, id)
	if err != nil {
		return role, err
	}

	return r.Read(id)
}

func (r role) Delete(id string) error {

	query := `UPDATE roles SET deleted_at = ? WHERE id = ?`

	_, err := r.DB.Exec(query, time.Now(), id)
	if err != nil {
		return err
	}

	return nil

}
