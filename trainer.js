
let bestBrain = [];
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

function evaluate(brainz) {
    let sim = new Simulator(cells, 500, 3, brainz);
    let res = sim.run();
    res.sort(function (a, b) {
        return -a.bestResult + b.bestResult;
    });
    //print(res[0].bestResult + " " + res[1].bestResult);
    return res;
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

    let selectOne = function () {
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

function trainerBot(n, rounds, frames) {
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