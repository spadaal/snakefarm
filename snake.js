class Snake {

    constructor(x, y, brain) {
      this.body = [];
      this.body.push(createVector(x, y));
      //if (brain) print("Reusing brain");
      this.brain = brain || new NeuralNetwork(24, 12, 4);
      this.lastVel = createVector(0, 0);
    }
  
    update(vel, cells) {
      //Updates tail
      this.body.unshift(this.body[0].copy());
      this.body.pop();
      //Updates the head
      var head = this.body[0];
  
      //Don't allow the snake to turn towards itself
      if ((this.lastVel.x == -vel.x && this.lastVel.y == vel.y) ||
        (this.lastVel.x == vel.x && this.lastVel.y == -vel.y)) {
        vel = this.lastVel;
      }
      head.x += vel.x;
      head.y += vel.y;
      this.lastVel = vel;
      //Checks for death conditions
      //OOB condition
      if (head.x < 0 || head.x > cells || head.y < 0 || head.y > cells) {
        //print ("OOB:" + head);
        return true;
      }
      if (this.body.length > 1) {
        //Self-bite
        for (let s of this.body) {
          if (s != head && s.x == head.x && s.y == head.y) {
            print ("SB");
            return true;
          }
        }
      }
      return false;
    }
  
    show() {
      stroke(0, 0, 0);
      fill(0, 128, 0);
      for (let s of this.body) {
        rect(s.x * cx, s.y * cy, cx, cy);
        fill(0, 196, 0);
      }
    }
  
    grow() {
      var growth = this.body[0].copy();
      this.body.push(growth);
    }
  
    eat(food) {
      if (food.x == this.body[0].x && food.y == this.body[0].y) {
        this.grow();
        return true;
      } else {
        return false;
      }
    }
  
    lookInDirection(vx, vy, cells) {
      let px = this.body[0].x;
      let py = this.body[0].y;
      let dist = 1.0;
      let ret = [0, 0, 0];
      px += vx;
      py += vy;
      let step=Math.sqrt(vx*vx+vy*vy);
      while (px >= 0 && px <= cells && py >= 0 && py <= cells) {
        if (px == food.x && py == food.y) {
          ret[1] = 1;
        }
        if (this.body.findIndex(function(segment) {}) > 0) {
          ret[2] = 1 / dist;
        }
        dist+=step;
        px += vx;
        py += vy;
      }
      ret[0] = 1 / dist;
      return ret;
    }
  
    sense(cells) {
          let n1 = this.lookInDirection(0,1,cells);
      let n2 = this.lookInDirection(1,1,cells);
      let n3 = this.lookInDirection(1,0,cells);
      let n4 = this.lookInDirection(1,-1,cells);
      let n5 = this.lookInDirection(0,-1,cells);
      let n6 = this.lookInDirection(-1,-1,cells);
      let n7 = this.lookInDirection(-1,0,cells);
      let n8 = this.lookInDirection(-1,1,cells);
      
          return n1.concat(n2,n3,n4,n5,n6,n7,n8);
    }
    /**  sense(cells) {
        var head = this.body[0];
        var s1 = head.x / cells;
        var s2 = (cells - head.x) / cells;
        var s3 = head.y / cells;
        var s4 = (cells - head.y) / cells;
  
        var dx = abs(head.x - food.x);
        var dy = abs(head.y - food.y);
  
        var s5 = (head.x < food.x && head.y == food.y) ? dx / cells : 0;
        var s6 = (head.x > food.x && head.y == food.y) ? dx / cells : 0;
        var s7 = (head.x == food.x && head.y < food.y) ? dy / cells : 0;
        var s8 = (head.x == food.x && head.y > food.y) ? dy / cells : 0;
  
        var s9 = 0;
        var s10 = 0;
        var s11 = 0;
        var s12 = 0;
  
        if (dx == dy) {
          let dist = sqrt(dx * dx + dy * dy) / cells;
          if (head.x < food.x && head.y < food.y) {
            s9 = dist;
          } else if (head.x > food.x && head.y > food.y) {
            s10 = dist;
          } else if (head.x < food.x && head.y > food.y) {
            s11 = dist;
          } else if (head.x > food.x && head.y < food.y) {
            s12 = dist;
          }
        }
  
        var s13 = 0.5 + (this.lastVel.x/2);
        var s14 = 0.5 + (this.lastVel.y/2);
  
        let r = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14];
        //print(r);
        return r;
      } **/
  
    predictv(input) {
      var pred = this.brain.predict(input);
      //print(pred);
      var max_index = 0;
      for (var i = 1; i < pred.length; i++) {
        if (pred[i] > pred[max_index]) max_index = i;
      }
      switch (max_index) {
        case 0:
          return [-1, 0];
        case 1:
          return [1, 0];
        case 2:
          return [0, -1];
        case 3:
          return [0, 1];
      }
    }
  }
  