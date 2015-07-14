/**
 * Created by artemvlasov on 12/07/15.
 */
var app = angular.module('test.controllers', []);

app.controller('TestCtrl', ['ColorPicker', 'Html5LocalStorageTest', '$scope', '$timeout', 'prevScore', 'maxScore', function(ColorPicker, Html5LocalStorageTest, $scope, $timeout, prevScore, maxScore) {
    var numbers = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
    var canvas = document.getElementById("2048Canvas");
    var ctx = canvas.getContext('2d');
    var fieldSize = 4;
    var squareSize = 100;
    var squareWidth = Math.floor(squareSize * 0.9);
    var squareHeight = Math.floor(squareSize * 0.9);
    var width = fieldSize * squareSize;
    var height = fieldSize * squareSize;
    var squareBorder = Math.floor(squareSize * 0.05);
    $scope.maxScore = maxScore;
    $scope.prevScore = prevScore;
    canvas.width = width;
    canvas.height = height;
    var field = [];
    var directions = {
        rightDirection : {
            x: 1,
            y: 0
        },
        leftDirection: {
            x: -1,
            y: 0
        },
        topDirection: {
            x: 0,
            y: -1
        },
        bottomDirection: {
            x: 0,
            y: 1
        }

    };
    function createInitialFieldSquares() {
        for (var i = 0; i < fieldSize * fieldSize; i++) {
            field[i] = null;
        }
        for(var j = 0; j < 2; j++) {
            var squarePosition;
            do {
                squarePosition = Math.floor(Math.random() * fieldSize * fieldSize);
            } while(field[squarePosition] != null);
            field[squarePosition] = createSquare(squarePosition, 0);
        }
    }
    $scope.init = function() {
        $scope.gameScore = 0;
        window.addEventListener('keydown', handleKeydown, false);
        createInitialFieldSquares();
        drawField();
    };
    $scope.resetGame = function() {
        if(Html5LocalStorageTest()) {
            $scope.maxScore = localStorage.getItem("max");
            $scope.prevScore = localStorage.getItem("prev");
        }
        $scope.init();
    };
    function drawField() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#C0BABE";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#8C9E9F';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, width, height);
        ctx.stroke();
        for (var i = 0; i < fieldSize; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 100);
            ctx.lineTo(width, i * 100);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i * 100, 0);
            ctx.lineTo(i * 100, height);
            ctx.stroke();
        }
        for(var i = 0; i < fieldSize * fieldSize; i++) {
            if(!_.isNull(field[i])) {
                drawSquare(field[i]);
            }
        }
    }
    function drawSquare(square) {
        ctx.fillStyle = ColorPicker(square.value);
        ctx.fillRect(square.x * squareSize + squareBorder, square.y * squareSize + squareBorder, squareWidth, squareHeight);
        ctx.fillStyle = 'black';
        ctx.font = "normal normal 20px Verdana";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(square.value, square.x * squareSize + squareSize / 2, square.y * squareSize + squareSize / 2);
    }
    //requestAnimationFrame(animationLoop);
    //function animationLoop() {
    //    ctx.clearRect(0, 0, width, height);
    //    drawField(fieldSize);
    //    requestAnimationFrame(animationLoop);
    //}
    function handleKeydown(evt) {
        if(allSquaresIsFull() && !checkSquares()) {
            if(Html5LocalStorageTest()) {
                localStorage.setItem("prev", $scope.gameScore);
                if($scope.gameScore > localStorage.getItem("max")) {
                    localStorage.setItem("max", $scope.gameScore);
                }
            }
            window.removeEventListener('keydown', handleKeydown);
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "normal normal bold 50px Verdana";
            ctx.fillText("Game over", width / 2, height / 2);
        } else {
            var key = evt.keyCode;
            var moved = 0;
            switch (key) {
                //right
                case 102:
                    moved = moveSquares(directions.rightDirection);
                    break;
                //left
                case 100:
                    moved = moveSquares(directions.leftDirection);
                    break;
                //top
                case 104:
                    moved = moveSquares(directions.topDirection);
                    break;
                //bottom
                case 98:
                    moved = moveSquares(directions.bottomDirection);
                    break;
                default:
                    break;
            }
            if(moved > 0) {
                addRandomSquare();
            }
            drawField();
        }
    }
    function searchForAvailiableSquare(direction) {
        var squareCount = 0;
        var availableSquarePosition = 0;
        do {
            if(field[squareCount] != null) {
                if(squareHasMoves(field[squareCount], direction)) {
                    availableSquarePosition = coordinatesToPosition(field[squareCount]);
                }
            }
            squareCount++;
        } while(availableSquarePosition == 0 || squareCount < 16)
        return availableSquarePosition;
    }
    function moveSquares(direction) {
        var allSquareMoves = 0;
        var moved = 0;
        var previousIterationMoves = 0;
        var hasMoves = true;
        do {
            if(Math.floor(allSquareMoves / 16) > 0 && allSquareMoves % 16 == 0 && previousIterationMoves == moved) {
                hasMoves = false;
            } else if(allSquareMoves % 16 == 0) {
                previousIterationMoves = moved;
            }
            if(!_.isNull(field[allSquareMoves % 16])) {
                if(moveSquare(field[allSquareMoves % 16], direction)) {
                    moved++;
                }
            }
            allSquareMoves++;
        } while(hasMoves);
        return moved;
    }
    function moveSquare(square, direction) {
        var squareMoved = false;
        if(squareHasMoves(square, direction)) {
            var currentSquarePosition = coordinatesToPosition(square);
            var nextSquarePosition = coordinatesToPosition({
                x: square.x + direction.x,
                y: square.y + direction.y
            });
            var newSquarePosition = positionToCoordinates(nextSquarePosition);
            if(field[nextSquarePosition] == null) {
                newSquarePosition.value = field[currentSquarePosition].value;
            } else if(field[nextSquarePosition].value == field[currentSquarePosition].value) {
                newSquarePosition.value = field[currentSquarePosition].value + field[currentSquarePosition].value;
                $scope.gameScore += newSquarePosition.value;
                $scope.$digest();
            }
            field[nextSquarePosition] = newSquarePosition;
            field[currentSquarePosition] = null;
            squareMoved = true;
        }
        return squareMoved;
    }
    function squareHasMoves(square, direction) {
        var nextSquarePosition = coordinatesToPosition({
            x: square.x + direction.x,
            y: square.y + direction.y
        });
        if(squareOutOfTheBorder(square, direction)) {
            return false;
        } else if(!_.isNull(field[nextSquarePosition]) &&
            square.value != field[nextSquarePosition].value) {
            return false;
        }
        return true;
    }
    function addRandomSquare() {
        if(!checkFieldIsFull()) {
            var squarePosition;
            do {
                squarePosition = Math.floor(Math.random() * (fieldSize * fieldSize));
            } while (!_.isNull(field[squarePosition]));
            field[squarePosition] = createSquare(squarePosition, 0);
        }
    }
    function createSquare(squarePosition, squareNumber) {
        var coords = positionToCoordinates(squarePosition);
        return {
            value: numbers[squareNumber],
            x: coords.x,
            y: coords.y
        };
    }
    function checkFieldIsFull() {
        for(var i = 0; i < fieldSize * fieldSize; i++) {
            if(field[i] == null) {
                return false;
            }
        }
        return true;
    }
    function allSquaresIsFull() {
        for(var i = 0; i < field.length; i++) {
            if(field[i] == null) {
                return false;
            }
        }
        return true;
    }
    function checkSquares() {
        for(var i = 0; i < fieldSize * fieldSize; i++) {
            for(var direction in directions) {
                if(field[i] && !squareOutOfTheBorder(field[i], directions[direction])) {
                    var checkedSquarePosition = coordinatesToPosition({
                        x: field[i].x + directions[direction].x,
                        y: field[i].y + directions[direction].y
                    });
                    if(field[i].value === field[checkedSquarePosition].value) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function positionToCoordinates(i) {
        var x = i % fieldSize;
        var y = Math.floor(i / fieldSize);
        return {
            x: x,
            y: y
        }
    }
    function coordinatesToPosition(coords) {
        return coords.x + coords.y * 4;
    }
    function squareOutOfTheBorder(square, direction) {
        if(square.x + direction.x < 0
            || square.x + direction.x >= fieldSize
            || square.y + direction.y < 0
            || square.y + direction.y >= fieldSize) {
            return true;
        }
        return false;
    }

}]);