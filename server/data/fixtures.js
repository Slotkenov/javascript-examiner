/**
 * Checks if there are exercises present, and in case there are not, add some
 * example exercises.
 */

var async = require('async');
var database = require('../database.js');
var collections = require('./collections');

// Asynchronously adds users and exercises to the database
async.series(
  [
    // Uncomment to add fixtures to testdatabase:
    /*function(callback) {
      database.connect('test', function() {
        callback();
      });
    }, */
    function(callback) {
      database.getUsers(null, function(err, res) {
        if (err) {
          callback(err);
        }
        if (res.length === 0) {
          addUsers(callback);
        } else {
          console.log('Already users present, added none');
          callback();
        }
      });
    },
    function(callback) {
      database.getExercises(null, function(err, res) {
        if (err) {
          callback(err);
        }
        if (res.length === 0) {
          addExercises(callback);
        } else {
          console.log('Already exercises present, added none');
          callback();
        }
      });
    }
  ],
  function(errs, results) {
    if (errs) {
      console.log('Errors were encountered while processing fixtures');
      if (typeof errs === 'function') {
        errs.forEach(function(err) {
          throw err;
        });
      } else {
        throw errs;
      }
    } else {
      console.log('All fixtures processed successfully');
    }
    process.exit();
  }
);

/**
 * Adds the users.
 * @param {function} callback
 */
function addUsers(callback) {
  var users = [
    {
      email: 'tutor',
      password: 'tutor',
      roles: ['tutor']
    },
    {
      email: 'student',
      password: 'student',
      roles: ['student']
    }
  ];
  var processed = 0;
  var errs = [];
  users.forEach(function(user) {
    database.putUser(user, function(err, res) {
      if (err) {
        errs.push(err);
      }
      processed += 1;
      if (processed === users.length) {
        if (!errs.length) {
          console.log('User fixtures pushed succesfully, added', processed);
          callback();
        } else {
          callback(errs);
        }
      }
    });
  });
}

/**
 * Adds the exercises.
 * @param {function} callback
 */
function addExercises(callback) {
  var exercise1 = {
    chapter: 5,
    number: 1,
    name: 'Bereken oppervlakte circel',
    description: 'Schrijf een pure functie die de oppervlakte van een' +
      'circel berekent',
    functions: [{name: 'berekenOppervlakteCircle', params: [{name: 'straal'}]}],
    testSuite: {
      code: ''
    },
    modelSolution: {
      code: ''
    }
  };
  var exercise2 = {
    chapter: 5,
    number: 2,
    name: 'Genereer is wortel van x functies',
    description: 'Schrijf een functie isWortelVan() met een numerieke ' +
      'parameter n waarmee getest kan worden of n een worel is van g',
    functions: [{name: 'isWortelVan', params: [{name: 'n'}]}],
    testSuite: {
      code: ''
    },
    modelSolution: {
      code: ''
    }
  };
  var exercise3 = {
    chapter: 5,
    number: 4,
    name: 'Object naar string',
    description: 'Schrijf een functie toString() met parameter obj ' +
      'die van het object obj een string representatie terug geeft in de ' +
      'vorm: "property1" = "value van property1", "property 2" = "' +
      'value van property2", "propertyN" = "value van propertyN" ',
    functions: [{name: 'toString', params: [{name: 'obj'}]}],
    testSuite: {
      code: ''
    },
    modelSolution: {
      code: ''
    }
  };
  var exercise4 = {
    chapter: 5,
    number: 5,
    name: 'Bereken Bmi',
    description: 'Schrijf een functie calcBMI() met parameters lengte ' +
      'en gewicht, die het BMI teruggeeft.',
    functions: [
      {
        name: 'calcBMI',
        params: [{name: 'lengte'}, {name: 'gewicht'}]
      },
      {
        name: 'calcBMI2',
        params: [{name: 'ipsum'}, {name: 'lorem'}]
      }
    ],
    testSuite: {
      code: '\n' +
        'describe(\'calcBMI function\', function() {\n' +
        '  it(\'should have been defined\', function() {\n' +
        '    expect(studentCode.calcBMI).to.be.a(\'function\');\n' +
        '  });\n' +
        '});\n'
    },
    modelSolution: {
      code: ''
    }
  };
  var exercises = [exercise1, exercise2, exercise3, exercise4];
  var processed = 0;
  var errs = [];
  exercises.forEach(function(exercise) {
    database.putExercise(exercise, function(err, res) {
      if (err) {
        errs.push(err);
      }
      processed += 1;
      if (processed === exercises.length) {
        if (!errs.length) {
          console.log('Exercise fixtures pushed succesfully, added', processed);
          callback();
        } else {
          callback(errs);
        }
      }
    });
  });
}
