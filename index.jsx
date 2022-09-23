//Global variables
const arrOfButtonLabels = [
  "AC",
  "/",
  "*",
  "7",
  "8",
  "9",
  "-",
  "4",
  "5",
  "6",
  "+",
  "1",
  "2",
  "3",
  "=",
  "0",
  ".",
];
const arrOfButtonIDs = [
  "clear",
  "divide",
  "multiply",
  "seven",
  "eight",
  "nine",
  "subtract",
  "four",
  "five",
  "six",
  "add",
  "one",
  "two",
  "three",
  "equals",
  "zero",
  "decimal",
];

//Defining our action types
//Output display action types
const NUMERICSYMBOL = "NUMERICSYMBOL";
const CLEAR = "CLEAR";
const OPERATOR = "OPERATOR";
const EQUALS = "EQUALS";
const OVERWRITEOUTPUTDISPLAY = "OVERWRITEOUTPUTDISPLAY";
//Formula display action types
const WRITE = "WRITE";
const EVALUATE = "EVALUATE";
const CLEARFORMULA = "CLEARFORMULA";

//Defining our action creators
const createButtonPressAction = (label, currentState) => {
  switch (label) {
    case "AC":
      return {
        type: CLEAR,
      };
    case "=":
      return {
        type: EQUALS,
        result: currentState.formulaDisplay,
      };
    case "/":
    case "*":
    case "-":
    case "+":
      return {
        type: OPERATOR,
        symbol: label,
      };
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case ".":
      return {
        type: NUMERICSYMBOL,
        symbol: label,
      };
    default:
      console.log(
        "func:createButtonPressAction received an invalid label input and returned undefined"
      );
      return undefined;
  }
};

const overwriteOutputDisplay = (text) => ({
  type: OVERWRITEOUTPUTDISPLAY,
  text: text,
});

const updateFormulaDisplay = (label) => {
  switch (label) {
    case "AC":
      return {
        type: CLEARFORMULA,
      };
    case "=":
      return {
        type: EVALUATE,
      };
    case "/":
    case "*":
    case "-":
    case "+":
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case ".":
      return {
        type: WRITE,
        symbol: label,
      };
    default:
      console.log(
        "func:updateFormulaDisplay received an invalid label input and returned undefined"
      );
      return undefined;
  }
};

//Creating our reducers
const formulaDisplayReducer = (prevState = "", sentAction) => {
  switch (sentAction.type) {
    case WRITE:
      const patternEndingOperators = /\D+$/;
      const patternEndInDigitsOrDecimalPoints = /(\d|\.)+$/;
      const patternHasTwoOrMoreDecimalPoints = /\.+\d+\.+/;
      const patternHasEqualsWithAResult = /=(\d|.)+/;
      const matchesHasEqualsWithAResult = prevState.match(
        patternHasEqualsWithAResult
      );
      if (
        matchesHasEqualsWithAResult &&
        sentAction.symbol.match(patternEndingOperators)
      ) {
        return (
          matchesHasEqualsWithAResult[0].substring(
            1,
            matchesHasEqualsWithAResult[0].length
          ) + sentAction.symbol
        );
      }
      if (
        prevState &&
        (prevState[prevState.length - 1] == ".") & (sentAction.symbol == ".")
      ) {
        return prevState;
      }
      const matchesPrevStateEndInDigitsOrDecimalPoints = prevState.match(
        patternEndInDigitsOrDecimalPoints
      );
      if (
        matchesPrevStateEndInDigitsOrDecimalPoints &&
        matchesPrevStateEndInDigitsOrDecimalPoints[0].length > 10
      ) {
        return prevState;
      }
      if (
        matchesPrevStateEndInDigitsOrDecimalPoints &&
        (
          matchesPrevStateEndInDigitsOrDecimalPoints[0] + sentAction.symbol
        ).match(patternHasTwoOrMoreDecimalPoints)
      ) {
        return prevState;
      }
      const endingOperatorsPrevState = prevState.match(patternEndingOperators);
      if (
        endingOperatorsPrevState &&
        (endingOperatorsPrevState[0][endingOperatorsPrevState[0].length - 1] ==
          "*" ||
          endingOperatorsPrevState[0][endingOperatorsPrevState[0].length - 1] ==
            "/" ||
          endingOperatorsPrevState[0][endingOperatorsPrevState[0].length - 1] ==
            "+") &&
        sentAction.symbol.match(patternEndingOperators) &&
        sentAction.symbol != "-"
      ) {
        return prevState.substring(0, prevState.length - 1) + sentAction.symbol;
      }
      if (
        endingOperatorsPrevState &&
        (endingOperatorsPrevState[0].substring(
          endingOperatorsPrevState[0].length - 2,
          endingOperatorsPrevState[0].length
        ) == "*-" ||
          endingOperatorsPrevState[0].substring(
            endingOperatorsPrevState[0].length - 2,
            endingOperatorsPrevState[0].length
          ) == "/-") &&
        sentAction.symbol.match(patternEndingOperators)
      ) {
        return prevState.substring(0, prevState.length - 2) + sentAction.symbol;
      }
      return prevState + sentAction.symbol;
    case CLEARFORMULA:
      return "";
    case EVALUATE:
      const patternHasEquals = /=/;
      if (prevState.match(patternHasEquals)) {
        return prevState;
      }
      const answer = evaluateExpression(prevState);
      return prevState + "=" + answer;
    default:
      return prevState;
  }
};

