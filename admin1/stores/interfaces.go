package stores

import (
	"github.com/KSP-IPH-2019-Table23/admin/entities"
)

type Role interface {
	List() ([]entities.Role, error)
	Read(id string) (entities.Role, error)
	Create(entity entities.Role) (entities.Role, error)
	Update(id string, entity entities.Role) (entities.Role, error)
	Delete(id string) error

	// TODO
	// AddRolesToDesignation(roles []int, designation int) (entities.DesignationRole, error)
	// RemoveRoleFromDesignation(role int, designation int) (entities.DesignationRole, error)
	// GetRolesOfDesignation(designation int) (entities.DesignationRole, error)
}

type User interface {
	List() ([]entities.User, error)
	Read(id string) (entities.User, error)
	Create(entity entities.User) (entities.User, error)
	Update(id string, entity entities.User) (entities.User, error)
	Delete(id string) error
}

type Designation interface {
	List() ([]entities.Designation, error)
	Read(id string) (entities.Designation, error)
	Create(entity entities.Designation) (entities.Designation, error)
	Update(id string, entity entities.Designation) (entities.Designation, error)
	Delete(id string) error
}
type Creds interface {
	Login(entity entities.Creds) (string, error)
	Authenticate(token string) (int, error)
}
type Auth interface {
	Authenticate(userId int, role string) error
}
