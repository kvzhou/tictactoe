//////////////////////////////////////////////////////////// Factory function for player
const player = (name, symbol, type) => {
    
    function getName() {
        return name;
    }

    function setName(newName) {
        name = newName;
    }
    
    function getSymbol() {
        return symbol;
    }

    function setSymbol(newSymbol) {
        symbol = newSymbol;
    }

    function getType() {
        return type;
    }

    function setType(newType) {
        type = newType;
    }

    // type is an integer in this object. 1 is human. 2 is AI (Easy). 3 is AI (Medium). 4 is AI (Hard). 5 is AI (Unbeatable). Note that the type from the form is a string and needs to be converted into an integer.

    return {getName, setName, getSymbol, setSymbol, getType, setType}
}



//////////////////////////////////////////////////////////// Module pattern for gameboard
const gameboard = (() => {

    // Create array to represent board and initialize values
    let boardArray;
    boardArray = [];
    for (let i = 0; i < 9; i++) {
        boardArray.push(i); // // As part of the implementation of the AI, the cells of boardArray are filled with numbers (instead of empty strings)
    }

    // Add event listener to each cell and decide what happens when the cell is clicked
    const boardCells = document.querySelectorAll('.boardCell');
    boardCells.forEach((boardCell, index) => {
        boardCell.addEventListener('click', () => addSymbolToBoard(boardCell, index));
    });

    const optionsDiv = document.getElementById("optionsDiv");
    const gameDiv = document.getElementById("gameDiv");

    const playBtn = document.getElementById('playBtn');
    playBtn.addEventListener('click', () => {
        processPlayCommand();
    });

    const newGameBtn = document.getElementById('newGameBtn');
    newGameBtn.addEventListener('click', () => {
        processNewGameCommand();
    });

    window.addEventListener('keydown', processKeyboardInputForOptionsDiv); // The program starts in the options screen, so we have to add the keyboard shortcuts for the options screen at this time  



    //////////////////////////////////////////////////////////// Functions for managing gameboard
    function addSymbolToBoard(boardCell, index) {
        if(game.getSomeoneHasWon() === true) return; // Don't do anything if someone has already won
        //console.log(boardCell);
        // Add active player's symbol to cell
        boardCell.textContent = game.getActivePlayer().getSymbol();

        // Update the board array with the active player's symbol
        boardArray[index] = game.getActivePlayer().getSymbol();

        // Prevent the displayed symbol from changing if this cell is clicked on again
        boardCell.style.pointerEvents = 'none';

        game.decreaseRemainingSpotsBy1(); // This variable is used to determine if there is a tie; there's a tie when there are no spots left and no winner
        game.determineIfSomeoneHasWon();

        if(game.getSomeoneHasWon() === false) {
            if(game.getRemainingSpots() > 0) {
                game.tellNextPlayerToPlay();
                game.changeActivePlayer();
            } else { // game.remainingSpots === 0
                game.declareTie();
            }
        }
    }

    function addSymbolToBoardWrapper(index) {
        //console.log(boardCells)
        //console.log(boardCells[index])
        addSymbolToBoard(boardCells[index], index);
    }

    function getBoardArray() {
        return boardArray;
    }

    function resetBoardCells() {
        boardCells.forEach((boardCell, index) => {
            boardCell.textContent = ''; // Remove previous symbol
            boardArray[index] = index; // As part of the implementation of the AI, the cells of boardArray are filled with numbers (instead of empty strings)
            boardCell.style.pointerEvents = 'auto'; // Cells with symbols can't be clicked on again, so this allows that cell to be clicked on again
        });
    }



    //////////////////////////////////////////////////////////// Functions for marking winning axis
    function markWinningAxis(boardArrayIndex1, boardArrayIndex2, boardArrayIndex3) {
        markCellOnWinningAxis(boardArrayIndex1);
        markCellOnWinningAxis(boardArrayIndex2);
        markCellOnWinningAxis(boardArrayIndex3);
    }

    function markCellOnWinningAxis(boardArrayIndex) {
        boardCells[boardArrayIndex].classList.add('onWinningAxis');
    }

    function unmarkWinningAxis(boardArrayIndex1, boardArrayIndex2, boardArrayIndex3) {
        unmarkCellOnWinningAxis(boardArrayIndex1);
        unmarkCellOnWinningAxis(boardArrayIndex2);
        unmarkCellOnWinningAxis(boardArrayIndex3);
    }

    function unmarkCellOnWinningAxis(boardArrayIndex) {
        boardCells[boardArrayIndex].classList.remove('onWinningAxis');
    }



    //////////////////////////////////////////////////////////// Functions for implementing buttons
    function processKeyboardInputForOptionsDiv(e) {
        if(e.ctrlKey && e.key === 'Enter') {
            processPlayCommand();
        }
    }

    function processKeyboardInputForGameDiv(e) {
        if((e.key === 'n') || (e.key === 'N')) {
            processNewGameCommand();
        }
    }

    // After the Play button is pressed, the user input needs to be cleaned up
    function cleanUpUserInput() {
        if(optionsForm.player1Name.value === '') {
            optionsForm.player1Name.value = 'Player 1';
        }
        if(optionsForm.player2Name.value === '') {
            optionsForm.player2Name.value = 'Player 2';
        }
        if(optionsForm.player1Name.value === optionsForm.player2Name.value) {
            // If both players have the same name, append a number
            optionsForm.player1Name.value += ' 1';
            optionsForm.player2Name.value += ' 2';
        }
    }

    function processPlayCommand() {
        event.preventDefault(); // If an action attribute is not mentioned in a form, the form will try to submit itself to the current URL - so this default behavior needs to be blocked
        hideOptionsAndShowGame();

        cleanUpUserInput();

        game.setUpPlayers();
        game.tellFirstPlayerToPlay();
    }

    function processNewGameCommand() {
        resetBoardCells();
        game.setSomeoneHasWonAsFalse();
        game.resetRemainingSpotsTo9();

        // Remove winning axis from last game (if this axis is present)
        const winningAxisFromLastGame = game.getWinningAxis();
        if(winningAxisFromLastGame.winningAxisIndex1 !== '') {
            // If this variable isn't empty, then there's a winning axis from the last game
            unmarkWinningAxis(winningAxisFromLastGame.winningAxisIndex1, winningAxisFromLastGame.winningAxisIndex2, winningAxisFromLastGame.winningAxisIndex3);
            game.resetWinningAxis();
        }

        game.changeActivePlayerToFirstPlayer();

        hideGameAndShowOptions();
    }



    //////////////////////////////////////////////////////////// Functions for switching between screens
    function hideOptionsAndShowGame() {
        window.removeEventListener('keydown', processKeyboardInputForOptionsDiv); // Remove keyboard shortcuts for optionsDiv
        optionsDiv.classList.add('hidden'); // Hide optionsDiv
        gameDiv.classList.remove('hidden'); // Show gameDiv
        window.addEventListener('keydown', processKeyboardInputForGameDiv); // Add keyboard shortcuts for gameDiv
    }

    function hideGameAndShowOptions() {
        window.removeEventListener('keydown', processKeyboardInputForGameDiv); // Remove keyboard shortcuts for gameDiv
        gameDiv.classList.add('hidden'); // Hide gameDiv
        optionsDiv.classList.remove('hidden'); // Show optionsDiv
        window.addEventListener('keydown', processKeyboardInputForOptionsDiv); // Add keyboard shortcuts for optionsDiv
    }



    return {getBoardArray, addSymbolToBoardWrapper, markWinningAxis, processPlayCommand, processNewGameCommand};
})();