const outputDisplayReducer = (prevState = "0", sentAction) => {
  switch (sentAction.type) {
    case NUMERICSYMBOL:
      if (
        prevState == "0" ||
        prevState == "*" ||
        prevState == "/" ||
        prevState == "-" ||
        prevState == "+"
      ) {
        return sentAction.symbol;
      } else if (
        (sentAction.symbol == "." && prevState.includes(".")) ||
        prevState.length > 10
      ) {
        return prevState;
      } else {
        return prevState + sentAction.symbol;
      }
      break;
    case OPERATOR:
      return sentAction.symbol;
    case EQUALS:
      const patternEverythingAfterEqualsSymbol = `(?<=\=)(\d|\.)+`;
      return sentAction.result.match(patternEverythingAfterEqualsSymbol)[0];
    case CLEAR:
      return "0";
    case OVERWRITEOUTPUTDISPLAY:
      return sentAction.text;
    default:
      return prevState;
  }
};

//Setting root reducer and redux store
const rootReducer = Redux.combineReducers({
  formulaDisplay: formulaDisplayReducer,
  outputDisplay: outputDisplayReducer,
});
const store = Redux.createStore(rootReducer);

//Importing the Provider component and connect function to connect local React components to Redux
const Provider = ReactRedux.Provider;
const connect = ReactRedux.connect;

//A function that evaluates an arithmetic expression
const evaluateExpression = (originalExpression) => {
  //Patterns for matching particular sub-expressions
  const patternDivisionSubExpression = /(\d|\.)+\/(\d|\.)+/g;
  const patternMultiplicationSubExpression = /\-?(\d|\.)+\*\-?(\d|\.)+/g;
  const patternAdditionSubExpression = /\-?(\d|\.)+\+\-?(\d|\.)+/g;
  const patternSubtractionSubExpression = /(\d|\.)+\-(\d|\.)+/g;
  //Get the returned matches and compute each sub-expressions and place the result in the expression and repeat in the order of bidmas
  const bidmasMetaData = [
    {
      operationName: "division",
      subExpressionPattern: patternDivisionSubExpression,
      subExpressionEvaluationFunction: evaluateDivisionExpression,
    },
    {
      operationName: "multiplication",
      subExpressionPattern: patternMultiplicationSubExpression,
      subExpressionEvaluationFunction: evaluateMultiplicationExpression,
    },
    {
      operationName: "addition",
      subExpressionPattern: patternAdditionSubExpression,
      subExpressionEvaluationFunction: evaluateAdditionExpression,
    },
    {
      operationName: "subtraction",
      subExpressionPattern: patternSubtractionSubExpression,
      subExpressionEvaluationFunction: evaluateSubtractionExpression,
    },
  ];
  const result = +bidmasMetaData.reduce((expression, operationMetaData) => {
    const subExpressions =
      expression.match(operationMetaData.subExpressionPattern) || [];
    const resultSubExpresions = subExpressions.map((subExpression) =>
      operationMetaData.subExpressionEvaluationFunction(subExpression)
    );
    return subExpressions.reduce(
      (entireExpression, subExpression, index) =>
        entireExpression.replace(subExpression, resultSubExpresions[index]),
      expression
    );
  }, originalExpression);
  return String(+Number(result).toFixed(7));
};

const evaluateDivisionExpression = (expression) => {
  return expression
    .split("/")
    .reduce((acc, val) => Number(acc) / Number(val))
    .toString();
};
const evaluateMultiplicationExpression = (expression) => {
  return expression
    .split("*")
    .reduce((acc, val) => Number(acc) * Number(val))
    .toString();
};
const evaluateAdditionExpression = (expression) => {
  return expression
    .split("+")
    .reduce((acc, val) => Number(acc) + Number(val))
    .toString();
};
const evaluateSubtractionExpression = (expression) => {
  return expression
    .split("-")
    .reduce((acc, val) => Number(acc) - Number(val))
    .toString();
};

//React
class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={store}>
        <Calculator />
      </Provider>
    );
  }
}

class Calculator extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section id="calculator">
        <Display />
        <ButtonPad />
      </section>
    );
  }
}

class ButtonPad extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <figure id="button-pad">
        {arrOfButtonIDs.map((id, index) => (
          <ConnectedButton
            buttonLabel={arrOfButtonLabels[index]}
            buttonID={id}
          />
        ))}
      </figure>
    );
  }
}

class Button extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.buttonLabel == "*") {
      return (
        <button
          id={this.props.buttonID}
          onClick={() => this.props.handleButtonPress(this.props.buttonLabel)}
        >
          X
        </button>
      );
    }
    return (
      <button
        id={this.props.buttonID}
        onClick={() => this.props.handleButtonPress(this.props.buttonLabel)}
      >
        {this.props.buttonLabel}
      </button>
    );
  }
}

const mapDispatchToPropsButton = (dispatch) => ({
  handleButtonPress: (label) => {
    dispatch(updateFormulaDisplay(label));
    dispatch(createButtonPressAction(label, store.getState()));
  },
});

const ConnectedButton = connect(null, mapDispatchToPropsButton)(Button);

class Display extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <figure class="calculator-display">
        <ConnectedFormulaDisplay />
        <ConnectedOutputDisplay />
      </figure>
    );
  }
}

class FormulaDisplay extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="formula-display-container">
        <p class="formula-display">{this.props.content}</p>
      </div>
    );
  }
}

const mapStateToPropsFormulaDisplay = (storeState) => ({
  content: storeState.formulaDisplay,
});

const ConnectedFormulaDisplay = connect(
  mapStateToPropsFormulaDisplay,
  null
)(FormulaDisplay);

class OutputDisplay extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="output-display-container">
        <p class="output-display" id="display">
          {this.props.content}
        </p>
      </div>
    );
  }
}

const mapStateToPropsOutputDisplay = (storeState) => ({
  content: storeState.outputDisplay,
});

const ConnectedOutputDisplay = connect(
  mapStateToPropsOutputDisplay,
  null
)(OutputDisplay);

//Render the app to the DOM
ReactDOM.render(<App />, document.getElementById("app"));
