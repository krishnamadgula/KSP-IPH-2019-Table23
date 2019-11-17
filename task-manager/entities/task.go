package entities

import "github.com/guregu/null"

type Task struct {
	ID           int      `json:"id"`
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Status       string   `json:"status"`
	DueDate      string   `json:"dueDate"`
	AssignedTo   string   `json:"assignee"`
	CreatedBy    string   `json:"createdBy"`
	DependencyID null.Int `json:"dependencyId"`
	Verfied      bool     `json:"verified"`
}
