$(function(){
  var canvas = document.getElementById('can')
  w = 1280
  h = 840
  canvas.width = w
  canvas.height = h
  var ctx = canvas.getContext('2d')

  interval = 10

  center = {
    x: w/2,
    y: h/2
  }

  turret = {
    x: center.x,
    y: center.y,
    r: 25,
    deg: 0,
    move :0
  }

  user = {
    points: 0,
    hp: 0
  }

  

  init()
  setInterval(function(){ draw()}, interval)
  
  


  $('canvas').mousemove(function(event){
    if (!pause && mouseActive){
      x = event.pageX-turret.x
      y = event.pageY-turret.y
      turret.deg = Math.atan2(y,x)
    }
  })

  $(document).keyup(function(event){
    if (event.keyCode == 82)
      init()
    if (event.keyCode == 83 || event.keyCode == 87)
        turret.move = 0
    if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 65 || event.keyCode == 68)
      dir = 0
    if (event.keyCode  == 49 ){
      weapon = 1
    }
    else if (event.keyCode == 50){
      weapon = 2
    }
    else if (event.keyCode == 80 && start){
      pause = !pause
    }
  })
  $(document).keydown(function(event){
    if (!pause && start){
      if (event.keyCode == 87)
        turret.move = 1
      else if (event.keyCode == 83)
        turret.move = 2
      if (event.keyCode == 37 || event.keyCode == 65)
        dir = 1
      else if (event.keyCode == 39 || event.keyCode == 68)
        dir = 2
      else if (event.keyCode == 17){
        if (weapon == 1)
          bullets.push(new Bullet(-turret.deg+(Math.PI/2)))
        else if (weapon == 2){
          if (lasers.length == 0)
            lasers.push(new Laser(-turret.deg+(Math.PI/2)))
        }
      }
    }
  })
  $('canvas').click(function(event){
    click = {
      y: event.pageY,
      x: event.pageX,
      deg: Math.atan2(event.pageX-turret.x, event.pageY-turret.y)
    }
    if (!pause && start){
      var fire_deg = mouseActive ? click.deg : -turret.deg+(Math.PI/2)
      if (weapon == 1 && Bullet.time <= 0){
        bullets.push(new Bullet(fire_deg))
        Bullet.time = Bullet.wait
      }
      else if (weapon == 2 && Laser.time <= 0){
        lasers.push(new Laser(fire_deg))
        Laser.time = Laser.wait
      }
    }
  })
  $('canvas').mousedown(function(){
    if (weapon == 2 && Laser.time <= 0 && !pause)
      Laser.width = Laser.min_width
      Laser.clicked = true
  })
  $('canvas').mouseup(function(){
     Laser.clicked = false

  })
  onOff = function(pause){
    return pause ? 'On' : 'Off'
  }

  
  function init(){
    weapon = 1
    bullets = new Array()
    lasers = new Array()
    enemies = new Array()
    game_time = 0
    pause = false
    user.hp = 100
    user.points = 0
    dir = 0
    turret.deg = 0
    mouseActive = true
    turret.move = 0
    start = true
    turret.x = center.x
    turret.y = center.y
  }

  

  function Bullet(deg){
    this.deg = deg
    this.t = 0
    this.pulse_t = 0
    this.center = {
      x: turret.x,
      y: turret.y
    }
  }
  Bullet.time = 0
  Bullet.wait = 200
  Bullet.prototype.move = function(){
    if (!pause && start)
      this.t += interval 
    this.pulse_t += interval
    this.x = Math.round(this.center.x + 20*Math.sin(this.deg)*this.t/100 + Math.sin(this.deg)*turret.r)
    this.y = Math.round(this.center.y + 20*Math.cos(this.deg)*this.t/100 + Math.cos(this.deg)*turret.r)
    this.r = 2*(Math.sin(this.pulse_t/100)+2)+5
    this.color = 'rgb(0,220,'+Math.round(255*(0.5*Math.cos(this.pulse_t/2000)+0.5))+')'
    
  }
  Bullet.setStyles = function(){
    ctx.lineWidth = 20
    ctx.strokeStyle = '#eef'
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 15
  }
  Bullet.prototype.draw = function(){
    ctx.shadowColor = this.color
    ctx.lineWidth = 0
    ctx.beginPath()
    ctx.arc(this.x,this.y,this.r,0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()
  }
  Bullet.render = function(){
    if (bullets.length > 0){
      ctx.save()
      Bullet.setStyles()
      for (var i = 0; i< bullets.length; i++){
        var b = bullets[i]
        if (b.x > w || b.x < 0 || b.y > h || b.y < 0)
          bullets.splice(i, 1)
        else{
          bullets[i].move()
          bullets[i].draw()
        }
        if (enemies.length > 0){
          for (var j = 0; j< enemies.length; j++){
            var enemy = enemies[j]
            var x = (enemy.x+enemy.r > b.x-b.r) && (enemy.x-enemy.r < b.x+b.r)
            var y = (enemy.y+enemy.r > b.y-b.r) && (enemy.y-enemy.r < b.y+b.r)
            if ( y && x ){
              enemies.splice(j,1)
              bullets.splice(i,1)
              user.points += enemy.points
            }
          }
        }
      }
      ctx.restore()
    }
  }



  function Laser(deg){
   this.deg = deg
   this.end = {
    y: turret.y + Math.cos(deg)*w,
    x: turret.x + Math.sin(deg)*w
   }
   this.origin = {
    x: turret.x,
    y: turret.y
   }
   this.len = Math.round(Math.sqrt( Math.pow(this.end.x-this.origin.x,2) + Math.pow(this.end.y-this.origin.y,2) ) )
   d = new Date()
   this.start = d.getTime()
  }
  Laser.time = 0
  Laser.wait = 800
  Laser.width = 5
  Laser.sustain = 100
  Laser.clicked = false
  Laser.min_width = 5
  Laser.max_width = 150
  Laser.render = function() {
    if (Laser.clicked && !pause)
      Laser.width = Laser.width >= Laser.max_width ? Laser.max_width : Laser.width + 0.1
    if (weapon == 2){
      ctx.save()
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#fff'
      ctx.shadowColor = '#f00'
      ctx.shadowBlur = 10
      ctx.beginPath()
      var x = turret.x - (Laser.width-Laser.min_width)
      var y = turret.y-turret.r-20
      ctx.moveTo(x, y)
      ctx.lineTo(x+Laser.width*2,y)
      ctx.stroke()
      //ctx.fillRect(x, turret.y-turret.r-30, Laser.width*2, 5)
      ctx.restore()
    }
    if (lasers.length > 0){
      laser = lasers[0]
      if (laser.t > Laser.sustain){
        Laser.width = Laser.min_width
        lasers.pop()
      }
      else{
        laser.draw()
        var width = Laser.width
        for (var c = 0; c <= laser.len; c+=width*2){
          var x = Math.round(laser.origin.x + c*(Math.sin(laser.deg)))
          var y = Math.round(laser.origin.y + c*(Math.cos(laser.deg)))
          for (var i = 0; i< enemies.length; i++){
            enemy = enemies[i]
            var collision_x = (enemy.x+enemy.r > x-width) && (enemy.x-enemy.r < x+width)
            var collision_y = (enemy.y+enemy.r > y-width) && (enemy.y-enemy.r < y+width)
            if (collision_x && collision_y){
              enemies.splice(i,1)
              user.points += enemy.points
            }
          }
        }
      }
    }
  }

  Laser.prototype.draw = function(){
    now = new Date()
    this.t = now.getTime() - this.start
    ctx.save()
    ctx.lineWidth = Laser.width
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#fff'
    ctx.shadowColor = '#f00'
    ctx.shadowBlur = 40
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.beginPath()
    ctx.moveTo(this.origin.x+ Math.sin(this.deg)*turret.r, this.origin.y+ Math.cos(this.deg)*turret.r)
    ctx.lineTo(this.end.x,this.end.y)
    ctx.stroke()
    ctx.restore()
  }
  function Enemy(type){

    if (Math.random() > 0.5){
      this.spawn_x = Math.random()*(w-80)+40
      this.spawn_y = Math.random() > 0.5 ? Math.random()*40+40 : Math.random()*40+h-80
    }
    else{
      this.spawn_y = Math.random()*(h-80)+40
      this.spawn_x = Math.random() > 0.5 ? Math.random()*40+40 : Math.random()*40+w-80
    }

    this.x = this.spawn_x
    this.y = this.spawn_y
    this.deg = Math.atan2(this.y-turret.y, this.x-turret.x)
    this.t = 0;

    this.type = typeof type  !== 'undefined' ? type : 1
   // if (type == 1){
      this.r = 5
      this.points = 1;
      this.shadow = {
        color: '#f00',
        blur: 10
      }
      this.color = '#f00'
   // }
  }
  Enemy.t = 0
  Enemy.interval = 2000
  Enemy.create = function(){
    //Enemy.t +=interval
    Enemy.interval= game_time > 1000*60*2 ? 200 : 10*(Math.round( (2000-(1800*game_time)/(1000*60*2))/10 ))
    if ((Math.round(game_time) % Enemy.interval == 0) && !pause && start)
      enemies.push(new Enemy())
  }
  Enemy.render = function(){
    if (enemies.length > 0){
      for (var i = 0; i< enemies.length; i++){
        if((enemies[i].x < turret.x + turret.r + 5) && (enemies[i].x > turret.x - turret.r -5)
          && (enemies[i].y < turret.y + turret.r +5) && (enemies[i].y > turret.y - turret.r -5)){
          enemies.splice(i,1)
          user.hp = user.hp > 15 ? user.hp - 10 : 5
        }
        else
          enemies[i].draw()
      }
    }
  }
  Enemy.prototype.draw = function(){
    if (!pause && start)
      this.t += interval
    this.x = Math.round(this.spawn_x - this.t*(Math.cos(this.deg))/10)
    this.y = Math.round(this.spawn_y - this.t*(Math.sin(this.deg))/10)
    ctx.save()
    ctx.lineWidth = 5
    ctx.shadowColor = this.shadow.color
    ctx.shadowBlur = this.shadow.blur
    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x,this.y,this.r,0,2*Math.PI)
    ctx.stroke()
    ctx.restore()
  }
  weaponTime = function(){
    ctx.save()
    if (weapon == 1){
      var time = Bullet.time
      var wait = Bullet.wait
    }
    else if (weapon == 2){
      var time = Laser.time
      var wait = Laser.wait
    }
    var ratio = (wait-time)/wait
    var width = 100*ratio
    var color = 'rgb('+Math.round(255-(255*ratio))+','+Math.round(255*ratio)+',0)'
    ctx.beginPath()
    ctx.lineWidth=2
    ctx.strokeStyle= color
    ctx.rect(99,h-41,101,21)
    ctx.stroke()
    ctx.fillStyle = color
    ctx.fillRect(100,h-40,width,20);
    ctx.restore()
  }

  draw = function(){
    if (!pause && start)
      game_time+=interval
    if (dir == 1)
      turret.deg-=0.05
    else if (dir == 2)
      turret.deg+=0.05

    if (turret.deg > 2*Math.PI || turret.deg < -2*Math.PI)
      turret.deg %= 2*Math.PI

    if (turret.move == 1){  
      if (turret.y - turret.r > 0)
        turret.y -=2
    }
    else if (turret.move == 2){
      if (turret.y + turret.r < h)
        turret.y +=2
    }

    ctx.clearRect(0,0,w,h)
    ctx.fillStyle = '#eee'

    ctx.save()
    ctx.font = '15pt Calibri'
    ctx.fillText(weapon,10,20)
    ctx.fillText('Pause: '+onOff(pause) , 100,20)
    ctx.fillText('Points: '+user.points, 300,20)
    ctx.fillText('W - up, S - DOWN, LMB - FIRE, R - RESTART, P - PAUSE WEAPONS: 1,2', 400,20)
    ctx.translate(turret.x, turret.y)
    ctx.rotate(turret.deg)
    ctx.strokeStyle = '#eef'
    ctx.shadowColor = '#0af'
    ctx.shadowBlur = 40
    ctx.lineWidth = user.hp/5
    ctx.beginPath()
    ctx.arc(0,0,turret.r,0.4, 2*Math.PI-0.4)
    ctx.stroke()
    ctx.restore()
    
    Enemy.create()
    

    Laser.render()
    if (!pause){
      Laser.time = Laser.time > 0 ? Laser.time - 10 : 0
      Bullet.time = Bullet.time > 0 ? Bullet.time - 10 : 0
    }
    
    Enemy.render()
    Bullet.render()
    weaponTime()
    ctx.restore()
    if (pause){
      $(canvas).css('cursor', 'none')
      pauseTxt = 'PAUSE'
      ctx.save
      ctx.font = '150pt Calibri'
      ctx.fillText(pauseTxt,w/2-200, h/2)
      ctx.restore
    } else
      $(canvas).css('cursor', 'default')

    if (user.hp <= 10){
      start = false
      ctx.save
      ctx.font = '150pt Calibri'
      ctx.fillText("YOU LOST :<",50, h/2)
      ctx.font = '50pt Calibri'
      ctx.fillText('PRESS R TO RESTART LAMUSIE', 50, h/2+150)
      ctx.restore
    }
   
  }


});