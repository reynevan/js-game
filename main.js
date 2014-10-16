$(function(){
  
  var canvas = document.getElementById('can')
  w = 1280
  h = 840
  canvas.width = w
  canvas.height = h
  var ctx = canvas.getContext('2d')

  interval = 50

  center = {
    x: w/2,
    y: h/2
  }
  mouse = {
    x: 0,
    y: 0
  }
  turret = {
    x: center.x,
    y: center.y,
    r: 25,
    deg: 0,
    move: 0,
    last_move: 0,
    dir: 0,
    vx: 0,
    vy: 0,
    x0: 0,
    y0: 0,
    inertia: 4,
    max_vx_default: 200,
    max_vy_default: 200,
    max_vx: 200,
    max_vy: 200,
  }
  turret.dir = {
    x:0,
    y:0
  }
  turret.last_dir = {
    x:0,
    y:0
  }
  turret.drift = {
    x: 0,
    y: 0
  }
  turret.start_drift = {
    x:0,
    y:0
  }
  turret.start = {
    x: 0,
    y: 0
  }
  turret.t = {
    x:0,
    y:0
  }


  user = {
    points: 0,
    hp: 0
  }

  

  init()
  setInterval(function(){ draw()}, interval)
  
  

  function turretMove(){

    if (!pause && start){
      turret.t.x += interval
      turret.t.y += interval
      turret.deg = Math.atan2(mouse.y-turret.y,mouse.x-turret.x)
    }
    if (turret.dir.x != 0 && turret.dir.y != 0){
      turret.max_vx = 300/Math.sqrt(2)
      turret.max_vy = 300/Math.sqrt(2)
    }
    else{
      turret.max_vx = turret.max_vx_default
      turret.max_vy = turret.max_vy_default
    }

    if (turret.dir.x == -1){
      if (turret.x - turret.r > 0)
        turret.x = turret.start.x - (turret.max_vx * turret.t.x/1000)
      turret.last_dir.x = -1
      turret.vx = turret.max_vx_default
    }
    else if (turret.dir.x == 1){
      if (turret.x + turret.r < w)
        turret.x =  turret.start.x + (turret.max_vx * turret.t.x/1000)
      turret.last_dir.x = 1
      turret.vx = turret.max_vx_default
    }
    else if (turret.last_dir.x != 0){
      if (turret.x - turret.r <= 0)
        turret.last_dir.x = 1
      else if (turret.x + turret.r >= w)
        turret.last_dir.x = -1

      if (!turret.drift.x)
        turret.start_drift.x = 0
      if (turret.vx > 5 || turret.vx < -5){
        turret.drift.x = true
        if (!pause && start)
          turret.start_drift.x += interval
        turret.start_drift.x /= 1000
        //odbijanie jakos zrobic od scian
        if (turret.x + turret.r < w+5 && turret.x - turret.r > -5)
          turret.x +=  turret.last_dir.x*turret.vx*turret.start_drift.x - turret.last_dir.x*turret.inertia*turret.start_drift.x
      }
    }

    if (turret.dir.y == -1){
      if (turret.y - turret.r > 0)
        turret.y = turret.start.y - (turret.max_vy * turret.t.y/1000)
      turret.last_dir.y = -1
    }
    else if (turret.dir.y == 1){
      if (turret.y + turret.r < h)
        turret.y =  turret.start.y + (turret.max_vy * turret.t.y/1000)
      turret.last_dir.y = 1
    }
    else if (turret.last_dir.y != 0){
      if (!turret.drift.y)
        turret.start_drift.y = 0
      if (turret.y - turret.r <= 0)
        turret.last_dir.y = 1
      else if (turret.y + turret.r >= h)
        turret.last_dir.y = -1
      if (turret.vy > 10 || turret.vy < -10){
        turret.drift.y = true
        if (!pause && start)
          turret.start_drift.y += interval
        turret.start_drift.y /= 1000
        //odbijanie jakos zrobic od scian
        if (turret.y + turret.r < h+5 && turret.y - turret.r > -5)
          turret.y +=  turret.last_dir.y*turret.vy*turret.start_drift.y - turret.last_dir.y*turret.inertia*turret.start_drift.y
      }
    }

    if (!pause && start){
      turret.vx = Math.abs(((turret.x - turret.x0)/interval)*1000)
      turret.x0 = turret.x
      turret.vy = Math.abs(((turret.y - turret.y0)/interval)*1000)
      turret.y0 = turret.y
    }
  }

  $('canvas').mousemove(function(event){
    if (!pause && mouseActive){
      mouse.x = event.pageX
      mouse.y = event.pageY
    }
    if (weapon == 3 || weapon == 1){
      var y = event.pageY
      var x = event.pageX
      var deg = Math.atan2(event.pageX-turret.x, event.pageY-turret.y)
      //Gauss.deg = deg
      Bullet.deg = deg
    }
  })

  $(document).keyup(function(event){
    if (event.keyCode == 82)
      init()
    if (event.keyCode == 83 || event.keyCode == 87){ // s w
        turret.dir.y = 0
        turret.start.y = 0
        turret.t.y = 0

        turret.start.x = turret.x
        turret.t.x = 0
        
      }
    if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 65 || event.keyCode == 68){// a d szczalki
      turret.dir.x = 0
      turret.start.x = 0
      turret.t.x = 0

      turret.start.y = turret.y
      turret.t.y = 0
    }
    if (event.keyCode  == 49 ){
      weapon = 1
      Laser.clicked = false
      Gauss.clicked = false
    }
    else if (event.keyCode == 50){
      weapon = 2
      Bullet.clicked == false
      Gauss.clicked = false
    }
    else if (event.keyCode == 51){
      weapon = 3
      Bullet.clicked == false
      Laser.clicked = false
    }
    else if (event.keyCode == 80 && start){
      pause = !pause
    }
  })
  $(document).keydown(function(event){
    if (!pause && start){
      if (event.keyCode == 87){ //w
        if (turret.dir.y != -1){
          turret.start.y = turret.y
          turret.start.x = turret.x
          turret.t.y = 0
          turret.t.x = 0
        }
        turret.dir.y = -1
      }
      else if (event.keyCode == 83){ //s
        if (turret.dir.y != 1){
          turret.start.y = turret.y
          turret.start.x = turret.x
          turret.t.y = 0
          turret.t.x = 0
        }
        turret.dir.y = 1
      }
      if (event.keyCode == 37 || event.keyCode == 65){ //left, a
        if (turret.dir.x != -1){
          turret.start.x = turret.x
          turret.start.y = turret.y
          turret.t.x = 0
          turret.t.y = 0
        }
        turret.dir.x = -1
      }
      else if (event.keyCode == 39 || event.keyCode == 68){ //right, d
        if (turret.dir.x != 1){
          turret.start.x = turret.x
          turret.start.y = turret.y
          turret.t.x = 0
          turret.t.y = 0
        }
        turret.dir.x = 1
        
      }
      /*else if (event.keyCode == 17){
        if (weapon == 1)
          bullets.push(new Bullet(-turret.deg+(Math.PI/2)))
        else if (weapon == 2){
          if (lasers.length == 0)
            lasers.push(new Laser(-turret.deg+(Math.PI/2)))
        }
      }*/
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
      else if (weapon == 3 && Gauss.time <= 0){
        gauss.push(new Gauss(fire_deg))
        Gauss.time = Gauss.wait
      }
    }
  })
  $('canvas').mousedown(function(event){
    if (weapon ==1 && Bullet.time <= 0 && !pause && start)
      Bullet.clicked = true
    if (weapon == 2 && !pause && start){
      Laser.width = Laser.min_width
      Laser.clicked = true
    }
    if (weapon == 3 && Gauss.time <=0 && !pause && start){
      Gauss.clicked = true
    }
  })
    
  $('canvas').mouseup(function(){
     Laser.clicked = false
     Gauss.clicked = false
     Bullet.clicked = false
     
  })
  onOff = function(pause){
    return pause ? 'On' : 'Off'
  }

 

  //init-----------------------------------------------------------------------------
  //---------------------------------------------------------------------------------
  //---------------------------------------------------------------------------------
  function init(){
    weapon = 1
    bullets = new Array()
    lasers = new Array()
    gauss = new Array()
    enemies = new Array()
    game_time = 0
    pause = false
    user.hp = 100
    user.points = 0
    turret.dir.x = 0
    turret.deg = 0
    mouseActive = true
    turret.dir.y = 0
    turret.vx = 0 
    turret.vy = 0
    turret.last_dir.x = 0
    turret.last_dir.y = 0
    start = true
    turret.x = center.x
    turret.y = center.y
    stars = new Array()
    generate_stars()
  }

  function Gauss(deg){
    this.deg = deg
    this.t = 0
    this.speed = Gauss.speed + Math.random()*20 - 10
    this.r = 3
    this.color = '#fff'
    this.clicked =false
    this.center = {
      x: turret.x,
      y: turret.y
    }
    var Gauss_sound = soundManager.createSound({
      url: 'lasergun.mp3'
    })
    Gauss_sound.play()
  }  
  Gauss.wait = 50
  Gauss.time = 0
  Gauss.deg = 0
  Gauss.speed = 90
  Gauss.prototype.move = function(){
    if (!pause && start)
      this.t += interval 
    this.x = Math.round(this.center.x + this.speed*Math.sin(this.deg)*this.t/50 + Math.sin(this.deg)*turret.r)
    this.y = Math.round(this.center.y + this.speed*Math.cos(this.deg)*this.t/50 + Math.cos(this.deg)*turret.r)
  }
  Gauss.setStyles = function(){
    ctx.lineWidth = 3
    
    ctx.shadowColor = '#5cf'
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 10
  }
  Gauss.prototype.draw = function(){
    ctx.lineWidth = 0
    ctx.fillStyle = '#eef'
    ctx.beginPath()
    ctx.arc(this.x,this.y,this.r,0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()
    
  }
  Gauss.render = function(){
    Gauss.deg = Math.atan2(mouse.x-turret.x, mouse.y-turret.y)
    if (Gauss.clicked && Gauss.time <= 0){
      var deg = Gauss.deg + (Math.random()-0.5)*0.02
      gauss.push(new Gauss(deg))
      Gauss.time = Gauss.wait
    }
    if (gauss.length > 0){
      ctx.save()
      Gauss.setStyles()
      for (var i = 0; i< gauss.length; i++){
        var g = gauss[i]
        if (g.x > w || g.x < 0 || g.y > h || g.y < 0)
          gauss.splice(i, 1)
        else{
          gauss[i].move()
          gauss[i].draw()
        }
        if (enemies.length > 0){
          for (var j = 0; j< enemies.length; j++){
            var enemy = enemies[j]
            var x = (enemy.x+enemy.r > g.x-g.r) && (enemy.x-enemy.r < g.x+g.r)
            var y = (enemy.y+enemy.r > g.y-g.r) && (enemy.y-enemy.r < g.y+g.r)
            if ( y && x ){
              enemies.splice(j,1)
              gauss.splice(i,1)
              user.points += enemy.points
              var Boom = soundManager.createSound({
                url: 'boom.mp3'
              })
              Boom.play()
            }
          }
        }
      }
      ctx.restore()
    }
  }

  function Bullet(deg){
    this.deg = deg
    this.t = 0
    this.pulse_t = 0
    this.center = {
      x: turret.x,
      y: turret.y
    }
    var Bullet_sound = soundManager.createSound({
      url: 'laser2b.wav'
    })
    Bullet_sound.play()
  }
  Bullet.time = 0
  Bullet.wait = 200
  Bullet.deg = 0
  
  Bullet.prototype.move = function(){
    if (!pause && start)
      this.t += interval 
    this.pulse_t += interval
    this.x = Math.round(this.center.x + 20*Math.sin(this.deg)*this.t/50 + Math.sin(this.deg)*turret.r)
    this.y = Math.round(this.center.y + 20*Math.cos(this.deg)*this.t/50 + Math.cos(this.deg)*turret.r)
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
    Bullet.deg = Math.atan2(mouse.x-turret.x, mouse.y-turret.y)
    if (Bullet.clicked && Bullet.time <= 0){
      bullets.push(new Bullet(Bullet.deg))
      Bullet.time = Bullet.wait
    }
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
              var Boom = soundManager.createSound({
                url: 'boom.mp3'
              })
              Boom.play()
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
   var Laser_sound = soundManager.createSound({
      url: 'laser.mp3'
    })
    Laser_sound.play()
  }
  Laser.time = 0
  Laser.wait = 300
  Laser.width = 5
  Laser.sustain = 100
  Laser.clicked = false
  Laser.min_width = 5
  Laser.max_width = 150
  Laser.render = function() {
    if (Laser.clicked && !pause && Laser.time <=0)
      Laser.width = Laser.width >= Laser.max_width ? Laser.max_width : Laser.width + 0.2
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
              var Boom = soundManager.createSound({
                url: 'boom.mp3'
              })
              Boom.play()
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

    this.type = typeof type !== 'undefined' ? type : 1
   // if (type == 1){
      this.r = 8
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
    Enemy.interval= game_time > 100*60*3 ? 500 : 10*(Math.round( (1000-(800*game_time)/(1000*60*3))/10 ))
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
          var Boom = soundManager.createSound({
            url: 'boom.mp3'
          })
          Boom.play()
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
    ctx.lineWidth = 1
    ctx.shadowColor = this.shadow.color
    ctx.shadowBlur = this.shadow.blur
    ctx.strokeStyle = this.color
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(this.x,this.y,this.r,0,2*Math.PI)
    ctx.stroke()
    ctx.restore()
  }

  function Star() {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.start_r = Math.random() + 2
    this.red = 195 + Math.round(Math.random() * 60)
    this.blue = 195 + Math.round(Math.random() * 60)
    this.green = 195 + Math.round(Math.random() * 60)
    this.t = Math.random()*1000
    this.T = Math.random()*900 + 100
  }
  
  Star.prototype.draw = function(){
    this.t += interval
    this.r = (Math.sin(this.t/this.T)+1)*this.start_r/2
    ctx.save()
    ctx.lineWidth = 3
    ctx.fillStyle = 'rgb('+this.red+','+this.green+','+this.blue+')'
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 20
    ctx.shadowColor = '#ddd'
    ctx.lineWidth = 0
    ctx.beginPath()
    ctx.arc(this.x,this.y,this.r,0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  function generate_stars(){
    for (var i = 0; i < 50; i++)
      stars.push(new Star())
  }
  Star.render = function(){
    for (var i = 0; i < stars.length; i++){
      var star = stars[i]
      star.draw()
    }
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
    else if (weapon == 3){
      var time = Gauss.time
      var wait = Gauss.wait
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
    turretMove()

    if (turret.deg > 2*Math.PI || turret.deg < -2*Math.PI)
      turret.deg %= 2*Math.PI

    ctx.clearRect(0,0,w,h)
    ctx.fillStyle = '#eee'

    ctx.save()
    ctx.font = '15pt Calibri'
    ctx.fillText(weapon,10,20)
    ctx.fillText(enemies.length, 10,40)
    ctx.fillText('Pause: '+onOff(pause) , 100,20)
    ctx.fillText('Points: '+user.points, 300,20)
    ctx.fillText('WSAD  - MOVE, LMB - FIRE, R - RESTART, P - PAUSE WEAPONS: 1-3', 400,20)
    if (weapon == 2)
      ctx.fillText('HOLD LMB TO INCREASE LASER POWER!!!', 500,h-20)
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
    
    Star.render()
    Enemy.create()
    

    Laser.render()
    if (!pause){
      Laser.time = Laser.time > 0 ? Laser.time - interval : 0
      Bullet.time = Bullet.time > 0 ? Bullet.time - interval : 0
      Gauss.time = Gauss.time > 0 ? Gauss.time - interval : 0
    }
    
    Enemy.render()
    Bullet.render()
    Gauss.render()
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