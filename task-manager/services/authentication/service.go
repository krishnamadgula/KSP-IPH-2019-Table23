package authentication

import (
	"errors"

	"github.com/KSP-IPH-2019-Table23/task-manager/store"
)

type auth struct {
	cStore store.Creds
	aStore store.Auth
}

func New(c store.Creds, a store.Auth) auth {
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
