package store

import (
	"github.com/KSP-IPH-2019-Table23/task-manager/entities"
)

type Task interface {
	List() ([]entities.Task, error)
	Read(id string) (entities.Task, error)
	Create(t entities.Task) (entities.Task, error)
	Update(id string, t entities.Task) (entities.Task, error)
	VerifyTask(id string) error
}

type Creds interface {
	Login(entity entities.Creds) (string, error)
	Authenticate(token string) (int, error)
}
type Auth interface {
	Authenticate(userId int, role string) error
}
