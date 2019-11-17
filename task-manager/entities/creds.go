package entities

type Creds struct {
	UserID    int
	UserPhone string `json:"phoneNumber"`
	Password  string `json:"password"`
}
