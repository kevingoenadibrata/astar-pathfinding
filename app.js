var gridEl = $('.grid');
var inputNumEl = $('#nums');

var cells = [];
var nums = 15;

var cellsLoad;
var report = [];

var Cell = function(i,j){
  this.row = i;
  this.col = j;
  this.visited = false;
  this.walls = [true, true, true, true];

  this.gVal = 0;
  this.hVal = 0;

  this.g = function(n){if(n) this.gVal = n; return this.gVal}
  this.h = function(n){if(n) this.hVal = n; return this.hVal}
  this.f = function(){return this.gVal+ this.hVal;}

  this.parent = 0;


  this.wallHtml = function() {
    return `
    font-size: 0.4em;
    color: white;
    opacity: 0.5;
    text-align: center;
    letter-spacing: 1px;
    border-style: solid;
    border-color: var(--main);
    border-width: ${this.walls[0] ? '1px' : '0px'} ${this.walls[1] ? '1px' : '0px'} ${this.walls[2] ? '1px' : '0px'} ${this.walls[3] ? '1px' : '0px'}`;
  }

  this.element = function(){return $(`#cell-${this.row}-${this.col}`)};
// ${this.g()}/${this.h()}/${this.f()}
  this.html = function() {
    return `<div class="cell" id="cell-${this.row}-${this.col}" style="grid-area: ${this.row+1}/${this.col+1}/${this.row+2}/${this.col+2}; ${this.wallHtml()}">  </div>`;
  }

  this.neighbors = function(){
    var nei = [];

    nei.push(this.row - 1 >= 0 ? cells[this.row-1][this.col] : -1);
    nei.push(this.col + 1 < nums ? cells[this.row][this.col+1] : -1);
    nei.push(this.row + 1 < nums ? cells[this.row+1][this.col] : -1);
    nei.push(this.col - 1 >= 0 ? cells[this.row][this.col-1] : -1);

    return nei;
  }

  this.possibleNeighbors = function(){
    var nei = [];

    if(this.row - 1 >= 0) if(!cells[this.row-1][this.col].visited) nei.push( cells[this.row-1][this.col] );
    if(this.col + 1 < nums) if(!cells[this.row][this.col+1].visited) nei.push( cells[this.row][this.col+1] );
    if(this.row + 1 < nums) if(!cells[this.row+1][this.col].visited) nei.push( cells[this.row+1][this.col] );
    if(this.col - 1 >= 0) if(!cells[this.row][this.col-1].visited) nei.push( cells[this.row][this.col-1] );

    return nei;
  }

  this.accessibleNeighbors = function(){
    var nei = [];

    if(this.row - 1 >= 0) if(!this.walls[0]) nei.push( cells[this.row-1][this.col] );
    if(this.col + 1 < nums) if(!this.walls[1]) nei.push( cells[this.row][this.col+1] );
    if(this.row + 1 < nums) if(!this.walls[2]) nei.push( cells[this.row+1][this.col] );
    if(this.col - 1 >= 0) if(!this.walls[3]) nei.push( cells[this.row][this.col-1] );

    return nei;
  }
}

// Initial function
// get json test files
// initiate grid size
// initiate cell objects assign to cells
// draw grid
// run random maze generator
function start(){
  $.getJSON("file.json", function(json) {
    console.log(typeof json); // this will show the info it in firebug console
    cellsLoad = json;
  });

  cells = [];

  gridEl.css("grid-template-columns", `repeat(${nums}, 1fr)`);
  gridEl.css("grid-template-rows", `repeat(${nums}, 1fr)`);

  for(var i = 0; i < nums; i++){
    var cellstemp = [];
    for(var j = 0; j < nums; j++){
      cellstemp.push(new Cell(i,j));
    }
    cells.push(cellstemp);
  }

  drawGrid();
  dfs();
  resetVisited();
  //runAStar();
}


function drawGrid(){
  var s = "";
  for(let i = 0; i < cells.length; i++){
    for(let j = 0; j < cells[i].length; j++){
      s += cells[i][j].html();
    }
  }
  gridEl.html(s);
}

function removeWall(a,b){
  var deltarow = b.row - a.row;
  var deltacol = b.col - a.col;

  if(deltarow > 1 || deltarow < -1) return -1;
  if(deltacol > 1 || deltacol < -1) return -1;
  if(deltarow != 0 && deltacol != 0) return -1;

  //b above a
  if(deltarow == -1){
    a.walls[0] = false;
    b.walls[2] = false;
  }
  //b on right of a
  else if( deltacol == 1){
    a.walls[1] = false;
    b.walls[3] = false;
  }
  //b below a
  else if( deltarow == 1){
    a.walls[2] = false;
    b.walls[0] = false;
  }
  //b on left of a
  else if( deltacol == -1){
    a.walls[3] = false;
    b.walls[1] = false;
  }
  drawGrid();

  return 1;
}

