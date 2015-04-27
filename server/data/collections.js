var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  email: String,
  password: String,
  roles: [String]
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

var paramSchema = mongoose.Schema({
  name: String,
  type: String,
  description: String
});

var functionSchema = mongoose.Schema({
  name: String,
  params: [paramSchema]
});

var metricsFunctionSchema = mongoose.Schema({
  name: String,
  sloc: {
    logical: Number,
    physical: Number
  },
  cyclomatic: Number,
  halstead: {
    operators: {
      distinct: Number,
      total: Number,
      identifiers: [String]
    },
    operands: {
      distinct: Number,
      total: Number,
      identifiers: [String]
    },
    length: Number,
    vocabulary: Number,
    difficulty: Number,
    volume: Number,
    effort: Number,
    bugs: Number,
    time: Number
  },
  params: Number,
  line: Number,
  cyclomaticDensity: Number
});

var exerciseSchema = mongoose.Schema({
  chapter: Number,
  number: Number,
  name: String,
  description: String,
  functions: [functionSchema],
  modelSolution: {
    code: String
  },
  testSuite: {
    code: String
  },
  metrics: {
    aggregate: {
      sloc: {
        logical: Number,
        physical: Number
      },
      cyclomatic: Number,
      halstead: {
        operators: {
          distinct: Number,
          total: Number,
          identifiers: [String]
        },
        operands: {
          distinct: Number,
          total: Number,
          identifiers: [String]
        },
        length: Number,
        vocabulary: Number,
        difficulty: Number,
        volume: Number,
        effort: Number,
        bugs: Number,
        time: Number
      },
      params: Number,
      line: Number,
      cyclomaticDensity: Number
    },
    functions: [metricsFunctionSchema],
    dependencies: [String],
    maintainability: Number,
    loc: Number,
    cyclomatic: Number,
    effort: Number,
    params: Number
  }
});

var solutionSchema = mongoose.Schema({
  code: String,
  exerciseId: String,
  userId: String
});

var testSuiteSchema = mongoose.Schema();

mongoose.model('User', userSchema);
exports.User = mongoose.model('User');
mongoose.model('Exercise', exerciseSchema);
exports.Exercise = mongoose.model('Exercise');
mongoose.model('Solution', solutionSchema);
exports.Solution = mongoose.model('Solution');
