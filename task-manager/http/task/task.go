package task

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"path"

	"github.com/KSP-IPH-2019-Table23/task-manager/entities"
	"github.com/KSP-IPH-2019-Table23/task-manager/services"
	"github.com/KSP-IPH-2019-Table23/task-manager/store"
)

type task struct {
	store    store.Task
	aService services.Auth
}

func New(s store.Task, a services.Auth) task {
	return task{s, a}
}

func (t task) List(r *http.Request) ([]entities.Task, error) {

	token := r.Header.Get("Authorization")

	err := t.aService.Auth(token, "view task")
	if err != nil {
		return nil, err
	}

	res, err := t.store.List()
	if err != nil {
		return nil, err
	}

	return res, nil
}
func (t task) Read(r *http.Request) (entities.Task, error) {

	id := path.Base(r.URL.Path)

	res, err := t.store.Read(id)
	if err != nil {
		return entities.Task{}, err
	}

	return res, nil
}
func (t task) Create(r *http.Request) (entities.Task, error) {

	token := r.Header.Get("Authorization")

	err := t.aService.Auth(token, "create a task")
	if err != nil {
		return entities.Task{}, err
	}

	task := entities.Task{}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return task, err
	}

	json.Unmarshal(body, &task)
	res, err := t.store.Create(task)
	if err != nil {
		return entities.Task{}, err
	}

	return res, nil
}

func (t task) Update(r *http.Request) (entities.Task, error) {

	token := r.Header.Get("Authorization")

	err := t.aService.Auth(token, "update task")
	if err != nil {
		return entities.Task{}, err
	}

	id := path.Base(r.URL.Path)
	task := entities.Task{}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return task, err
	}

	json.Unmarshal(body, &task)
	res, err := t.store.Update(id, task)
	if err != nil {
		return entities.Task{}, err
	}

	return res, nil
}

func (t task) VerifyTask(r *http.Request) error {

	id := path.Base(r.URL.Path)
	err := t.store.VerifyTask(id)

	return err
}