function resetdfs(){
  if(inputNumEl.val()) nums = inputNumEl.val();
  inputNumEl.val("");
  start();
}


function dfs(){
  var progress = 1.0;

  var curr = cells[0][0];

  var stack = [];

  var removeArray = [];
  var removeCell = [];

  stack.push(curr);
  curr.visited = true;
  $("#gen-container").css("pointer-events", "none");
  var loop = setInterval(function(){
      if(stack.length == 0){
        $('#gen-button').text("GENERATE MAZE");
        $("#gen-container").css("pointer-events", "auto");
        for(var i = 0; i < removeArray.length; i++)
          removeWall(removeArray[i], removeCell[i]);
        clearInterval(loop);
      }
      curr.visited = true;
      var nei = curr.possibleNeighbors();
      if(progress % 10 == 0) $('#gen-button').html(""+(progress*100/(nums*nums)).toFixed(2)+"%");
      if(nei.length == 0){
        stack.pop();
        curr = stack[stack.length-1];
      }
      else{
        var indexRandom = Math.floor(Math.random() * nei.length);
        removeArray.push(nei[indexRandom]);
        removeCell.push(curr);
        progress += 1.0;
        //optimize
        stack.push(nei[indexRandom]);
        curr = nei[indexRandom];
      }

      if(progress == nums*nums){
        $('#gen-button').text("GENERATE MAZE");
        stack = [];
      }
  }, 1);

}

function test1(){
  nums = cellsLoad.length;
  for(var i = 0; i < cells.length; i++){
    for(var j = 0; j < cells[0].length; j++){
      cells[i][j].walls = cellsLoad[i][j].walls;
    }
  }
  drawGrid();
}

function resetVisited(){
  for(var i = 0; i < cells.length; i++){
    for(var j = 0; j < cells[0].length; j++){
      cells[i][j].visited = false;
    }
  }
}


function extractWalls(){
  var w = [];
  for(var i = 0; i < cells.length; i++){
    var g = [];
    for(var j = 0; j < cells[0].length; j++){
      g.push(cells[i][j].walls);
    }
    w.push(g)
  }

  return w;
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function precompHval(){
  for(var i = 0; i < cells.length; i++)
    for(var j = 0; j < cells[i].length; j++)
      cells[i][j].h( (cells.length-1-i)+(cells.length-1-j) );
}

function astar(){
  //TEPI TODO
  precompHval();
  var currCell = cells[0][0];
  var endCell = cells[cells.length-1][cells.length-1];
  var path = [];
  var openList = [];
  var closedList = [];
  var boo = true;
  //initialization of starting cell
  cells[0][0].visited = true;

  while(currCell != endCell){
  //pushing all neighbors of curr cells to openList
  //assigning start as parent of neighbors
    console.log("S");
    var cellNeigh = currCell.accessibleNeighbors();

    boo = false;
    for(var i = 0; i < cellNeigh.length; i++){
      //if not visited
      if(!cellNeigh[i].visited){
        cellNeigh[i].visited = true;
        openList.push(cellNeigh[i]);
        cellNeigh[i].g(currCell.g()+1);
        cellNeigh[i].parent = currCell;
      }
    }
    //push curr cell to closedList, make visited true
    closedList.push(currCell);
    // //sorting the f values
    // for(var i = 0; i < neigh; i++){
    //   console.log("MASUK");
    //   openList.sort(function(a,b){return a.fVal - b.fVal});
    // }
    //assigning the start position to shortest fVal cell
    var least = 100000000000;
    var leastIndex = -1;
    var leastCell;
    for(var i = 0; i < openList.length; i++){
      if(openList[i].f() < least){
        leastCell = openList[i];
        leastIndex = i;
        least = openList[i].f();
      }
    }
    currCell = leastCell;
    openList.splice(leastIndex, 1);
  }

  path.push(endCell);
  while(endCell != cells[0][0]){
   path.push(endCell.parent);
   endCell = endCell.parent;
  }
  drawGrid();
  return [path, closedList];
}

function runAStar(){
  resetVisited();
  var astarpath = astar();

  var index = astarpath[0].length-1;
  var animatePath = setInterval(function(){
    astarpath[0][index].element().css("background-color", "rgb(31, 213, 136)");
    if(--index < 0){
      clearInterval(animatePath);
    }
  }, 100);

  // for(let i = 0; i < astarpath[0].length; i++){
  //   astarpath[0][i].element().css("background-color", "rgb(31, 213, 136)");
  // }

}
