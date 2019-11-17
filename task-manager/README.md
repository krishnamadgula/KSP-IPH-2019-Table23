# Task Manager

Task Manager is a micro-service that is completly written in GoLang. The only responsibility that this service handles is to manage the tasks right from creating, monitoring and verifying the tasks.
This is done to enfoce a SCRUM like practice in the police department.

# Features:
  - Create, List and update tasks.
  - Add status to tasks like PENDING, DOING, DONE
  - Assign tickets to a lower sub ordinate
  - Create dependency for a ticket
  - A task can be verified once done through an external event.
  - Access to this is entirely based on roles. For example only a person like an SP can have permissions to create a task. Lower subordinates can only view tasks and update them. Only registered users can access this.

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

Install the dependencies using : 
        -go get -v ./... (make sure you are in the project directory)

 Command to run the test
   - go test ./...       

```sh
$ cd task-manager
$ go get ./... -v 
$ go build main.go
$ ./main
```


