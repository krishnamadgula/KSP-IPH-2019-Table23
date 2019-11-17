package entities

type Role struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type DesignationRole struct {
	Designation Designation `json:"designation"`
	Roles       []Role      `json:"role"`
}
