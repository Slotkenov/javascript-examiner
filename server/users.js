var database = require('./database');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var helper = require('./helper');

// User management

/**
 * Gets a list of users.
 */
exports.query = function(req, response) {
  database.getUsers(null, function(err, users) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send(users);
    }
  });
};

/**
 * Gets one user by ID.
 */
exports.get = function(req, response) {
  var userId = req.params.id;
  database.getUser({_id: userId}, function(err, user) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send(user);
    }
  });
};

/**
 * Updates an existing user by ID, or creates a new user.
 */
exports.upsert = function(req, response) {
  var user = JSON.parse(helper.decode(req.body.user));
  var userId = user._id;
  var resetPassword = JSON.parse(req.body.resetPassword);
  if (resetPassword) {
    var token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    if (!userId) {
      // New user
      sendEnrollmentEmail(user.email, token, req.headers.host);
    } else {
      // Existing user
      sendResetPasswordEmail(user.email, token, req.headers.host);
    }
  }
  database.putUser(user, function(err, result) {
    if (err) {
      return response.status(500).end();
    }
    if (!userId && result._id) {
      response.location('/users/' + result._id);
      response.status(201);
    }
    response.send({user: result});
  });
};

/**
 * Deletes a user by ID.
 */
exports.delete = function(req, response) {
  var userId = req.params.id;
  if (req.user._id === req.params.id) {
    return response.status(403).end('can\'t delete currently logged in user');
  }
  database.deleteUser(userId, function(err, user) {
    if (err) {
      response.status(500).send(err);
    } else {
      if (!user) {
        return response.status(404).end();
      }
      response.send({user: user, removed: true});
    }
  });
};

/**
 * Generates a token for resetting a user's password
 * and sends an email to that user with a link to reset his password.
 */
exports.resetPassword = function(req, response) {
  var password = req.body.password;
  delete req.body.password;
  database.getUser(req.body, function(err, user) {
    if (err) {
      response.status(500).send(err);
    } else if (!user) {
      response.status(403).send({message: 'Token not valid for this email'});
    } else {
      user.password = user.generateHash(password);
      user.resetPasswordToken = undefined;
      database.putUser(user, function(err, user) {
        if (err || !user) {
          response.status(500).end(err ||
              {message: 'Something went wrong, try again'});
        } else {
          response.send({sucess: true, message:'Password has been reset'});
        }
      });
    }
  });
};

/**
 * Sends a user a welcome email with a link to set his password.
 *
 * @param {string} address The email address to send the mail to.
 * @param {string} token The token to validate a request
 *                 for setting his password.
 * @param {string} host The host of the app to use in the link.
 */
function sendEnrollmentEmail(address, token, host) {
  var subject = 'Welcome to javascript-examiner';
  var text = 'http://' + host + '/#/reset/' + token;
  sendEmail(address,  subject, text);
}

/**
 * Sends a user an email with a link to reset his password.
 *
 * @param {string} address The email address to send the mail to.
 * @param {string} token The token to validate a request
 *                 for resetting his password.
 * @param {string} host The host of the app to use in the link.
 */
function sendResetPasswordEmail(address, token, host) {
  var subject = 'Password reset';
  var text = 'http://' + host + '/#/reset/' + token;
  sendEmail(address,  subject, text);
}

/**
 * Sends an email to a user.
 *
 * @param {string} address The email address to send the mail to.
 * @param {string} subject The subject of the mail.
 * @param {string} text The body of the mail.
 */
function sendEmail(address, subject, text) {
  var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'javascript.examiner@gmail.com',
      pass: process.env.EMAIL_PASSWORD
    }
  });
  var mailOptions = {
    to: address,
    from: 'javascript-examiner@gmail.com',
    subject: subject,
    text: text
  };
  smtpTransport.sendMail(mailOptions, function(err, info) {
    console.log(err);
    console.log('Email sent', info);
  });
}
