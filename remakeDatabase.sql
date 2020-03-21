-- command to run the script in terminal
-- 🔻 use this command whit your terminal is pointing at the root directory of your project
-- psql -U postgres -a -f remakeDatabase.sql

DROP DATABASE IF EXISTS typeorm;
DROP ROLE IF EXISTS type_user;

CREATE ROLE jim
WITH 
  LOGIN
  PASSWORD 'password'
  CREATEDB 
  SUPERUSER
  CREATEROLE
;

CREATE DATABASE typeorm
  WITH 
  OWNER = jim
  ENCODING = 'UTF8'
  CONNECTION LIMIT = -1
;