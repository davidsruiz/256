
var c = e => document.createElement(e);
var $ = s => document.getElementById(s) || document.getElementsByTagName(s)[0];

function generateBoardView() {
  table = c("table");
  loop(cols().length, i => {
    tr = c("tr");
    loop(rows().length, j => {
      td = c("td");
      td.textContent = `${j} - ${i}`;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  if($("table")) $("table").remove();
  $("game").appendChild(table);
}

function updateBoardView() {
  var table = $("table");
  loop(cols().length, i => {
    loop(rows().length, j => {
      var value = row(i)[j];
      var cell = table.children[i].children[j];
      cell.textContent = (value == nilValue) ? "" : value;
      cell.className = "_" + cell.textContent;
    });
  });
}

function showGameOver() {
  alert("GAME OVER. your final score: " + score);
}


// score

function generateScoreView() {
  var span = c("span");
  span.id = "score";
  var span = c("span");
  span.id = "score";
  $("game").appendChild(span);
}

function updateScoreView() {
  $("span").textContent = score;
}
