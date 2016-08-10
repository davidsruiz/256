// GAME

var log = l => console.log(l);
var loop = (times, block) => {for(var i = 0; i < times; i++) block(i);};

var randomBetween = (a, b) => Math.floor(Math.random()*(b-a)) + a;

Array.prototype.fillWithBlock = function(spaces, block) {
  var that = this;
  loop(spaces, (i) => {
		that[i] = block();
	});
	return that;
};

Array.prototype.pivot = function() {
  var that = this;
  return that[0].map(function(col, i) {
		return that.map(function(row) {
		  return row[i];
		})
  })
};

Array.prototype.sample = function() {
  return this[randomBetween(0, this.length)];
};

Array.prototype.copy = function() {
  return this.slice();
};

Array.prototype.flatten2d = function() { return [].concat(...this); };

Number.prototype.times = function(block) { loop(this, block);};

String.prototype.is = function(str) { return this.toString() == str };


//

var gameover, slid, score;

function process(row, left = true) {
	return left ? combine(row) : combine(row.reverse()).reverse();
}

function combine(row){
	var length = row.length;

	// pre-willslide-check
	if(willSlide(row)) slid = true;
  var copy = row.copy();

	// remove empty
	row = row.filter(function(e) { return e !== nilValue });
	//combine
	var newRow = [];
	for(var i = 0; i < length; i++) {
		var current = row[i];
		if(!current) continue;
		var next = row[i+1];
		if(current === next) {
      var combined = current+next; score += combined;
			newRow.push(combined); i++;
		} else {
			newRow.push(current);
		}
	}

	// post-didslide-check
	if(newRow.length < copy.length) slid = true;

	while(newRow.length < length) newRow.push(nilValue);
	return newRow;
}

function willSlide(row) {
	return removeTrailingFrom(row, nilValue).indexOf(nilValue) != -1
}

function removeTrailingFrom(arr, val) {
	while(arr[arr.length-1] === val){
    arr.pop();
	}
	return arr;
}

function emptyIndexesIn(row) {
  var indicies = [];
  loop(row.length, (i) => {
    if(row[i] == nilValue)indicies.push(i);
  });
  return indicies;
}


// game logic

var board = [];

var width = 4;
var height = 4;
var nilValue = 0;

function rows() { return board }
function cols() { return board.pivot() }

function row(i) { return rows()[i] }
function col(i) { return cols()[i] }

function generateBoard() { board = Array().fillWithBlock(height, () => Array(width).fill(nilValue) ) }

function setCoordinate(x, y, value) { board[y][x] = value }
function setrow(i, row) { board[i] = row }
function setcol(i, col) { for(var j in board) board[j][i] = col[j] }

function init() {
  generate();
  setup();
}

function generate() {
  generateScoreView();
}

function setup() {
  gameover = false;
  slid = false;
  score = 0;

	generateBoard();
  generateBoardView();

	randomAdd(2);
	randomAdd(2);

  updateBoardView();
  updateScoreView();

  startListening();
}

function reset() {
  unset();
  setup();
}

function randomAdd(n) { setCoordinate(randomBetween(0, width), randomBetween(0, height), n) }

// moves

function shift(direction) {
	slid = false;

	// move board
	flip = false;
	verticle = false;
	switch(direction) {
		case "left":
			moveBoard({flip: false, verticle: false});
		break;
		case "right":
			moveBoard({flip: true, verticle: false});
		break;
		case "up":
			moveBoard({flip: false, verticle: true});
		break;
		case "down":
			moveBoard({flip: true, verticle: true});
		break;
	}

	// add new (only if slid)
	if (slid) {
		var x, y;
		switch(direction) {
			case "left":
			case "right":
				x = (direction == "left") ? width - 1 : 0;
				switch(direction) {
          case "left":
    				y = emptyIndexesIn(col(width - 1)).sample(); break;
    			case "right":
    				y = emptyIndexesIn(col(0)).sample(); break;
        }
			break;
			case "up":
			case "down":
				y = (direction == "up") ? height - 1 : 0;
        switch(direction) {
          case "up":
    				x = emptyIndexesIn(row(height - 1)).sample(); break;
    			case "down":
    				x = emptyIndexesIn(row(0)).sample(); break;
        }
			break;
		}
		var value = newNumber();
		setCoordinate(x, y, value);
	}

  if(noMovesPossible()) endGame();
}

    // not greate, needs rewrite! //
function noMovesPossible() {
  if(screenIsFull()){
    // copy board for test operations
    boardCopy = [];
    loop(board.length, (i) => {
      boardCopy.push(row(i).copy());
    });

    // cache board
    realBoard = board;
    board = boardCopy;

    slid = false;

    loop(rows().length, (i) => {
      process(row(i), true);
      process(row(i), false);
    });
    loop(cols().length, (i) => {
      process(col(i), true);
      process(col(i), false);
    });

    board = realBoard;

    if(!slid) {
      return true;
    }
  }
  return false;
}

function screenIsFull() {
  var result = true;
  rows().length.times((i) => {
    if(emptyIndexesIn(row(i)).length != 0) {
      result = false;
    }
  });
  return result;
}

function moveBoard({flip: flip, verticle: verticle}) {
	if(!verticle) {
		loop(rows().length, (i) => {
			setrow(i, process(row(i), !flip));
		});
	} else {
		loop(cols().length, (i) => {
			setcol(i, process(col(i), !flip));
		});
	}
}

function newNumber() {
  flattenedBoard = board.flatten2d();
  flattenedBoard = flattenedBoard.filter(function(e) { return e !== nilValue }).sort((a, b) => a - b);
  fourthHighest = flattenedBoard[3];
  p = Math.random() < 0.1; // probability
  if(p) log(`happened with: ${fourthHighest}`)
  return (p) ? fourthHighest : 2;
}

function logBoard() {
	loop(rows().length, (i) => log(rows()[i]));
	log("");
	// loop(rows().length, (i) => log(i + " | " + row(i).join(" ")));
}

// setup

function startListening() {
  document.onkeydown = function (e) {
    if(!gameover) {
      var direction;
    	switch(e.keyCode) {
    		case 37:
          direction = "left";
    		break;
    		case 39:
          direction = "right";
    		break;
    		case 38:
          direction = "up";
    		break;
    		case 40:
          direction = "down";
    		break;
    	}
      if(direction) {
        shift(direction);
        updateViews();
      }
    }
  }
}

// gameover

function endGame() {
  gameover = true;
  updateBoardView();
  showGameOver();

  setTimeout(() => setup(), Time.sec(0.5));
}


// on ready
document.addEventListener("DOMContentLoaded", function(event) {
  init();
});

function updateViews() {
  updateBoardView();
  updateScoreView();
}
