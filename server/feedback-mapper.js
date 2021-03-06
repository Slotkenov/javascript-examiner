var fs = require('fs');
var description;
var module;

/**
 * Replaces raw feedback messages with customized text messages
 * defined in a separate file for each check.
 *
 * @param {string} check The check the feedback came from.
 * @param {Array.<Object>} feedback The feedback received
 *                                  from running the check.
 * @param {function} cb
 */
module.exports = function(check, feedback, cb) {
  var src;
  var trg;
  var pos;
  var callback = function(value) {
    cb(value);
  };
  searchError(check, feedback, callback);
};

/**
 * Builds the name and path of the file
 * that contains the custom feedback messages for the given check.
 *
 * @param {string} name The name of the check.
 */
function generateFileName(name) {
  var localName = './server/';
  localName = localName.concat(name);
  localName = localName.concat('-feedback');
  return localName;
}

function createFile(filename, callback) {
  fs.writeFile(filename, '', function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

/**
 * Checks if the file, containing the feedback messages for the given check,
 * exists.
 *
 * @param {string} name The name of the check.
 */
function checkFile(name) {
  var fn = generateFileName(name);
  fs.exists(fn, function(err) {
    console.log(err);
  });
}

/**
 * Replaces raw feedback messages with customized text messages
 * defined in a separate file for each check.
 *
 * @param {string} module The check the feedback came from.
 * @param {Array.<Object>} feedback The feedback received
 *                                  from running the check.
 * @param {function} callback
 */
function searchError(module, feedback, callback) {
  // search for error,
  // if not found create error with description is equal to error
  // read file and put the content in an array
  // then check the feedback with items from the array
  // if found, replace feedback with entrance
  // otherwise, add feedback to file
  var fn = generateFileName(module);
  fs.open(fn, 'a+', function() {
    fs.readFile(fn, function(err, buf) {
      if (err) {
        return console.log(err);
      }
      var fbList = [];
      var eui; // element under investigation
      var jsonData = {};
      var text = buf.toString().trim();
      if (text !== '') {
        jsonData = JSON.parse(text);
      }
      feedback.forEach(function(fb) {
        switch (module) {
          case 'check-syntax':
            eui = fb.description;
            break;
          case 'check-format':
            eui = fb.name;
            break;
        }
        var found = false;
        Object.keys(jsonData).map(function(value, index, key) {
          if (key[index] === eui) {
            eui = jsonData[value];
            found = true;
            switch (module) {
              case 'check-syntax':
                fb.description = eui;
                break;
              case 'check-format':
                fb.description = eui;
                break;
            }
          }
        });
        if (found === false) {
          // append description to file
          if (eui !== '') {
            switch (module) {
              case 'check-syntax':
                jsonData[eui] = fb.description;
                break;
              case 'check-format':
                jsonData[fb.name] = fb.description;
                break;
            }
          }
        }
        fbList.push(fb);
      });
      fs.writeFile(fn, JSON.stringify(jsonData), function(err) {
        if (err) {
          return console.log(err);
        }
      });
      callback(fbList);
    });
  });
}
