package designation

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"path"

	"github.com/KSP-IPH-2019-Table23/admin/entities"
	"github.com/KSP-IPH-2019-Table23/admin/stores"
)

type designation struct {
	store stores.Designation
}

func New(s stores.Designation) designation {
	return designation{s}
}

func (d designation) List(req *http.Request) ([]entities.Designation, error) {

	res, err := d.store.List()
	if err != nil {
		return nil, err
	}

	return res, nil
}
func (d designation) Read(req *http.Request) (entities.Designation, error) {

	id := path.Base(req.URL.Path)

	res, err := d.store.Read(id)
	if err != nil {
		return entities.Designation{}, err
	}

	return res, nil
}
func (d designation) Create(req *http.Request) (entities.Designation, error) {

	designation := entities.Designation{}
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return designation, err
	}

	json.Unmarshal(body, &designation)
	res, err := d.store.Create(designation)
	if err != nil {
		return entities.Designation{}, err
	}

	return res, nil
}

func (d designation) Update(req *http.Request) (entities.Designation, error) {

	id := path.Base(req.URL.Path)
	designation := entities.Designation{}

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return designation, err
	}

	json.Unmarshal(body, &designation)
	res, err := d.store.Update(id, designation)
	if err != nil {
		return entities.Designation{}, err
	}

	return res, nil
}

func (d designation) Delete(req *http.Request) error {

	id := path.Base(req.URL.Path)
	err := d.store.Delete(id)

	if err != nil {
		return err
	}

	return nil
}
