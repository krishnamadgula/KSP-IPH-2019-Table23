package roles

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"path"

	"github.com/KSP-IPH-2019-Table23/admin/entities"
	"github.com/KSP-IPH-2019-Table23/admin/services"
	"github.com/KSP-IPH-2019-Table23/admin/stores"
)

type role struct {
	store stores.Role
	creds stores.Creds
	aSvc  services.Auth
}

func New(s stores.Role, c stores.Creds, a services.Auth) role {
	return role{s, c, a}
}

func (r role) List(req *http.Request) ([]entities.Role, error) {

	token := req.Header.Get("Authorization")

	err := r.aSvc.Auth(token, "list role")
	if err != nil {
		return nil, err
	}

	res, err := r.store.List()
	if err != nil {
		return nil, err
	}

	return res, nil
}
func (r role) Read(req *http.Request) (entities.Role, error) {

	id := path.Base(req.URL.Path)

	res, err := r.store.Read(id)
	if err != nil {
		return entities.Role{}, err
	}

	return res, nil
}
func (r role) Create(req *http.Request) (entities.Role, error) {

	token := req.Header.Get("Authorization")

	err := r.aSvc.Auth(token, "create role")
	if err != nil {
		return entities.Role{}, err
	}

	role := entities.Role{}
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return role, err
	}

	json.Unmarshal(body, &role)
	res, err := r.store.Create(role)
	if err != nil {
		return entities.Role{}, err
	}

	return res, nil
}

func (r role) Update(req *http.Request) (entities.Role, error) {

	id := path.Base(req.URL.Path)
	role := entities.Role{}

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return role, err
	}

	json.Unmarshal(body, &role)
	res, err := r.store.Update(id, role)
	if err != nil {
		return entities.Role{}, err
	}

	return res, nil
}

func (r role) Delete(req *http.Request) error {

	id := path.Base(req.URL.Path)
	err := r.store.Delete(id)

	if err != nil {
		return err
	}

	return nil
}
