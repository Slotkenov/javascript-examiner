var Checker = require('jscs');
var loadConfigFile = require('jscs/lib/cli-config');
var Objects = require('../objects');
var mapper = require('../feedback-mapper');

module.exports = function(submitted, cb) {
  var checker = new Checker();
  checker.registerDefaultRules();
  checker.configure(loadConfigFile.load(__dirname + '/jscs-config.json'));

  var feedbackList = [];
  //var result = [];
  try {
    var errors = checker.checkString(submitted.code);
    errors.getErrorList().forEach(function(err) {
      var feedback = new Objects.Feedback();
      feedback.addressee = 'student';
      feedback.name = err.rule;
      feedback.description = err.message;
      feedback.line = err.line;
      feedback.column = err.column;
      mapper('check-syntax', feedback, function(value) {
        feedback.description = value;
        feedbackList.push(feedback);
      });
    });
  } catch (err) {
    cb(err);
  }
  console.log('success: Check-Format');
  cb(null, feedbackList);

};

function ignoreComments(plainCode) {
  // console.log(typeof plainCode);
  // console.log(plainCode.indexOf('/*'));
  // plainCode = plainCode.replace('/*', '/* jscs: disable')
  //     .replace('*/', '*/ \n //jscs: enable');
  // console.log(plainCode);
  return plainCode;
}

/*
  This function is loosely based on the one found here:
  http://www.weanswer.it/blog/optimize-css-javascript-remove-comments-php/
*/
function removeComments(str) {
  str = ('__' + str + '__').split('');
  var mode = {
    singleQuote: false,
    doubleQuote: false,
    regex: false,
    blockComment: true,
    lineComment: false,
    condComp: false
  };
  for (var i = 0, l = str.length; i < l; i++) {

    if (mode.regex) {
      if (str[i] === '/' && str[i - 1] !== '\\') {
        mode.regex = false;
      }
      continue;
    }

    if (mode.singleQuote) {
      if (str[i] === '\'' && str[i - 1] !== '\\') {
        mode.singleQuote = false;
      }
      continue;
    }

    if (mode.doubleQuote) {
      if (str[i] === '"' && str[i - 1] !== '\\') {
        mode.doubleQuote = false;
      }
      continue;
    }

    if (mode.blockComment) {
      if (str[i] === '*' && str[i + 1] === '/') {
        str[i + 1] = '';
        mode.blockComment = false;
      }
      str[i] = '';
      continue;
    }

    if (mode.lineComment) {
      if (str[i + 1] === '\n' || str[i + 1] === '\r') {
        mode.lineComment = false;
      }
      str[i] = '';
      continue;
    }

    if (mode.condComp) {
      if (str[i - 2] === '@' && str[i - 1] === '*' && str[i] === '/') {
        mode.condComp = false;
      }
      continue;
    }

    mode.doubleQuote = str[i] === '"';
    mode.singleQuote = str[i] === '\'';

    if (str[i] === '/') {

      if (str[i + 1] === '*' && str[i + 2] === '@') {
        mode.condComp = true;
        continue;
      }
      if (str[i + 1] === '*') {
        str[i] = '';
        mode.blockComment = true;
        continue;
      }
      if (str[i + 1] === '/') {
        str[i] = '';
        mode.lineComment = true;
        continue;
      }
      mode.regex = true;

    }

  }
  return str.join('').slice(2, -2);
}
