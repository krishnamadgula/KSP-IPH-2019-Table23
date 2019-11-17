package authentication

import (
	"errors"

	"github.com/KSP-IPH-2019-Table23/admin/stores"
)

type auth struct {
	cStore stores.Creds
	aStore stores.Auth
}

func New(c stores.Creds, a stores.Auth) auth {
	return auth{c, a}
}

func (a auth) Auth(token, task string) error {

	userId, err := a.cStore.Authenticate(token)
	if err != nil {
		errors.New("Not Authorized")
	}

	err = a.aStore.Authenticate(userId, task)

	return err

}
