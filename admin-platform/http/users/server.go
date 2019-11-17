package users

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"path"

	"github.com/KSP-IPH-2019-Table23/admin/entities"
	"github.com/KSP-IPH-2019-Table23/admin/stores"
)

type user struct {
	store stores.User
}

func New(s stores.User) user {
	return user{s}
}

func (r user) List(req *http.Request) ([]entities.User, error) {

	res, err := r.store.List()
	if err != nil {
		return nil, err
	}

	return res, nil
}
func (r user) Read(req *http.Request) (entities.User, error) {

	id := path.Base(req.URL.Path)

	res, err := r.store.Read(id)
	if err != nil {
		return entities.User{}, err
	}

	return res, nil
}
func (r user) Create(req *http.Request) (entities.User, error) {

	user := entities.User{}
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return user, err
	}

	json.Unmarshal(body, &user)
	res, err := r.store.Create(user)
	if err != nil {
		return entities.User{}, err
	}

	return res, nil
}

func (r user) Update(req *http.Request) (entities.User, error) {

	id := path.Base(req.URL.Path)
	user := entities.User{}

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return user, err
	}

	json.Unmarshal(body, &user)
	res, err := r.store.Update(id, user)
	if err != nil {
		return entities.User{}, err
	}

	return res, nil
}

func (r user) Delete(req *http.Request) error {

	id := path.Base(req.URL.Path)
	err := r.store.Delete(id)

	if err != nil {
		return err
	}

	return nil
}
