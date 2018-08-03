create table "user" (
  id int not null primary key, --convert to base36 when sent to client
  ts int not null default (strftime('%s','now')), -- created date, timestamp in epoch
  "name" text not null check(trim(name) <> ''),
  email text not null unique check(trim(email) <> ''), -- all lovercase
  loc text,
  pw text not null, -- password
  token blob unique, -- hashed token for user authentication, very likely unique
  token_ts int, -- ts when token is created
  token_ts_exp int -- ts when token SHOULD be expired
);


