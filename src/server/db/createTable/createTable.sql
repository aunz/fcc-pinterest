create table "user" (
  id int not null primary key,
  ts int not null default (strftime('%s','now')), -- created date, timestamp in epoch
  "name" text,
  email text check (email like '_%@_%._%'),
  gh int unique, -- github id, not login
  gh_name text check (length(trim(gh_name)) > 2), -- github name
  pw text, -- password
  token blob, -- hashed token 256 bits for user authentication, astronomically rare to collide, no need unique constraint
  token_ts int, -- ts when token is created
  token_ts_exp int -- ts when token SHOULD be expired
);
create unique index user_email on "user"(lower(email));
create unique index user_gh_name on "user"(lower(trim(gh_name)));

create table pin (
  id int not null primary key,
  ts int not null default (strftime('%s','now')),
  uid int not null references "user" (id),
  title text, -- the title of the pin
  url text not null check (url like '_%._%')
);
