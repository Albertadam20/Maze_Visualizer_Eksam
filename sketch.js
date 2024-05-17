let connection                                              
let maze_config = 1                                          
let maze_id = "F6"   
let old_maze_id = "F6"                                                             
let maze_state = "start"                                  
let maze_timer = 0                                            
let time = 0                                              
let maze_ON_OFF = "OFF"  
let center = 160
let adj_up = 141
let adj_down = 0
let adj_left = 164
let adj_right = 0
let returning
let death_screen, start_screen
let moving_sound
let theme_music, in_game_music
let light_bulb = 0 
let time_tick = 0
let time_tick_counter = 0
let light_bulb_2
let cheating_dialog, dead_dialog, reminder_dialog, start_dialog, winning_dialog, wall_dialog
let cheating = false
let dead_by_time = false
let death_sound

let UI
let image_x = 6400
let image_y = 3550
let x = 1280
let y = 710
let config = 710 * 6


function preload(){

cheating_dialog = loadSound ("Sounds/cheating_dialog.mp3")
dead_dialog = loadSound ("Sounds/dead_dialog.mp3")
reminder_dialog = loadSound ("Sounds/reminder_dialog.mp3")
start_dialog = loadSound ("Sounds/start_dialog.mp3")
wall_dialog = loadSound ("Sounds/wall_dialog.mp3")
winning_dialog = loadSound ("Sounds/winning_dialog.mp3")

death_sound = loadSound ("Sounds/death_sound.mp3")
light_bulb_2 = loadSound ("Sounds/light_bulb_2.mp3")
light_bulb = loadSound ("Sounds/light_bulb.mp3")
theme_music = loadSound ("Sounds/theme.mp3")
in_game_music = loadSound ("Sounds/in_game_music.mp3")
moving_sound = loadSound("Sounds/moving.mp3")

  death_screen = loadImage("UI/death_screen.png")
  start_screen = loadImage("UI/start_screen.png")

  UI = loadImage ("UI/Maze_id_UI.jpg")

}
function setup(){   

  setInterval(timer, 1045)

  createCanvas(1280, 710) 
  background(220)

  connection = mqtt.connect("wss://mqtt.nextservices.dk")     
  connection.on("connect", (m) => {})     
  
  connection.publish('maze_state', 'start')                              
  connection.publish('maze_config', '1') 
  connection.publish('maze_timer', '0') 
  connection.publish("center","160")
  connection.publish('adj_up',"141")
  connection.publish('adj_down',"0")
  connection.publish('adj_left',"164")
  connection.publish('adj_right',"0")
  connection.publish('maze_ON_OFF',"OFF")
  
  connection.subscribe("maze_ON_OFF")                         
  connection.subscribe("maze_config")                         
  connection.subscribe("maze_id")                              
  connection.subscribe("maze_state")
  connection.subscribe("light_bulb_2")
  
  connection.on("message", (topic, ms) => {  
    
    if(topic == "light_bulb_2"){
      light_bulb_2.setVolume(0.4)
      light_bulb_2.play()

    }
    
    if(topic == "maze_ON_OFF"){                                
      maze_ON_OFF = ms   
      if (maze_ON_OFF == "ON"){
      console.log('Maze Started')  
      cheating = false
      dead_by_time = false 

        if(!start_dialog.isPlaying()){
          start_dialog.setVolume(0.8)
          start_dialog.play()

          cheating_dialog.stop()
          dead_dialog.stop()
          reminder_dialog.stop()
          wall_dialog.stop()
          winning_dialog.stop()
        }

      } 
    }
                                                         
    if(topic == "maze_config"){
      maze_config = parseInt(ms)  
      maze_timer = 0
      time = 0
      time_tick_counter = 0
      connection.publish('maze_timer', '0')
    }                            
    
    if(topic == "maze_id"){
      maze_id = ms.toString()
      adjecent_tiles()


      image_x = parseInt(maze_id.charAt(1)) * x - 1280 
      image_y = (parseInt((maze_id.charCodeAt(0) - 64 )* y - 710)) + ((config * maze_config) - 710 * 6)
      image (UI, -image_x, -image_y)

      console.log("x= " + image_x + " y= " + image_y)


      if (maze_ON_OFF == "ON"){
        moving_sound.setVolume(0.5)
        moving_sound.play()
      }
      
    }        
    
    if(topic == "maze_state"){ 
      maze_state = ms.toString() 

      if(maze_state == "return"){
        death_sound.setVolume(0.5)
        death_sound.play()
      }

      if(maze_state == "return" && cheating == true){
        if(!cheating_dialog.isPlaying()){
        cheating_dialog.setVolume(0.8)
        cheating_dialog.play()

        dead_dialog.stop()
        reminder_dialog.stop()
        start_dialog.stop()
        wall_dialog.stop()
        winning_dialog.stop()
        }
      }else if(maze_state == "return" && dead_by_time == true){
        if(!dead_dialog.isPlaying()){
        dead_dialog.setVolume(0.8)
        dead_dialog.play()

        cheating_dialog.stop()
        reminder_dialog.stop()
        start_dialog.stop()
        wall_dialog.stop()
        winning_dialog.stop()
        }
      }else if(maze_state == "return"){
        if(!wall_dialog.isPlaying()){
        wall_dialog.setVolume(0.8)
        wall_dialog.play()

        cheating_dialog.stop()
        dead_dialog.stop()
        reminder_dialog.stop()
        start_dialog.stop()
        winning_dialog.stop()
        }
      }

      if (maze_state == "finnished"){
        winning_dialog.setVolume(0.8)
        winning_dialog.play()

        cheating_dialog.stop()
        dead_dialog.stop()
        reminder_dialog.stop()
        start_dialog.stop()
        wall_dialog.stop()
      }

      
    }                                                       
  })                                                      
}                                                              
function timer(){
  if (maze_ON_OFF == "ON") {
    if(maze_timer >= 60 * 3){ 
      dead_by_time = true
      maze_state = 'dead'
      time = 0
      time_tick = 0
      time_tick_counter = 0
      connection.publish('maze_state', 'dead') 
      connection.publish('maze_timer', '0')    

    }  
    if(maze_state !== "tile" && maze_state !== "checkpoint") {
      maze_timer = 0
      time = 0
      time_tick = 0
      time_tick_counter = 0
      connection.publish('maze_timer', '0') 
    }
    
    time_tick = time_tick + 1
    
    if (time_tick == 6){
      time_tick = 0
      time_tick_counter = time_tick_counter + 1
      connection.publish ("maze_timer", time_tick_counter.toString())
      light_bulb.setVolume (0.5)
      light_bulb.play()
      console.log(time_tick_counter)

      if(time_tick_counter == 15){
        if(!reminder_dialog.isPlaying()){
        reminder_dialog.setVolume(0.8)
        reminder_dialog.play()

        cheating_dialog.stop()
        dead_dialog.stop()
        start_dialog.stop()
        wall_dialog.stop()
        winning_dialog.stop()
        }
      }

    }
    
    maze_timer = time + 1
    time = maze_timer

  }
}
function adjecent_tiles(){
  if (maze_ON_OFF == "ON"){
    console.log("Location = " + maze_id)    
  
    switch (maze_id){
      case "A1":
        center = 1
        adj_up = 0 
        adj_down = 60
        adj_left = 0
        adj_right = 5
        break
      case "A2":
        center = 5
        adj_up = 0
        adj_down = 56
        adj_left = 1
        adj_right = 9
        break
      case "A3":
        center = 9
        adj_up = 0
        adj_down = 52
        adj_left = 5
        adj_right = 13
        break
      case "A4":
        center = 13
        adj_up = 0
        adj_down = 48
        adj_left = 9
        adj_right = 17
        break
      case "A5":
        center = 17
        adj_up = 0
        adj_down = 44
        adj_left = 13
        adj_right = 21
        break
      case "A6":
        center = 21
        adj_up = 0
        adj_down = 40
        adj_left = 17
        adj_right = 0
        break
      case "B1":
        center = 60
        adj_up = 1
        adj_down = 61
        adj_left = 0
        adj_right = 56
        break
      case "B2":
        center = 56
        adj_up = 5
        adj_down = 65
        adj_left = 60
        adj_right = 52
        break
      case "B3":
        center = 52
        adj_up = 9 
        adj_down = 69
        adj_left = 56 
        adj_right = 48
        break
      case "B4":
        center = 48
        adj_up = 13
        adj_down = 73
        adj_left = 52
        adj_right = 44
        break
      case "B5":
        center = 44
        adj_up = 17
        adj_down = 77
        adj_left = 48
        adj_right = 40
        break
      case "B6":
        center = 40
        adj_up = 21
        adj_down = 81
        adj_left = 44
        adj_right = 0
        break
      case "C1":
        center = 61
        adj_up = 60
        adj_down = 120
        adj_left = 0
        adj_right = 65
        break
      case "C2":
        center = 65
        adj_up = 56
        adj_down = 116
        adj_left = 61
        adj_right = 69
        break
      case "C3":
        center = 69
        adj_up = 52
        adj_down = 112
        adj_left = 65
        adj_right = 73
        break
      case "C4":
        center = 73
        adj_up = 48
        adj_down = 108
        adj_left = 69
        adj_right = 77
        break
      case "C5":
        center = 77
        adj_up = 44
        adj_down = 104
        adj_left = 73
        adj_right = 81
        break
      case "C6":
        center = 81
        adj_up = 40
        adj_down = 100
        adj_left = 77
        adj_right = 0
        break
      case "D1":
        center = 120
        adj_up = 61
        adj_down = 121
        adj_left = 0
        adj_right = 116
        break
      case "D2":
        center = 116
        adj_up = 65
        adj_down = 125
        adj_left = 120
        adj_right = 112
        break
      case "D3":
        center = 112
        adj_up = 69
        adj_down = 129
        adj_left = 116
        adj_right = 108
        break
      case "D4":
        center = 108
        adj_up = 73
        adj_down = 133
        adj_left = 112
        adj_right = 104
        break
      case "D5":
        center = 104
        adj_up = 77
        adj_down = 137
        adj_left = 108
        adj_right = 100
        break
      case "D6":
        center = 100
        adj_up = 81
        adj_down = 141
        adj_left = 104
        adj_right = 0
        break
      case "E1":
        center = 121
        adj_up = 120
        adj_down = 180
        adj_left = 0
        adj_right = 125
        break
      case "E2":
        center = 125
        adj_up = 116
        adj_down = 176
        adj_left = 121
        adj_right = 129
        break
      case "E3":
        center = 129
        adj_up = 112
        adj_down = 172
        adj_left = 125
        adj_right = 133
        break
      case "E4":
        center = 133
        adj_up = 108
        adj_down = 168
        adj_left = 129
        adj_right = 137
        break
      case "E5":
        center = 137
        adj_up = 104
        adj_down = 164
        adj_left = 133
        adj_right = 141
        break
      case "E6":
        center = 141
        adj_up = 100
        adj_down = 160
        adj_left = 137
        adj_right = 0
        break
      case "F1":
        center = 180
        adj_up = 121
        adj_down = 0
        adj_left = 0
        adj_right = 176
        break
      case "F2":
        center = 176
        adj_up = 125
        adj_down = 0
        adj_left = 180
        adj_right = 172
        break
      case "F3":
        center = 172
        adj_up = 129
        adj_down = 0
        adj_left = 176
        adj_right = 168
        break
      case "F4":
        center = 168
        adj_up = 133
        adj_down = 0
        adj_left = 172
        adj_right = 164
        break
      case "F5":
        center = 164
        adj_up = 137
        adj_down = 0
        adj_left = 168
        adj_right = 160
        break
      case "F6":
        center = 160
        adj_up = 141
        adj_down = 0
        adj_left = 164
        adj_right = 0
        break
    }
    connection.publish("center",center.toString())
    connection.publish("adj_up",adj_up.toString())
    connection.publish("adj_down",adj_down.toString())
    connection.publish("adj_left",adj_left.toString())
    connection.publish("adj_right",adj_right.toString())

    if(maze_state !== "return"){
      if ((maze_id.charCodeAt(0) == old_maze_id.charCodeAt(0) || maze_id.charCodeAt(0) == old_maze_id.charCodeAt(0) - 1 || maze_id.charCodeAt(0) == old_maze_id.charCodeAt(0) + 1) && ( parseInt(maze_id.charAt(1)) == parseInt(old_maze_id.charAt(1)) || parseInt(maze_id.charAt(1)) == parseInt(old_maze_id.charAt(1)) - 1 || parseInt(maze_id.charAt(1)) == parseInt(old_maze_id.charAt(1)) + 1) && !((maze_id.charCodeAt(0) !== old_maze_id.charCodeAt(0)) && parseInt(maze_id.charAt(1)) !== parseInt(old_maze_id.charAt(1)))){
      
      }else{
        cheating = true
        console.log("cheating!")
        connection.publish("maze_state", "dead")

      }
     }
     old_maze_id = maze_id
  }    
}  
function draw(){
  if (maze_state == "return"){
    image(death_screen, 0, 0, 1280, 710)
    if (maze_id == "F6"){
      image(start_screen, 0, 0, 1280, 710)
    }
  }
  else if (maze_state == "start" || maze_ON_OFF == "OFF"){
   image(start_screen, 0, 0, 1280, 710)
  }
  else{
   image(UI, -image_x, -image_y)
  }

  if (maze_ON_OFF == "OFF" || maze_state == "start"){
    if (!theme_music.isPlaying()){
    in_game_music.pause()
    theme_music.setVolume(0.4)
    theme_music.loop()
    }
  }else{
    if (!in_game_music.isPlaying()){
    theme_music.pause()
    in_game_music.setVolume(0.5)
    in_game_music.loop() 
    }
  }



}
