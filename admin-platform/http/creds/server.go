package creds

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/KSP-IPH-2019-Table23/admin/entities"
	"github.com/KSP-IPH-2019-Table23/admin/stores"
)

type creds struct {
	store stores.Creds
}

func New(s stores.Creds) creds {
	return creds{s}
}

func (d creds) Login(req *http.Request) (string, error) {

	creds := entities.Creds{}
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return "", err
	}

	json.Unmarshal(body, &creds)
	res, err := d.store.Login(creds)
	if err != nil {
		return "", err
	}

	return res, nil
}
