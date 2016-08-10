

var Time = { sec: n => n * 1000};


var interval = Time.sec(0.05);
var stop = false;

// AI

function solve(algorithm) {
  stop = false;
  start(algorithm);
}

function start(algorithm) {
  if(!gameover && !stop) setTimeout(() => { algorithm.next(); start(algorithm) }, interval);
}

var bidirectionalBias = {
  on: false,
  staleCounter: 0,

  next: function() {
    // copy board for test operations
    var boardCopy = [];
    loop(board.length, (i) => {
      boardCopy.push(row(i).copy());
    });

    direction = this.on ? "left" : "down"; this.on = !this.on;
    if(this.staleCounter > 0) { direction = "right"; this.staleCounter = 0; }
    shift(direction); updateBoardView();
    if(board.flatten2d().toString() == boardCopy.flatten2d().toString()) {
      this.staleCounter++;
    }
    log(direction);
  }
}
