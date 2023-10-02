//setup the canvas
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

/**make the canvas always fill the screen**/;
(function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    window.onresize = resize
})()

//for this code (as in code before this line), I almost always use the same stuff, so its going to stay here

//create the birb
let birb = {
    x: canvas.width * .1,
    y: canvas.height / 2,
    s: Math.floor(canvas.width, canvas.height) / 25,
    sy: 0
}

//set the scores
let score = 0
let highscore = localStorage.getItem('highscore') ?? 0

//and a function to add to it
function addToScore(i = 1) {
    score += i
    if (highscore < score) {
        highscore = score
        localStorage.setItem('highscore', highscore)
    }
}

//create the walls
let walls = []

//wall creating function
function createWall() {
    const gapSize = Math.random() * 250 + 250
    walls.push({
        x: canvas.width - 50 / 2,
        width: 50,
        gapStart: Math.random() * (canvas.height - gapSize),
        gapSize
    })
}

createWall()

//speed vars
let wallSpeed = 1

//the logic loop
setInterval(() => {
    const time = Math.abs(Math.cos(Date.now() / 1000))

    //move the birb with gravity
    birb.y += birb.sy
    birb.sy+=.5

    //make the walls faster with time
    wallSpeed += .005

    //run wall logic
    for (const index in walls) {
        const wall = walls[index]

        //store how far the wall needs to go
        let remaningMove = wallSpeed*time

        //loop the wall code so it can take steps
        while (remaningMove > 0) {
            //move the walls
            const move = Math.min(birb.s / 2, remaningMove)
            remaningMove -= move
            wall.x -= move

            //check for wall hits
            if (
                birb.x - birb.s / 2 >= wall.x - wall.width / 2 &&
                birb.x + birb.s / 2 <= wall.x + wall.width / 2 &&
                (
                    birb.y - birb.s / 2 <= wall.gapStart ||
                    birb.y + birb.s / 2 >= wall.gapStart + wall.gapSize
                )
            )
                document.location.reload()
        }

        //create a new wall if this one is offscreen
        if (wall.x + wall.width / 2 < 0) {
            walls.splice(index, 1)
            createWall()
            addToScore()
        }
    }

    //if the birb hits the bottom, stop it
    if (birb.y + birb.s / 2 >= canvas.height) {
        birb.sy = 0
        birb.y = canvas.height - birb.s / 2
    }

    //if the birb hits the top, stop it
    if (birb.y - birb.s / 2 < 0) {
        birb.sy = 0
        birb.y = 0 + birb.s / 2
    }


}, 1000 / 60)

//the flap function
function flap() {
    birb.sy = Math.min(birb.sy, 0)
    birb.sy = Math.max(birb.sy - 10, -25)
}

//listen for both spacebar and clicks to be mobile supported
document.addEventListener('click', e => flap())
document.addEventListener('keypress', e => flap())

    //the render loop
    ;
(function render() {
    const time = Math.abs(Math.cos(Date.now() / 1000))
    //clear the screen
    ctx.fillStyle = 'rgb(0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //setup the blur
    ctx.shadowBlur = time * 100
    ctx.shadowColor = 'rgb(0,255,0)'

    //render the walls
    const mainGrad = ctx.createRadialGradient(birb.x, birb.y, 0, birb.x, birb.y, Math.max(canvas.width + canvas.height) / 2)
    mainGrad.addColorStop(0, 'rgb(0,255,0,.5)')
    mainGrad.addColorStop(1, 'rgb(0,0,0)')

    const colorGrad = ctx.createRadialGradient(birb.x, birb.y, 0, birb.x, birb.y, Math.max(canvas.width, canvas.height) * 2)
    for (let index = 0; index < 1000; index++) {
        colorGrad.addColorStop(index / 1000, `rgb(0,${Math.abs(Math.cos(Date.now() / (index + 1))) * 255},0)`)
    }
    for (const wall of walls) {
        ctx.fillStyle = colorGrad
        ctx.fillRect(wall.x - wall.width / 2, 0, wall.width, wall.gapStart)
        ctx.fillRect(wall.x - wall.width / 2, wall.gapStart + wall.gapSize, wall.width, canvas.height - wall.gapSize - wall.gapStart)


        ctx.fillStyle = mainGrad
        ctx.fillRect(wall.x - wall.width / 2, 0, wall.width, wall.gapStart)
        ctx.fillRect(wall.x - wall.width / 2, wall.gapStart + wall.gapSize, wall.width, canvas.height - wall.gapSize - wall.gapStart)
    }

    //render the birb
    ctx.fillStyle = 'rgb(0,255,0)'
    ctx.fillRect(birb.x - birb.s / 1, birb.y - birb.s / 2, birb.s, birb.s)

    //move the birb x a little
    birb.x = (canvas.width * .5 - birb.s / 2) * time + birb.s / 2

    ctx.shadowBlur = 0

    //render the score
    ctx.shadowBlur = time * 100
    ctx.shadowColor = 'rgb(255,255,255)'
    ctx.font = `${canvas.width / 10}px arial`
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.textBaseline = 'top'
    ctx.fillText(`score: ${score}`, 0, 0)
    ctx.fillText(`highscore: ${highscore}`, 0, canvas.width / 10)

    requestAnimationFrame(render)
})()