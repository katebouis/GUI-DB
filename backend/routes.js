const pool = require('./db')
const express = require('express');
const User = require('./models/users');
const UserController = require('./controllers/users');


/**
 * https://expressjs.com/en/guide/routing.html#express-router
 * 
 * A router is a special Express object that can be used to define how to route and manage
 * requests. We configure a router here to handle a few routes specific to students
 */


module.exports = function routes(app, logger) {
  // GET /
  // app.get('/', (req, res) => {
  //   res.status(200).send('Hello world!');
  // });

  app.post('/authadmin', async (req, res, next) => {
    try {
        const body = req.body;
        
        const result = await UserController.authenticateAdmin(body.email, body.password);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to authenticate admin:', err);
        res.status(500).json({ message: err.toString() });
    }

    next();
})

  app.get('/current', async (req, res, next) => {
    try {
        const user = req.user;
        const result = await User.findUserByEmail(user.email);
        res.status(201).send(result);
    } catch (err) {
        console.error('Failed to load current user:', err);
        res.sendStatus(500).send({ message: err.toString() });
    }
  });

  app.post('/create_user', async (req, res, next) => {
    try {
        console.log(req.body);
        const result = await User.createNewUser(req.body.username, req.body.email, req.body.name, req.body.password);
        res.status(201).send(result);
    } catch (err) {
        console.error('Failed to create new user:', err);
        res.status(500).send({ message: err.toString() });
    }

    next();
  });
  
  // POST /reset
  app.post('/reset', (req, res) => {
    // obtain a connection from our pool of connections
    pool.getConnection(function (err, connection){
      if (err){
        console.log(connection);
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error('Problem obtaining MySQL connection', err)
        res.status(400).send('Problem obtaining MySQL connection'); 
      } else {
        const router = express.Router();

        router.post('/', async (req, res, next) => {
            try {
                const body = req.body;
                console.log(body);
                const result = await req.models.user.createNewUser(body.email, body.password);
                res.status(201).send(result);
            } catch (err) {
                console.error('Failed to create new user:', err);
                res.status(500).send({ message: err.toString() });
            }

            next();
          });

        }
      });
    });
  });


  // POST /multplynumber
  app.post('/multplynumber', (req, res) => {
    console.log(req.body.product);
    // obtain a connection from our pool of connections
    pool.getConnection(function (err, connection){
      if(err){
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error('Problem obtaining MySQL connection',err)
        res.status(400).send('Problem obtaining MySQL connection'); 
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        connection.query('INSERT INTO `db`.`test_table` (`value`) VALUES(\'' + req.body.product + '\')', function (err, rows, fields) {
          connection.release();
          if (err) {
            // if there is an error with the query, log the error
            logger.error("Problem inserting into test table: \n", err);
            res.status(400).send('Problem inserting into table'); 
          } else {
            res.status(200).send(`added ${req.body.product} to the table!`);
          }
        });
      }
    });
  });
  
  app.post('/auth', async (req, res, next) => {
    try {
        const result = await User.authenticateUser(req.body.email, req.body.password);
        res.status(201).send(result);
    } catch (err) {
        console.error('Failed to authenticate user:', err);
        res.status(500).send({ message: err.toString() });
    }

    next();
});

  // GET /checkdb
  app.get('/values', (req, res) => {
    // obtain a connection from our pool of connections
    pool.getConnection(function (err, connection){
      if(err){
        // if there is an issue obtaining a connection, release the connection instance and log the error
        logger.error('Problem obtaining MySQL connection',err)
        res.status(400).send('Problem obtaining MySQL connection'); 
      } else {
        // if there is no issue obtaining a connection, execute query and release connection
        connection.query('SELECT value FROM `db`.`test_table`', function (err, rows, fields) {
          connection.release();
          if (err) {
            logger.error("Error while fetching values: \n", err);
            res.status(400).json({
              "data": [],
              "error": "Error obtaining values"
            })
          } else {
            res.status(200).json({
              "data": rows
            });
          }
        });
      }
    });
  });