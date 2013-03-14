set :application, "toss"
set :repository, '.'

set :location, "78.47.197.109"

set :scm, :none

set :deploy_to, "/home/vood/#{application}"

set :deploy_env, :production

set :use_sudo, false

set :deploy_via, :copy

set :keep_releases, 10


# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

server "78.47.197.109", :app, :web, :db, :primary => true

set :user, "vood"
