package entities

import "github.com/guregu/null"

type User struct {
	ID          int         `json:"id"`
	Name        string      `json:"name"`
	Age         null.Int    `json:"age"`
	PhoneNumber string      `json:"phoneNumber"`
	Designation Designation `json:"designation"`
	Supervisor  *User       `json:"supervisor,omitempty"`
}
