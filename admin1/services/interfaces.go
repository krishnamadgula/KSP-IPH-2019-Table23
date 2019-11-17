package services

type Auth interface {
	Auth(token, task string) error
}
