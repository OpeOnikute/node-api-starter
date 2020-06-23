db = new Mongo().getDB("admin");

// create admin user
db.createUser({
  user: "admin",
  pwd: "pass",
  roles: [{
    role: "clusterAdmin",
    db: "admin"
  }]
});

db = new Mongo().getDB("node-api-starter");

db.createUser({
    user: "opeo",
    pwd: "root",
    roles: [
        {
            role: "dbOwner",
            db: "node-api-starter"
        }
    ]
});