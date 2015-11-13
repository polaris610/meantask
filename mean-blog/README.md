mean-blog
==============

Demonstration of the MEAN stack with a simple blog app.

Install Mongo
==============

http://docs.mongodb.org/manual/installation/


Sample Data
==============

Import sample data:

```mongoimport -h localhost -d mean-blog -c posts data/posts.json```

Running
==============

From within project root, run ```node app.js```. Navigate to localhost:3000/posts to view demo.
