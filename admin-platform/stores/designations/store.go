package designations

import (
	"database/sql"
	"errors"
	"strconv"
	"time"

	"github.com/KSP-IPH-2019-Table23/admin/entities"
)

type designation struct {
	DB *sql.DB
}

func New(db *sql.DB) designation {
	return designation{db}
}

func (d designation) List() ([]entities.Designation, error) {

	query := `SELECT id, name from designations `
	designations := make([]entities.Designation, 0)

	rows, err := d.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		designation := entities.Designation{}
		rows.Scan(&designation.ID, &designation.Name)
		designations = append(designations, designation)
	}

	return designations, nil
}

func (d designation) Read(id string) (entities.Designation, error) {

	query := `SELECT id, name from designations where id = ?`
	designation := entities.Designation{}

	err := d.DB.QueryRow(query, id).Scan(&designation.ID, &designation.Name)
	if err == sql.ErrNoRows {
		return designation, errors.New("No designation")
	}

	return designation, nil

}

func (d designation) Create(entity entities.Designation) (entities.Designation, error) {

	query := `INSERT INTO designations(id, name) VALUES(?,?)`
	designation := entities.Designation{}

	res, err := d.DB.Exec(query, entity.ID, entity.Name)
	if err != nil {
		return designation, err
	}
	id, _ := res.LastInsertId()

	return d.Read(strconv.Itoa(int(id)))
}

func (d designation) Update(id string, entity entities.Designation) (entities.Designation, error) {

	query := `UPDATE designations SET name = ? WHERE id = ?`
	designation := entities.Designation{}

	_, err := d.DB.Exec(query, entity.Name, id)
	if err != nil {
		return designation, err
	}

	return d.Read(id)
}

func (d designation) Delete(id string) error {

	query := `UPDATE designations SET deleted_at = ? WHERE id = ?`

	_, err := d.DB.Exec(query, time.Now(), id)
	if err != nil {
		return err
	}

	return nil

}
