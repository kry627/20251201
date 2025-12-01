let spriteSheetIdle, spriteSheetWalk, spriteSheetJump, spriteSheetAttack, spriteSheetTool;
let animationIdle = [];
let animationWalk = [];
let animationJump = [];
let animationAttack = [];
let animationTool = [];
let currentFrame = 0;

// 靜止動畫的圖片精靈資訊
const idleFrameCount = 9;
const idleFrameWidth = 958 / idleFrameCount;
const idleFrameHeight = 212;

// 走路動畫的圖片精靈資訊
const walkFrameCount = 9;
const walkFrameWidth = 1246 / walkFrameCount;
const walkFrameHeight = 198;

// 跳躍動畫的圖片精靈資訊
const jumpFrameCount = 10;
const jumpFrameWidth = 1365 / jumpFrameCount;
const jumpFrameHeight = 188;

// 攻擊動畫的圖片精靈資訊
const attackFrameCount = 6;
const attackFrameWidth = 1561 / attackFrameCount;
const attackFrameHeight = 155;

// 能量波動畫的圖片精靈資訊
const toolFrameCount = 5;
const toolFrameWidth = 740 / toolFrameCount;
const toolFrameHeight = 19;

// 角色狀態
let x, y;
let speed = 5;
let direction = 1; // 1: 往右, -1: 往左
let isMoving = false;
let isJumping = false;
let isAttacking = false;
let attackFrame = 0;
let startY;
let jumpVelocity = 0;
const gravity = 0.8;

// 能量波
let projectiles = [];

function preload() {
  // 預載入圖片精靈檔案
  spriteSheetIdle = loadImage('stop-all.png');
  spriteSheetWalk = loadImage('walk-all.png');
  spriteSheetJump = loadImage('jump-all.png');
  spriteSheetAttack = loadImage('attack-all.png');
  spriteSheetTool = loadImage('tool-all.png');
}

function setup() {
  // 建立一個全視窗的畫布
  createCanvas(windowWidth, windowHeight);
  x = width / 2;
  y = height / 2;
  startY = y;

  // 從圖片精靈中切割出靜止動畫的每一格
  for (let i = 0; i < idleFrameCount; i++) {
    let img = spriteSheetIdle.get(i * idleFrameWidth, 0, idleFrameWidth, idleFrameHeight);
    animationIdle.push(img);
  }

  // 從圖片精靈中切割出走路動畫的每一格
  for (let i = 0; i < walkFrameCount; i++) {
    let img = spriteSheetWalk.get(i * walkFrameWidth, 0, walkFrameWidth, walkFrameHeight);
    animationWalk.push(img);
  }

  // 從圖片精靈中切割出跳躍動畫的每一格
  for (let i = 0; i < jumpFrameCount; i++) {
    let img = spriteSheetJump.get(i * jumpFrameWidth, 0, jumpFrameWidth, jumpFrameHeight);
    animationJump.push(img);
  }

  // 從圖片精靈中切割出攻擊動畫的每一格
  for (let i = 0; i < attackFrameCount; i++) {
    let img = spriteSheetAttack.get(i * attackFrameWidth, 0, attackFrameWidth, attackFrameHeight);
    animationAttack.push(img);
  }

  // 從圖片精靈中切割出能量波動畫的每一格
  for (let i = 0; i < toolFrameCount; i++) {
    let img = spriteSheetTool.get(i * toolFrameWidth, 0, toolFrameWidth, toolFrameHeight);
    animationTool.push(img);
  }

  // 設定動畫播放速度
  frameRate(12);
}

function draw() {
  // 設定背景顏色
  background('#d6ccc2');

  imageMode(CENTER);

  let currentImage;

  // 決定角色當前應該顯示的圖片
  if (isAttacking) {
    // 處理攻擊動畫
    currentImage = animationAttack[attackFrame];
    attackFrame++;

    if (attackFrame >= attackFrameCount) {
      isAttacking = false;
      attackFrame = 0;
      // 攻擊動畫結束時，發射能量波
      let projectile = {
        x: x + (direction * 80), // 從角色前方發射
        y: y,
        direction: direction,
        speed: 15
      };
      projectiles.push(projectile);
    }
  } else if (isJumping) {
    // 處理跳躍動畫和位移
    y -= jumpVelocity;
    jumpVelocity -= gravity;

    let jumpFrameIndex = (jumpVelocity > 0) ? 4 : 8; // 簡化的上升/下降影格
    currentImage = animationJump[jumpFrameIndex];

    if (y >= startY) {
      y = startY;
      isJumping = false;
    }
  } else if (isMoving) {
    // 處理走路動畫和位移
    x += speed * direction;
    currentImage = animationWalk[currentFrame % animationWalk.length];
  } else {
    // 靜止狀態
    currentImage = animationIdle[currentFrame % animationIdle.length];
  }

  // 繪製角色
  push(); // 保存當前的繪圖狀態
  translate(x, y); // 將原點移動到角色的位置
  scale(direction, 1); // 根據方向翻轉畫布
  image(currentImage, 0, 0);
  pop(); // 恢復到之前的繪圖狀態

  // 更新和繪製所有能量波
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    p.x += p.speed * p.direction;

    push();
    translate(p.x, p.y);
    scale(p.direction, 1);
    image(animationTool[currentFrame % animationTool.length], 0, 0);
    pop();

    // 如果能量波超出畫面，則將其移除
    if (p.x > width + 100 || p.x < -100) {
      projectiles.splice(i, 1);
    }
  }

  currentFrame++;
}

function keyPressed() {
  if (isAttacking || isJumping) return; // 攻擊或跳躍中不接受新指令

  if (keyCode === RIGHT_ARROW) {
    isMoving = true;
    direction = 1;
  } else if (keyCode === LEFT_ARROW) {
    isMoving = true;
    direction = -1;
  } else if (keyCode === UP_ARROW) {
    isJumping = true;
    jumpVelocity = 18; // 給予一個向上的初速度
  } else if (keyCode === 32) { // 空白鍵
    isAttacking = true;
    isMoving = false;
    attackFrame = 0;
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    isMoving = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
