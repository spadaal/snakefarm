//TODO Start screen
//TODO Game over/new game
//DONE Prevent change of direction 
//TODO VisualFX

var vx = 0;
var vy = 0;
var snake;
var cells = 30;
var food;

var cx;
var cy;
var score = 0;
var autoMode = false;
var bestBrain = null;
var currBestBrain = 0;
var lifeSpan = 300;
var frame = 0;

function setup() {
  createCanvas(400, 400);
  cx = floor(width / cells);
  cy = floor(height / cells);
  frameRate(90);
  newGame();

}

function newGame(brain) {
  snake = new Snake(floor(cells / 2), floor(cells / 2), brain);
  newFood();
  vx = 0;
  vy = 0;
  score = 0;
  frame = 0;
  lifeSpan = 300;
}

function newFood() {
  food = createVector(floor(cells * random()), floor(cells * random()));
}

function keyPressed() {

  switch (keyCode) {
    case (84):
      noLoop();
      bestBrain = [];
      let brainz = trainerBot(300, 30, 600);
      /**for (var i = 0; i < 5000; i++)
        brainz.push(new Snake(floor(cells / 2), floor(cells / 2))
          .brain);**/

      for (var generation = 0; generation < 20; generation++) {
        print("Evaluating gen " + generation);
        let res = evaluate(brainz);
        let mean = res.map((a) => a.bestResult).reduce((a, b) => a + b) / res.length;

        //bestBrain=[];
        //Save best 5 of each gen
        for (var j = 0; j < 5; j++) {
          bestBrain.push([generation, res[j]]);
        }

        print(generation + " gen " + res.length + " brains. Best result:" +
          res[0].bestResult + " mean: " + mean);
        brainz = evolve3(res, 200, mean);
      }
      loop();
      break;
    case (83):
      autoMode = !autoMode;
      if (autoMode) {
        bestBrain.sort((a, b) => b[1].bestResult - a[1].bestResult);
        newGame(bestBrain[0][1].brain);
        currBestBrain = 0;
      }
      break;
    case (82):

      /**newGame();
      snake.body[0].x = 1;
      snake.body[0].y = 1;
      food.x = 10;
      food.y = 1;
      print("S " + snake.lookInDirection(0, 1, 30));
      print("SE" + snake.lookInDirection(1, 1, 30));
      print("E " + snake.lookInDirection(1, 0, 30));
      print("NE" + snake.lookInDirection(1, -1, 30));
      print("N " + snake.lookInDirection(0, -1, 30));
      print("NW" + snake.lookInDirection(-1, -1, 30));
      print("W " + snake.lookInDirection(-1, 0, 30));
      print("SW" + snake.lookInDirection(-1, 1, 30));**/
      print(trainerBot(10, 10, 250));
  }
}

function evaluate(brainz) {
  let sim = new Simulator(cells, 500, 3, brainz);
  let res = sim.run();
  res.sort(function(a, b) {
    return -a.bestResult + b.bestResult;
  });
  //print(res[0].bestResult + " " + res[1].bestResult);
  return res;
}

function evolve(res, targetPopulation, mean) {
  let newGen = [];
  for (var i = 0; i < floor(targetPopulation / 8); i++) {
    let c = res[i].brain.copy();
    //c.mutate((e, row, col) => e + ((random()>0.75) ? random(0.05)-0.025 : 0));
    newGen.push(c);
  }
  for (var i = 0; i < floor(targetPopulation / 8); i++) {
    let c1 = res[floor(random() * res.length / 8)].brain;
    let c2 = res[floor(random() * res.length / 8)].brain;
    //c.mutate((e, row, col) => e + ((random()>0.25) ? random(0.1)-0.05 : 0));
    newGen.push(NeuralNetwork.breed(c1, c2));
  }
  for (var i = 0; i < floor(targetPopulation / 4); i++) {
    let c = new Snake(floor(cells / 2), floor(cells / 2)).brain;
    //c.mutate((e, row, col) => e + ((random()>0.75) ? random(0.05)-0.025 : 0));
    newGen.push(c);
  }
  for (var i = 0; i < floor(targetPopulation / 2); i++) {
    let c1 = res[floor(random() * res.length / 8)].brain;
    let c2 = res[floor(random() * res.length / 2)].brain;
    //c.mutate((e, row, col) => e + ((random()>0.25) ? random(0.1)-0.05 : 0));
    newGen.push(NeuralNetwork.breed(c1, c2));
  }
  return newGen;
}

function evolve2(res, targetPopulation, mean) {
  let newGen = [];
  let res2 = res.filter((a) => a.bestResult > mean);
  for (var i = 0; i < floor(targetPopulation / 8); i++) {
    let c = res[i].brain.copy();
    newGen.push(c);
  }
  for (var i = 0; i < 5; i++) {
    let c = res[i].brain.copy();
    c.mutate((e, row, col) => e + ((random() > 0.50) ? random(0.2) - 0.1 : 0));
    newGen.push(c);
  }
  for (var i = 0; i < floor(targetPopulation / 2); i++) {
    let c1 = res2[floor(random() * res2.length)].brain;
    let c2 = res2[floor(random() * res2.length)].brain;
    //c.mutate((e, row, col) => e + ((random()>0.25) ? random(0.1)-0.05 : 0));
    newGen.push(NeuralNetwork.breed(c1, c2));
  }
  while (newGen.length < targetPopulation) {
    let c1 = res[floor(random() * res.length / 2)].brain;
    let c2 = res2[floor(random() * res2.length)].brain;
    newGen.push(NeuralNetwork.breed(c1, c2));
  }
  return newGen;
}

