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

	credServer "github.com/KSP-IPH-2019-Table23/admin/http/creds"
	designationServer "github.com/KSP-IPH-2019-Table23/admin/http/designations"
	registerServer "github.com/KSP-IPH-2019-Table23/admin/http/register"
	roleServer "github.com/KSP-IPH-2019-Table23/admin/http/roles"
	userServer "github.com/KSP-IPH-2019-Table23/admin/http/users"
	authServer "github.com/KSP-IPH-2019-Table23/admin/services/authentication"
	"github.com/KSP-IPH-2019-Table23/admin/stores/auth"
	"github.com/KSP-IPH-2019-Table23/admin/stores/creds"
	"github.com/KSP-IPH-2019-Table23/admin/stores/designations"
	"github.com/KSP-IPH-2019-Table23/admin/stores/roles"
	"github.com/KSP-IPH-2019-Table23/admin/stores/users"
)

var db *sql.DB

func main() {

	// loading the environment variables
	godotenv.Load("configs/.env")
	user := os.Getenv("DB_USER")
	host := os.Getenv("DB_HOST")
	pswd := os.Getenv("DB_PASSWORD")

	// initializing the database
	newDb(host, user, pswd)

	r := mux.NewRouter()
	// intializing all routes and their respective handlers

	r.HandleFunc("/role", getPostRoleHandler).Methods("GET", "POST")
	r.HandleFunc("/role/{id}", updateDeleteRoleHandler).Methods("PUT", "DELETE")

	r.HandleFunc("/designation", getPostDesignationHandler).Methods("GET", "POST")
	r.HandleFunc("/designation/{id}", updateDeleteDesignationHandler).Methods("PUT", "DELETE")

	r.HandleFunc("/user", getPostUserHandler).Methods("GET", "POST")
	r.HandleFunc("/user/{id}", updateDeleteUserHandler).Methods("PUT", "DELETE")

	r.HandleFunc("/register", register)
	r.HandleFunc("/login", login)

	log.Info("Running server on 9024")
	err := http.ListenAndServe(":9024", r)
	log := logrus.New()

	if err != nil {
		log.Error("Coud not run the sever, err:", err)
		return
	}

}

func login(w http.ResponseWriter, r *http.Request) {
	cStore := creds.New(db)
	server := credServer.New(cStore)

	res, err := server.Login(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)

}
func register(w http.ResponseWriter, r *http.Request) {
	aStore := auth.New(db)
	cStore := creds.New(db)
	aSvc := authServer.New(cStore, aStore)
	s := registerServer.New(aSvc)

	err := s.Register(r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode("SUCCESS")
}

func getPostRoleHandler(w http.ResponseWriter, r *http.Request) {

	aStore := auth.New(db)
	store := roles.New(db)
	cStore := creds.New(db)

	aSvc := authServer.New(cStore, aStore)

	server := roleServer.New(store, cStore, aSvc)

	var res interface{}
	var err error

	if r.Method == "GET" {
		res, err = server.List(r)
	} else {
		res, err = server.Create(r)
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)
}

func updateDeleteRoleHandler(w http.ResponseWriter, r *http.Request) {

	aStore := auth.New(db)
	store := roles.New(db)
	cStore := creds.New(db)

	aSvc := authServer.New(cStore, aStore)

	server := roleServer.New(store, cStore, aSvc)

	var res interface{}
	var err error

	if r.Method == "PUT" {
		res, err = server.Update(r)
	} else {
		err = server.Delete(r)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-type", "json")
	if res == nil {
		res = "SUCCESS"
	}
	_ = json.NewEncoder(w).Encode(res)

}

func getPostDesignationHandler(w http.ResponseWriter, r *http.Request) {
	store := designations.New(db)
	httpSever := designationServer.New(store)

	var res interface{}
	var err error

	if r.Method == "GET" {
		res, err = httpSever.List(r)
	} else {
		res, err = httpSever.Create(r)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)
}

func updateDeleteDesignationHandler(w http.ResponseWriter, r *http.Request) {

	store := designations.New(db)
	httpSever := designationServer.New(store)

	var res interface{}
	var err error

	if r.Method == "PUT" {
		res, err = httpSever.Update(r)
	} else {
		err = httpSever.Delete(r)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if res == nil {
		res = "SUCCESS"
	}
	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)

}

func getPostUserHandler(w http.ResponseWriter, r *http.Request) {
	store := users.New(db)
	httpSever := userServer.New(store)

	var res interface{}
	var err error

	if r.Method == "GET" {
		res, err = httpSever.List(r)
	} else {
		res, err = httpSever.Create(r)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)
}

func updateDeleteUserHandler(w http.ResponseWriter, r *http.Request) {

	store := users.New(db)
	httpSever := userServer.New(store)

	var res interface{}
	var err error

	if r.Method == "PUT" {
		res, err = httpSever.Update(r)
	} else {
		err = httpSever.Delete(r)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if res == nil {
		res = "SUCCESS"
	}

	w.Header().Set("Content-type", "json")
	_ = json.NewEncoder(w).Encode(res)

}

func newDb(host, user, password string) *sql.DB {
	log := logrus.New()
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local&interpolateParams=true",
		user,
		password,
		host,
		"3306",
		"admin")
	log.Info("DB Connected. DSN:", dsn)

	var err error
	// Opening a driver typically will not attempt to connect to the database.
	db, err = sql.Open("mysql", dsn)

	if err != nil {
		log.Error("could not connect to sql db, err: ", err)
	}
	return db
}
