class Sound{
    #state=false;
    constructor(src) {
        this.sounds = {};
    }
    setState = (state) => {
        this.#state=state;
    };
    add = (key,src) =>{
        let sound = document.createElement("audio");
        sound.src = src;
        sound.setAttribute("preload", "auto");
        sound.setAttribute("controls", "none");
        sound.style.display = "none";
        document.body.appendChild(sound);
        this.sounds[key] = sound;
    };
    playFor = (key,time) => {
        if(!this.#state) return;
        this.sounds[key].play();
        setTimeout(()=>{
                this.sounds[key].pause();
                this.sounds[key].currentTime = 0;
                },time);
    };
    play = (key) => {
        if(!this.#state) return;
        this.sounds[key].currentTime = 0;
        this.sounds[key].play();
    };
    playInfinite = (key) =>{
        if(!this.#state) return;
        this.sounds[key].play();
    };
    stop = (key) => {
        if(!this.#state) return;
        this.sounds[key].pause();
    };
}

class Cell{
    constructor(context,x,y,width,height,rowIndex,columnIndex) {
        this.context=context;
        this.x = x;
        this.y = y;
        this.rowIndex = rowIndex;
        this.columnIndex = columnIndex;
        this.isBomb = false;
        this.isSwiped = false;
        this.isFlaged = false;
        this.bombCount = 0;
        this.width = width;
        this.height = height;
        this.swipedColors = ["#d7b899","#e5c29f"];
        this.cellColors = ["#a7d948","#8ecc39"];
        this.textColors =["#2279cb","#0b9b45","#e6313d","black","blue","yellow","purple","magenta"]
        this.borderColor = "black";
        this.borderWidth = 1;
        this.padding = 5;
        this.fontSize = 36;
        this.fontFamily = 'Arial';
        this.textX = this.x + 15;
        this.textY = this.y + 35;
        this.bombColor = {backgroundColor:"grey",circleColor:"black"};
        this.#loadImages();
    }
    #loadImages =()=>{
        this.bombImage = new Image(50,50);
        this.bombImage.src = "images/bomb.png";
        this.bombImage.style.backgroundColor = this.cellColors[(this.rowIndex +this.columnIndex)%2];
        this.flagImage = new Image(30,30);
        this.flagImage.src = "images/flag_icon.png";
    };
    draw = () =>{
        this.context.beginPath();
        if(this.isSwiped){
            if(this.isBomb){
                this.showBomb();
            } else {
                // Draw Cell
                this.context.rect(this.x,this.y,this.width,this.height);
                this.context.fillStyle = this.swipedColors[(this.rowIndex+this.columnIndex)%2];
                this.context.fill();

                this.context.font = `${this.fontSize}px ${this.fontFamily}`;
                this.context.fillStyle = this.textColors[this.bombCount-1];
                this.context.fillText(this.bombCount.toString(),this.textX,this.textY);
            }
            this.drawCellBorder();
        } else {
            this.context.rect(this.x,this.y,this.width,this.height);
            this.context.fillStyle =  this.cellColors[(this.rowIndex+this.columnIndex)%2];
            this.context.fill();

        }
        if(this.isFlaged) this.drawFlag();
        this.context.closePath();

    };
    drawCellBorder = () =>{
    this.context.strokeStyle = this.borderColor;
    this.context.lineWidth = this.borderWidth;
    this.context.strokeRect(this.x, this.y, this.width,this.height);
    };
    drawFlag = () =>{
        this.context.drawImage(this.flagImage,this.x+10,this.y+10,this.width-20,this.height-20);
    };
    showBomb =  () =>{
        this.isSwiped=true;
        this.context.beginPath();
        // Draw Cell
        this.context.rect(this.x,this.y,this.width,this.height);
        this.context.fillStyle = this.bombColor.backgroundColor;
        this.context.fill();
        this.context.closePath();
        this.context.drawImage(this.bombImage,this.x,this.y,50,50);
        /*
        // Draw bomb circle
        this.context.beginPath();
        this.context.fillStyle = this.bombColor.circleColor;
        this.context.arc(this.x+(this.width/2), this.y+(this.height/2), Math.min(this.height/3,this.width/3)-this.padding, 0, 2 * Math.PI);
        this.context.fill();
        this.context.closePath();
         */
    };
    isClicked = (x,y) =>{
        if(this.isSwiped) return  false;
        else return (this.x < x && this.x+ this.width > x && this.y < y && this.y + this.height > y);
    };
    handleClick = () =>{
        this.isFlaged = false;
        this.isSwiped = true;
    };
}
class Grid{
    constructor(context,rowCount,columnCount,x,y,cellSize) {
        this.context = context;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.x = x;
        this.y = y;
        this.cellSize = cellSize;
        this.width = x + this.columnCount*this.cellSize;
        this.height = y + this.rowCount*this.cellSize;
        this.bombColors = [
            {backgroundColor:"#ff00b1", circleColor:"#a80073"},
            {backgroundColor:"#fac500", circleColor:"#a38000"},
            {backgroundColor:"#c900f0", circleColor:"#83009c"},
            {backgroundColor:"#009348", circleColor:"#00602f"},
            {backgroundColor:"#4475eb", circleColor:"#2d4d9a"},
            {backgroundColor:"#ff7500", circleColor:"#a84d00"},
            {backgroundColor:"#ed0025", circleColor:"#9a0019"}
        ];
        this.#initGrid();
        this.#plantBombs();
    }

    #initGrid = () =>{
        this.grid = [];
        for(let r = 0 ; r < this.rowCount ; ++r){
            this.grid[r] = [];
            for(let c = 0 ; c < this.columnCount ; ++c){
                this.grid[r][c] = new Cell(this.context,(c*this.cellSize + this.x),(r*this.cellSize + this.y),this.cellSize,this.cellSize,r,c);
            }
        }
    };
    #plantBombs = () => {
        this.bombs=[]
        for(let i=0 ; i < 9 ; ++i) {
            let random = Math.floor(Math.random() * 80);
            let rowIndex = Math.floor(random / 9);
            let columnIndex = random % 9;
            this.bombs.push([rowIndex,columnIndex]);
            this.grid[rowIndex][columnIndex].isBomb = true;
            this.grid[rowIndex][columnIndex].bombColor = this.bombColors[i%this.bombColors.length];
            // Add bomb Count to adjacent cells
            let adjacentCells = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
            adjacentCells.forEach((value) => {
                let adjacentRowIndex = rowIndex+value[0];
                let adjacentColumnIndex = columnIndex+value[1];
                if(adjacentRowIndex >= 0 && adjacentRowIndex < this.rowCount && adjacentColumnIndex >=0 && adjacentColumnIndex < this.columnCount ){
                    this.grid[adjacentRowIndex][adjacentColumnIndex].bombCount++;
                }
            });
        }
    };
    draw = () => {
        for(let r = 0 ; r < this.rowCount ; ++r){
            for(let c = 0 ; c < this.columnCount ; ++c){
                this.grid[r][c].draw();
            }
        }
    };
    isClicked = (x,y) => {
        return (this.x < x && (this.x + this.width) > x && this.y < y && (this.y + this.height) > y);
    };
    handleClick = (x,y,remainingFlags,callback) => {
        for(let r = 0 ; r < this.rowCount ; ++r){
            for(let c = 0 ; c < this.columnCount ; ++c){
                let cell = this.grid[r][c];
                if(cell.isClicked(x,y))
                {
                    let flagged = cell.isFlaged;
                    cell.handleClick();
                    if(flagged && !cell.isFlaged) remainingFlags++;
                    callback(cell.isBomb,Math.max(cell.bombCount,1),remainingFlags);
                    return;
                }
            }
        }
    };
    handleRightClick = (x,y,remainingFlags,callback) =>{
        if(x > this.x && x < (this.x + this.width) && y > this.y && y < (this.y+this.height))
        {
            for(let r = 0 ; r < this.rowCount ; ++r){
                for(let c = 0 ; c < this.columnCount ; ++c){
                    let cell = this.grid[r][c];
                    if(cell.isClicked(x,y))
                    {
                        if(cell.isFlaged) {
                                cell.isFlaged = !cell.isFlaged;
                                callback(cell.isFlaged);
                        } else if( remainingFlags > 0) {
                                cell.isFlaged = !cell.isFlaged;
                                callback(cell.isFlaged);
                        }
                        return;
                    }
                    }
                }
        } else callback(false);
    };
    showBombs =  (gameSound,callback) =>{
        let bomb=0;
        let bombIntervalId = setInterval(()=>{
            if(bomb === this.bombs.length) {
                clearInterval(bombIntervalId);
                return;
            }
            let row = this.bombs[bomb][0];
            let column = this.bombs[bomb][1];
            this.grid[row][column].showBomb();
            gameSound.playFor('bomb',450);
            ++bomb;
        },500);
        setTimeout(callback,500*(this.bombs.length+5));
    };
}
class Game{
    #volume;
    constructor() {
        this.timeElapsedDiv = document.getElementById('timeElapsed');
        this.remainingFlagsDiv = document.getElementById('flagCount');
        this.volumeButton = document.getElementById('volume');
        this.volumeButton.addEventListener('click',this.#toggleVolume);
        this.canvas = document.getElementById('game');
        this.canvas.setAttribute('width',(50*9).toString());
        this.canvas.setAttribute('height',(50*9).toString());
        this.context = this.canvas.getContext('2d');
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.#volume = true;
        this.gameSound = new Sound();
        this.gameSound.setState(this.#volume);
        this.#loadImages();
    }
    #toggleVolume = () => {
        this.#volume = !this.#volume;
        this.#volume ? this.volumeButton.src = "images/volume_on.png" : this.volumeButton.src = "images/volume_off.png";
        this.gameSound.setState(this.#volume);
    };
    #loadGameSounds = () => {
        this.gameSound.add("pop","sounds/pop.mp3");
        this.gameSound.add("gameOver","sounds/gameOver.mp3");
        this.gameSound.add("bomb","sounds/bomb.mp3");
        this.gameSound.add('flag',"sounds/flag.mp3");
    };
    init = () => {
        this.gameFinished = false;
        this.score = 0;
        this.timeElapsed = 0;
        this.remainingFlags = 10;
        this.margin = 10;
        this.rows = 9;
        this.columns = 9;
        this.gridCellSize = 50;
        this.gridOffset =(this.canvasWidth - this.gridCellSize*this.columns)/2;
        this.gridOffsetTop=0;
        this.grid = new Grid(this.context,this.rows,this.columns,this.gridOffset,this.gridOffsetTop,this.gridCellSize);
        this.canvas.addEventListener('click',this.handleClick);
        this.canvas.oncontextmenu = this.handleRightClick;
        this.create();
    };
    #loadImages = () => {
        this.welcomeImage = new Image(this.canvasWidth,this.canvasHeight);
        this.welcomeImage.src = "images/wallpaper1.png";
        this.welcomeImage.onload = this.drawStartScreen;
    };
    handleRightClick = () => {
        let rect = this.canvas.getBoundingClientRect();
        let x = window.event.clientX - rect.left;
        let y = window.event.clientY - rect.top;
        this.grid.handleRightClick(x,y,this.remainingFlags,(isCellFlagged)=>{
            this.gameSound.play("flag");
            if(isCellFlagged){
                if(this.remainingFlags > 0 ) this.remainingFlags--;
            }else {
                if(this.remainingFlags < 10) this.remainingFlags++;
            }
            this.updateFlagCount();
        });
        return false;
    };
    handleClick = (event) => {
        if(this.gameFinished) return;
        let rect = this.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        if(this.grid.isClicked(x,y))
        {
            this.grid.handleClick(x,y,this.remainingFlags,(gameOver,score,remainingFlags)=>{
                this.gameSound.play('pop');
                this.remainingFlags = remainingFlags;
                this.updateFlagCount();
                if(gameOver)
                {
                    this.gameFinished = true;
                    clearInterval(this.elapsedTimeIntervalId);
                    this.grid.showBombs(this.gameSound,()=>{
                        this.gameSound.play("gameOver");
                        this.drawGameFinish("Game Over");
                    });
                }
                else this.score+=score;
            });
        }
    };
    updateTimeElapsed = () =>{
        this.timeElapsedDiv.innerHTML = this.timeElapsed;
        ++this.timeElapsed;
    };
    updateFlagCount = () =>{
        this.remainingFlagsDiv.innerHTML = this.remainingFlags;
    };
    create = () => {
        this.elapsedTimeIntervalId = setInterval(this.updateTimeElapsed,1000);
        this.gameIntervalId = setInterval(this.update,10);
    };
    update = () => {
        this.context.clearRect(0,0,this.canvasWidth,this.canvasHeight);
        this.grid.draw();
    };
    drawStartScreen = () =>{
        this.canvas.onclick = () => {
            this.canvas.onclick = () =>{};
            this.#loadGameSounds();
            this.init();
        };
        this.context.clearRect(0,0,this.canvasWidth,this.canvasHeight);
        this.context.drawImage(this.welcomeImage,0,0,this.canvasWidth,this.canvasHeight-30);
        this.context.font = "20px Arial";
        this.context.fillStyle = "red";
        this.context.fillText(`Click here to Start Game`,120,this.canvasHeight-20);

    };
    drawGameFinish = (heading) =>{
        clearInterval(this.gameIntervalId);
        this.canvas.onclick = () => {
            this.canvas.onclick = () =>{};
            this.init();
        };
        this.context.clearRect(0,0,this.canvasWidth,this.canvasHeight);
        this.context.font = "80px Arial";
        this.context.fillStyle = "darkgreen";
        this.context.fillText(heading,30,100);
        this.context.font = "40px Arial";
        this.context.fillStyle = "green";
        this.context.fillText(`Your Score is ${this.score}`,100,200);
        this.context.font = "20px Arial";
        this.context.fillStyle = "red";
        this.context.fillText(`Click here to restart..!!`,130,300);

    };
}

window.onload = () =>{
    new Game();
};
