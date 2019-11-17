package tasks

import (
	"database/sql"
	"errors"
	"strconv"
	"time"

	"github.com/KSP-IPH-2019-Table23/task-manager/entities"
)

type task struct {
	DB *sql.DB
}

func New(db *sql.DB) task {
	return task{db}
}

func (t task) List() ([]entities.Task, error) {

	query := `SELECT id,title,description,due_date,created_by,assignee,status,dependency_id,verified from tasks `
	tasks := make([]entities.Task, 0)

	rows, err := t.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		task := entities.Task{}
		t := time.Time{}
		rows.Scan(&task.ID, &task.Title, &task.Description, &t, &task.CreatedBy, &task.AssignedTo, &task.Status, &task.DependencyID, &task.Verfied)
		task.DueDate = t.Format("2006-01-02")
		tasks = append(tasks, task)
	}

	return tasks, nil

}
func (t task) Read(id string) (entities.Task, error) {

	query := `SELECT id,title,description,due_date,created_by,assignee,status,dependency_id,verified from tasks where id = ?`
	task := entities.Task{}

	tString := time.Time{}
	err := t.DB.QueryRow(query, id).Scan(&task.ID, &task.Title, &task.Description, &tString, &task.CreatedBy, &task.AssignedTo, &task.Status, &task.DependencyID, &task.Verfied)
	task.DueDate = tString.Format("2006-01-02")
	if err == sql.ErrNoRows {
		return task, errors.New("No task")
	}

	return task, nil

}

func (t task) Create(entity entities.Task) (entities.Task, error) {

	query := `INSERT INTO tasks(id,title,description,due_date,created_by,assignee,status,dependency_id) VALUES(?,?,?,?,?,?,?,?)`
	task := entities.Task{}

	if !entity.DependencyID.IsZero() {
		_, err := t.Read(strconv.Itoa(int(entity.DependencyID.Int64)))
		if err != nil {
			return task, errors.New("dependency does not exist")
		}
	}
	temp, _ := time.Parse("2006-02-01", entity.DueDate)
	res, err := t.DB.Exec(query, entity.ID, entity.Title, entity.Description, temp, entity.CreatedBy, entity.AssignedTo, entity.Status, entity.DependencyID)
	if err != nil {
		return task, err
	}
	id, _ := res.LastInsertId()

	return t.Read(strconv.Itoa(int(id)))
}

func (t task) Update(id string, entity entities.Task) (entities.Task, error) {

	task := entities.Task{}
	var values []interface{}

	query := `UPDATE tasks SET status = ?`
	values = append(values, entity.Status)

	if !entity.DependencyID.IsZero() {
		_, err := t.Read(strconv.Itoa(int(entity.DependencyID.Int64)))
		if err != nil {
			return task, errors.New("dependency does not exist")
		}
		query += ` ,dependency_id  = ? `
		values = append(values, entity.DependencyID.Int64)
	}
	query += ` WHERE id = ?`
	values = append(values, id)

	_, err := t.DB.Exec(query, values...)

	if err != nil {
		return task, err
	}

	return t.Read(id)
}

func (t task) VerifyTask(id string) error {

	res, err := t.Read(id)
	if err != nil {
		return err
	}
	if res.Status != "DONE" {
		return errors.New("task is not yet done to verify")
	}

	query := `UPDATE tasks SET verified = ? where id = ?`
	_, err = t.DB.Exec(query, true, id)

	return err
}
