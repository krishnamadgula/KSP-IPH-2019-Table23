# Admin Management

Admin Management is a micro-service that is completly written in GoLang. The only responsibility that this service handles is to manage  users, roles, designation, login and authentication. The admin will use this console to register users and few users with certain designations can view chats. 

# Features:
  - Create, List, Update and delete users.
  - Create, List, Update and delete designations.
  - Create, List, Update and delete roles.
  - Every user will login and this will generate a token which allows us to give role based access
  - Allows users to to map a user to designations


# SOLID PRINCIPLE
All code written follows a SOLID principle architecture. 

 - S - Single-responsiblity principle
 - O - Open-closed principle (Objects or entities should be open for extension, but closed for modification)
 - L - Liskov substitution principle 
 - I - Interface segregation principle
 - D - Dependency Inversion Principle

 3 layer arctitecture has been followed.
 - Delivery Layer : http/grpc
 - Service Layer : business logic/inter-service calls
 - Store Layer: storage


### Installation

Task Manager requires [GoLang](https://golang.org/) v 1.13+ to run.

Install a mysql server. 

Environment variables must be injected through the configs/env file that is present 
- DB_HOST 
- DB_PASSWORD
- DB_USER

Install the dependencies using : 
        -go get -v ./... (make sure you are in the project directory)sg

 Command to run the test
   - go test ./...       

```sh
$ cd task-manager
$ go get ./... -v 
$ go build main.go
$ ./main
```


