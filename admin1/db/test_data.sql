USE admin;

insert into designations (id,name) VALUES (1,'admin');
insert into designations (id,name) VALUES (2,'sp');
insert into designations (id,name) VALUES (3,'inspector');

insert into roles (id,name) VALUES (1,'register');
insert into roles (id,name) VALUES (2,'list role');
insert into roles (id,name) VALUES (3,'create role');


insert into users (id,name,phone_number,designation_id) VALUES (1,'Admin guy','4657890218',1);
insert into users (id,name,phone_number,designation_id) VALUES (2,'SP Kumar','5467890987',2);
insert into users (id,name,phone_number,designation_id) VALUES (3,'Jay','3490875463',3);


insert into creds (id,user_id,password) values (1,1,'admin123');
insert into creds (id,user_id,password) values (2,2,'Dash123');
insert into creds (id,user_id,password) values (3,3,'Insp123');


insert into user_designation_mapping (designation_id,user_id) VALUES (1,1);
insert into user_designation_mapping (designation_id,user_id) VALUES (2,2);
insert into user_designation_mapping (designation_id,user_id) VALUES (3,3);


insert into role_designation_mapping (role_id,designation_id) VALUES (1,1);
insert into role_designation_mapping (role_id,designation_id) VALUES (1,2);

insert into role_designation_mapping (designation_id,role_id) VALUES (1,1);
insert into role_designation_mapping (designation_id,role_id) VALUES (1,2);
insert into role_designation_mapping (designation_id,role_id) VALUES (1,3);
insert into role_designation_mapping (designation_id,role_id) VALUES (2,2);
insert into role_designation_mapping (designation_id,role_id) VALUES (2,3);
insert into role_designation_mapping (designation_id,role_id) VALUES (3,2);


insert into role_designation_mapping (designation_id,role_id) VALUES (2,4);
insert into role_designation_mapping (designation_id,role_id) VALUES (2,5);
insert into role_designation_mapping (designation_id,role_id) VALUES (2,6);
insert into role_designation_mapping (designation_id,role_id) VALUES (3,6);
insert into role_designation_mapping (designation_id,role_id) VALUES (3,5);
