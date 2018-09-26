class Result {
    constructor(brain, results) {
      this.brain = brain;
      this.results = results;
          this.bestResult = this.getMeanResult();
    }
  
    getBestResult() {
      return this.results.reduce(function(a, b) {
        return a > b ? a : b;
      });
    }
    
    getMeanResult() {
      return this.results.reduce(function(a, b) {
        return a + b;
      })/this.results.length;
    }
  
  }
  
  class Simulator {
  
    constructor(cells, lifeSpan, rounds, brains) {
      this.cells = cells;
      this.lifeSpan = lifeSpan;
      this.rounds = rounds;
      this.brains = brains;
      this.fitnesses = [];
    }
  
    run() {
      for (let brain of this.brains) {
        let results = [];
        for (var i = 0; i < this.rounds; i++) {
          results.push(this.simulateRound(brain));
        }
        this.fitnesses.push(new Result(brain,results));
        //console.log(results);
      }
      return this.fitnesses;
    }
  
    simulateRound(brain) {
      let currFrame = 0;
      let framesWO = 0;
      let score = 0;
      let snake = this.newGame(brain);
      let dead = false;
      let ttl = this.lifeSpan;
      let foodEaten=0;
      let maxScore=score;
      while (currFrame < ttl && !dead) {
        currFrame++;
        framesWO++;
        var pv = snake.predictv(snake.sense(this.cells));
        //print(pv + " " + snake.body[0] + " " + this.food);
        var vx = pv[0];
        var vy = pv[1];
        if (snake.update(createVector(vx, vy), this.cells)) {
          //Game over
          //score = score - 100;
          dead=true;
          //foodEaten+=snake.body.length-1;
          //maxScore= (score>maxScore)?score:maxScore;
          //snake = new Snake(floor(this.cells / 2), floor(this.cells / 2), brain);
        } else {
          if (snake.eat(this.food)) {
            this.newFood();
            if (ttl<this.lifeSpan*10) {
              ttl+=ttl;
              print(ttl);
            }
          } else {
              score+=1;
          }
          
        }
      }
      maxScore= (score>maxScore)?score:maxScore;
      foodEaten+=snake.body.length-1;
      return maxScore*maxScore*pow(2,foodEaten);
    }
  
    newFood() {
      this.food = createVector(floor(this.cells * random()), floor(this.cells * random()));
    }
  
    newGame(brain) {
      let snake = new Snake(floor(this.cells / 2), floor(this.cells / 2), brain);
      this.newFood();
      return snake;
    }
  
  }
  