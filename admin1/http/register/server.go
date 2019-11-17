package register

import (
	"net/http"

	"github.com/KSP-IPH-2019-Table23/admin/services"
)

type register struct {
	a services.Auth
}

func New(a services.Auth) register {
	return register{a}
}

func (r register) Register(req *http.Request) error {

	token := req.Header.Get("Authorization")
	err := r.a.Auth(token, "register")

	if err != nil {
		return err
	}
	return nil
}
