package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/Sirupsen/logrus"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/labstack/gommon/log"

	server "github.com/KSP-IPH-2019-Table23/task-manager/http/task"
	aService "github.com/KSP-IPH-2019-Table23/task-manager/services/authentication"
	aStore "github.com/KSP-IPH-2019-Table23/task-manager/store/auth"
	cStore "github.com/KSP-IPH-2019-Table23/task-manager/store/creds"
	store "github.com/KSP-IPH-2019-Table23/task-manager/store/tasks"
)

var db *sql.DB

func main() {

	// loading the environment variables
	godotenv.Load("configs/.env")
	user := os.Getenv("DB_USER")
	host := os.Getenv("DB_HOST")
	pswd := os.Getenv("DB_PASSWORD")
	log := logrus.New()
	newDb(log, host, user, pswd)

	r := mux.NewRouter()
	// intializing all routes and their respective handlers

	r.HandleFunc("/task", getHandler).Methods("GET")
	r.HandleFunc("/task", createHandler).Methods("POST")
	r.HandleFunc("/task/{id}", updateHandler).Methods("PUT")
	r.HandleFunc("/verify/{id}", verifyHandler).Methods("PUT")

	err := http.ListenAndServe(":9023", r)

	if err != nil {
		log.Error("Coud not run the sever, err:", err)
		return
	}

}

func getHandler(w http.ResponseWriter, r *http.Request) {

	authStore := aStore.New(db)
	credStore := cStore.New(db)

	aSvc := aService.New(credStore, authStore)

	store := store.New(db)
	httpSever := server.New(store, aSvc)

	res, err := httpSever.List(r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)
}

func createHandler(w http.ResponseWriter, r *http.Request) {

	authStore := aStore.New(db)
	credStore := cStore.New(db)

	aSvc := aService.New(credStore, authStore)

	store := store.New(db)
	httpSever := server.New(store, aSvc)

	res, err := httpSever.Create(r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)

}

func updateHandler(w http.ResponseWriter, r *http.Request) {

	authStore := aStore.New(db)
	credStore := cStore.New(db)

	aSvc := aService.New(credStore, authStore)

	store := store.New(db)
	httpSever := server.New(store, aSvc)

	res, err := httpSever.Update(r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)

}

func verifyHandler(w http.ResponseWriter, r *http.Request) {
	authStore := aStore.New(db)
	credStore := cStore.New(db)

	aSvc := aService.New(credStore, authStore)

	store := store.New(db)
	httpSever := server.New(store, aSvc)

	err := httpSever.VerifyTask(r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode("SUCCESS")
}

func newDb(logger *logrus.Logger, host, user, password string) *sql.DB {

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local&interpolateParams=true",
		user,
		password,
		host,
		"3306",
		"tasks")
	log.Print("DB Connected. DSN:", dsn)

	var err error
	// Opening a driver typically will not attempt to connect to the database.
	db, err = sql.Open("mysql", dsn)

	if err != nil {
		log.Error("could not connect to sql db, err: ", err)
	}
	return db
}