function evolve3(res, targetPopulation, mean) {
  let newGen = [];
  let res2 = res.filter((a) => a.bestResult > mean);
  //for (let a of res2) { print("br:"+a.bestResult)};
  for (var i = 0; i < 5; i++) {
    let c = res[i].brain.copy();
    newGen.push(c);
    newGen.push(new Snake(floor(cells / 2), floor(cells / 2)).brain);
  }

  //Calculate total Fitness
  let totalFitness = res2.map((a) => a.bestResult).reduce((a, b) => a + b);

  let selectOne = function() {
    let r = random(totalFitness);
    let s = 0;
    for (var i = 0; i < res2.length; i++) {
      s += res2[i].bestResult;
      if (s >= r) {
        return res2[i].brain;
      }
    }
  };

  while (newGen.length < targetPopulation) {
    let c = NeuralNetwork.breed(selectOne(), selectOne());
    c.mutate((e, row, col) => e + ((random() > 0.97) ? random(0.2) - 0.1 : 0));
    newGen.push(c);
  }

  return newGen;
}


function think() {
  //print(snake.sense(cells));
  var pv = snake.predictv(snake.sense(cells));
  vx = pv[0];
  vy = pv[1];
}

function vel_map() {
  return [
    (vx < 0) ? 1 : 0,
    (vx > 0) ? 1 : 0,
    (vy < 0) ? 1 : 0,
    (vy > 0) ? 1 : 0
  ];
}

function trainerBot(n, rounds, frames) {
  noLoop();
  let brains = [];
  for (var i = 0; i < n; i++) {
    newGame();
    let b = snake.brain;
    for (var j = 0; j < rounds; j++) {
      newGame(b);
      let f = 0;
      let dead = false;
      while (!dead && f < frames) {
        f++;
        thinkBot();
        if (snake.update(createVector(vx, vy), cells)) {
          dead = true;
        } else {
          snake.brain.train(snake.sense(cells), vel_map());
          if (snake.eat(food)) {
            for (var z = 0; z < 10; z++)
              snake.brain.train(snake.sense(cells), vel_map());
            newFood();
          }
        }
      }
    }
    brains.push(b);
  }
  loop();
  return brains;
}

function thinkBot() {
  let view = snake.sense(cells);
  let lastvx = vx;
  let lastvy = vy;

  if (view[1] >= 1) {
    vx = 0;
    vy = 1;
  } else if (view[7] >= 1) {
    vx = 1;
    vy = 0;
  } else if (view[13] >= 1) {
    vx = 0;
    vy = -1;
  } else if (view[19] >= 1) {
    vx = -1;
    vy = 0;
  } else {
    //Try to keep the same last direction if not harmful
    let fx = snake.body[0].x + vx;
    let fy = snake.body[0].y + vy;
    if (fx < 0 || fx > cells || fy < 0 || fy > cells || (vx == vy)) {
      //If no food in sight, just move randomly without killing ourselves
      let d = 0;
      floor(random(4));
      let suitable = false;
      while (!suitable) {
        //d = floor(random(4));
        if (d == 0 && view[6] < 1 && lastvx != -1) {
          vx = 1;
          vy = 0;
          suitable = true;
        } else if (d == 1 && view[0] < 1 && lastvy != -1) {
          vx = 0;
          vy = 1;
          suitable = true;
        } else if (d == 2 && view[18] < 1 && lastvx != 1) {
          vx = -1;
          vy = 0;
          suitable = true;
        } else if (d == 3 && view[12] < 1 && lastvy != 1) {
          vx = 0;
          vy = -1;
          suitable = true;
        }
        d++;
      }
    }
  }
  //console.info(vx + " " + vy);
}

function draw() {
  background(220);

  if (autoMode) {
    think();
    frame++;
    score++;
  } else {
    //console.info(snake.sense(cells)); 
    thinkBot();
  }

  if (snake.update(createVector(vx, vy), cells) || frame > lifeSpan) {
    //Game over
    if (autoMode) {
      currBestBrain++;
      if (currBestBrain < bestBrain.length) {
        //print(bestBrain[currBestBrain]);
        newGame(bestBrain[currBestBrain][1].brain);
      } else {
        autoMode = false;
      }
    } else {
      if (frame > lifeSpan) {
        console.info("Survived");
      } else {
        console.info("Dead");
      }
      newGame();
    }
  } else {

    if (snake.eat(food)) {
      newFood();
      lifeSpan += 150;
    }
    snake.show();
    stroke(200, 0, 0);
    fill(200, 0, 0);
    rect(food.x * cx, food.y * cy, cx, cy);
  }
  stroke(0);
  noFill();
  if (bestBrain && bestBrain[currBestBrain])
    text("Brain gen. " + bestBrain[currBestBrain][0] + " " + currBestBrain +
      "(" + bestBrain[currBestBrain][1].bestResult +
      ") Score: " + (score * score * pow(2, snake.body.length)), 10, 10);
}