//////////////////////////////////////////////////////////// Module pattern for game
const game = (() => {
    const player1 = player('', '', '');
    const player2 = player('', '', '');

    let activePlayer = player1;
    let someoneHasWon = false; // Game stops once someone has won
    let remainingSpots = 9; // This variable is used to determine if there is a tie; there's a tie when there are no spots left and no winner

    const dispDiv = document.getElementById('dispDiv');

    // These are the winning combinations
    const winningAxes = [
        // Winning rows
        [0,1,2],
        [3,4,5],
        [6,7,8],

        // Winning columns
        [0,3,6],
        [1,4,7],
        [2,5,8],

        // Winning diagonals
        [0,4,8],
        [2,4,6],
    ];

    let winningAxisIndex1 = '';
    let winningAxisIndex2 = '';
    let winningAxisIndex3 = '';

    // Variables used by AI
    let currAiPlayerSymbol;
    let otherPlayerSymbol;

    //////////////////////////////////////////////////////////// Functions for managing variables
    function setUpPlayers() {
        player1.setName(optionsForm.player1Name.value);
        player1.setSymbol(optionsForm.symbolChoice.value[0]);
        player1.setType(+optionsForm.player1Type.value); // The type from the form is a string and needs to be converted into an integer

        player2.setName(optionsForm.player2Name.value);
        player2.setSymbol(optionsForm.symbolChoice.value[1]);
        player2.setType(+optionsForm.player2Type.value); // The type from the form is a string and needs to be converted into an integer
    }

    function getActivePlayer() {
        return activePlayer;
    }
    
    function getSomeoneHasWon() {
        return someoneHasWon;
    }
    function setSomeoneHasWonAsFalse() {
        someoneHasWon = false;
    }

    function getRemainingSpots() {
        return remainingSpots;
    }
    function decreaseRemainingSpotsBy1() {
        remainingSpots--;
    }

    function resetRemainingSpotsTo9() {
        remainingSpots = 9;
    }



    //////////////////////////////////////////////////////////// Functions for managing turns
    function tellFirstPlayerToPlay() {
        dispDiv.textContent = player1.getName() + "'s turn. Click a square.";
    }

    function tellNextPlayerToPlay() {
        if(activePlayer === player1) {
            // If the active player is player1 and the next player is player2

            if(player2.getType() === 1) { // If the next player is a human player
                dispDiv.textContent = player2.getName() + "'s turn. Click a square.";
            } else { // Else the next player is an AI player
                dispDiv.textContent = player2.getName() + "'s turn. AI is thinking...";
            }
        } else {
            // Else the active player is player2 and the next player is player1

            if(player1.getType() === 1) { // If the next player is a human player
                dispDiv.textContent = player1.getName() + "'s turn. Click a square.";
            } else { // Else the next player is an AI player
                dispDiv.textContent = player1.getName() + "'s turn. AI is thinking...";
            }
        }
    }

    function changeActivePlayerToFirstPlayer() {
        activePlayer = player1;
        if(player1.getType() !== 1) { // If the first player is not a human player (and therefore an AI player)
            delayAndThenMakeAiMove(player1);
        }
    }

    function changeActivePlayer() {
        if(activePlayer === player1) {
            // If the active player is player1 and the next player is player2
            activePlayer = player2;

            if(player2.getType() !== 1) { // If the next player is not a human player (and therefore an AI player)
                delayAndThenMakeAiMove(player2);
            }
        } else {
            // Else the active player is player2 and the next player is player1
            activePlayer = player1;

            if(player1.getType() !== 1) { // If the next player is not a human player (and therefore an AI player)
                delayAndThenMakeAiMove(player1);
            }
        }
    }



    //////////////////////////////////////////////////////////// Functions for game outcome
    function determineIfSomeoneHasWon() {
        if(remainingSpots > 4) return; // The game can't be won unless at least 5 spots are filled (3 by the winner, 2 by the loser). If there are more than 4 remaining spots (thus less than 5 filled spots), don't do anything

        winningAxes.forEach((item, index) => {
            if((gameboard.getBoardArray()[item[0]] === activePlayer.getSymbol()) && (gameboard.getBoardArray()[item[1]] === activePlayer.getSymbol()) && (gameboard.getBoardArray()[item[2]] === activePlayer.getSymbol())) {
                // If someone has a winning combo
                dispDiv.textContent = activePlayer.getName() + ' wins!';
                someoneHasWon = true;

                // Make the winning axis more prominent
                winningAxisIndex1 = item[0];
                winningAxisIndex2 = item[1];
                winningAxisIndex3 = item[2];
                gameboard.markWinningAxis(winningAxisIndex1, winningAxisIndex2, winningAxisIndex3);
            }
        });
    }

    function declareTie() {
        dispDiv.textContent = "It's a tie!";
    }



    //////////////////////////////////////////////////////////// Functions for marking winning axis
    function getWinningAxis() {
        return {winningAxisIndex1, winningAxisIndex2, winningAxisIndex3};
    }

    function resetWinningAxis() {
        winningAxisIndex1 = '';
        winningAxisIndex2 = '';
        winningAxisIndex3 = '';
    }



    //////////////////////////////////////////////////////////// Functions for AI
    function delayAndThenMakeAiMove(aiPlayer) {
        const randDuration = ((Math.random() * 1000) + 200).toFixed(); // Create random integer between 200 and 1200. (Pick random number between 0 and 1. Multiply it by 1000. The result will be added to 200, meaning that the number will between 200 and 1200. Use toFixed() to convert this number into an integer.) This integer is how long the program will wait before executing the function. This wait simulates the AI "thinking".
        //console.log(randDuration);
        setTimeout(() => makeAiMove(aiPlayer), randDuration);
    }

    function makeAiMove(aiPlayer) {
        // AI (Easy). type = 2. 0% of moves will use the minimax algorithm. 100% of moves will be random moves.
        // AI (Medium). type = 3. 75% of moves will use the minimax algorithm. 25% of moves will be random moves.
        // AI (Hard). type = 4. 90% of moves will use the minimax algorithm. 10% of moves will be random moves.
        // AI (Unbeatable). type = 5. 100% of moves will use the minimax algorithm. 0% of moves will be random moves.

        //console.log('aimove start')
        //console.log(aiPlayer)
        if(aiPlayer.getType() === 2) {
            // If "AI (Easy)" was selected

            // If "AI (Easy) was selected, then 100% of all moves will be random moves
            //console.log(aiPlayer.getSymbol())
            //console.log(gameboard.getBoardArray())
            pickRandomSpot(gameboard.getBoardArray(), aiPlayer.getSymbol());
        } else {
            const randNum = Math.random(); // Pick random number between 0 and 1
            //console.log(randNum)
            if(aiPlayer.getType() === 3)
                // If "AI (Medium)" was selected
                if(randNum <= 0.75) {
                    setupAiVars(aiPlayer);
                    runMinimaxOnMove(gameboard.getBoardArray(), aiPlayer.getSymbol());
                } else {
                    pickRandomSpot(gameboard.getBoardArray(), aiPlayer.getSymbol());
                }
        }
        //
        //runMinimaxOnMove(gameboard.getBoardArray(), )
    }

    function pickRandomSpot(aBoardArray, currPlayerSymbol) {
        let availableSpots = findEmptySpots(aBoardArray);
        //console.log(availableSpots)
        let aiChoice = availableSpots[Math.floor(Math.random() * availableSpots.length)]; // Pick random number between 0 and 1. Multiply this random number by the number of available spots; this causes the resulting number to between 0 and the length of availableSpots. Find the floor of the resulting number (since an integer is needed for an array index). The number resulting from the floor operation is used to look up an available spot, which is where the computer will place its symbol.
        //console.log(aiChoice)
        gameboard.addSymbolToBoardWrapper(aiChoice);
    }

    function setupAiVars(aiPlayer) {
        if(aiPlayer === player1) {
            // If the current AI player is player1 and the other player is player2
            currAiPlayerSymbol = player1.getSymbol();
            otherPlayerSymbol = player2.getSymbol();
        } else {
            // Else the current AI player is player2 and the other player is player1
            currAiPlayerSymbol = player2.getSymbol();
            otherPlayerSymbol = player1.getSymbol();
        }
    }

    function runMinimaxOnMove(aBoardArray, currPlayerSymbol) {  
        let availableSpots = findEmptySpots(aBoardArray);
        console.log('mminimax funct start')
        // Conditions that end the recursion
        if(predictIfPlayerWins(aBoardArray, currAiPlayerSymbol)) {
            // If current AI player will win
            console.log('ai player will win');
            return {score: 10};
        } else if(predictIfPlayerWins(aBoardArray, otherPlayerSymbol)) {
            // If other player will win
            console.log('other player will win');
            return {score: -10};
        } else if(aBoardArray.length === 0) {
            // If there are no more empty spots. Since no one has won and there are no empty spots, then it will be a tie.
            conaole.log('tie predicted')
            return {score: 0};
        }

        let possibleMoves = []; // Array for storing possible moves (which are objects)

        // Loop through empty spots and create array of possible moves
        for(let i = 0; i < availableSpots.length; i++) {
            console.log('begin loop')
            let possibleMove = {}; // Object for storing a possible move
            console.log('availableSpots :' + availableSpots)
            console.log('aBoardArray :' + aBoardArray)
            possibleMove.index = availableSpots[i]; // Use i to retrieve index of available spot and add that index to the possibleMove object
            //possibleMove.index = aBoardArray[availableSpots[i]]; // Use i to retrieve index of available spot.........................................................
            //console.log('availableSpots[i] is:' + availableSpots[i]);
            aBoardArray[availableSpots[i]] = currPlayerSymbol; // Set the empty spot to the current player's symbol

            // Calculate the score from calling minimax on the move after this move, which will be played by the opponent of the current player
            //let possibleMoveAfterThisMove;
            //if(currPlayerSymbol === currAiPlayerSymbol) {
            //    possibleMoveAfterThisMove = runMinimaxOnMove(aBoardArray, otherPlayerSymbol);
            //} else { // currPlayerSymbol === otherPlayerSymbol
            //    possibleMoveAfterThisMove = runMinimaxOnMove(aBoardArray, currAiPlayerSymbol);
            //}
            //possibleMove.score = possibleMoveAfterThisMove.score;

            // Calculate the score from calling minimax on the move after this move, which will be played by the opponent of the current player
            if(currPlayerSymbol === currAiPlayerSymbol) {
                console.log('currPlayerSymbol === currAiPlayerSymbol')
                let possibleMoveAfterThisMove = runMinimaxOnMove(aBoardArray, otherPlayerSymbol);
                possibleMove.score = possibleMoveAfterThisMove.score;
            } else { // currPlayerSymbol === otherPlayerSymbol
                console.log('currPlayerSymbol === otherPlayerSymbol')
                let possibleMoveAfterThisMove = runMinimaxOnMove(aBoardArray, currAiPlayerSymbol);
                possibleMove.score = possibleMoveAfterThisMove.score;
            }

            aBoardArray[availableSpots[i]] = possibleMove.index; // Reset the spot to empty in preparation for the next loop iteration. Empty spots have the index instead of a player symbol.
            
            possibleMoves.push(possibleMove); // Store the possible move in the array
        }

        // Find best move and return it
        let arrayIndexOfBestMove;
        if(currPlayerSymbol === currAiPlayerSymbol) {
            // If the current player is the AI player, try to maximize the score
            let bestScore = -10000; // Starting point for maximization
            for(let i = 0; i < possibleMoves.length; i++) {
                if(possibleMoves[i].score > bestScore) {
                    bestScore = possibleMoves[i].score;
                    arrayIndexOfBestMove = i;
                }
            }
        } else {
            // Else the current player is the other player, so try to minimize the score
            for(let i = 0; i < possibleMoves.length; i++) {
                let bestScore = 10000; // Starting point for minimization
                if(possibleMoves[i].score < bestScore) {
                    bestScore = possibleMoves[i].score;
                    arrayIndexOfBestMove = i;
                }
            }
        }
        return possibleMoves[arrayIndexOfBestMove];
    }

    function findEmptySpots(aBoardArray) {
        return aBoardArray.filter(arrayItem => ((arrayItem !== 'O') && (arrayItem !== 'X')));
        // Returns an array that contains the empty spots
    }

    function predictIfPlayerWins(aBoardArray, playerSymbol) {
        if(((aBoardArray[0] === playerSymbol) && (aBoardArray[1] === playerSymbol) && (aBoardArray[2] === playerSymbol)) ||
            ((aBoardArray[3] === playerSymbol) && (aBoardArray[4] === playerSymbol) && (aBoardArray[5] === playerSymbol)) ||
            ((aBoardArray[6] === playerSymbol) && (aBoardArray[7] === playerSymbol) && (aBoardArray[8] === playerSymbol)) ||

            ((aBoardArray[0] === playerSymbol) && (aBoardArray[3] === playerSymbol) && (aBoardArray[6] === playerSymbol)) ||
            ((aBoardArray[1] === playerSymbol) && (aBoardArray[4] === playerSymbol) && (aBoardArray[7] === playerSymbol)) ||
            ((aBoardArray[2] === playerSymbol) && (aBoardArray[5] === playerSymbol) && (aBoardArray[8] === playerSymbol)) ||

            ((aBoardArray[0] === playerSymbol) && (aBoardArray[4] === playerSymbol) && (aBoardArray[8] === playerSymbol)) ||
            ((aBoardArray[2] === playerSymbol) && (aBoardArray[4] === playerSymbol) && (aBoardArray[6] === playerSymbol))) {
                return true;
            } else {
                return false;
            }
    }



    return {setUpPlayers, getActivePlayer, getSomeoneHasWon, setSomeoneHasWonAsFalse, getRemainingSpots, decreaseRemainingSpotsBy1, resetRemainingSpotsTo9, determineIfSomeoneHasWon, tellFirstPlayerToPlay, tellNextPlayerToPlay, changeActivePlayerToFirstPlayer, changeActivePlayer, declareTie, getWinningAxis, resetWinningAxis};
})();