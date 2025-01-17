
// Extend the element method
(function(){
    'use strict';

    // Extend the element method
    Element.prototype.wordSeach = function(settings) {
        return new WordSeach(this, settings);
    }

    /**
     * Word search
     *
     * @param {Element} wrapWl the games wrap element
     * @param {Array} settings
     * constructor
     */
    function WordSeach(wrapEl, settings) {

        this.wrapEl = wrapEl;

        // Add `.ws-area` to wrap element
        this.wrapEl.classList.add('ws-area');


        var mid = gup('mid');

        // Default settings
        var default_settings = {
            'directions': ['W', 'N', 'WN', 'EN'],
            'gridSize': 33,
            'words': [
                'Montgomery',
                'Juneau',
                'Phoenix',
                'LittleRock',
                'Sacramento',
                'Denver',
                'Hartford',
                'Tallahassee',
                'Atlanta',
                'Honolulu',
                'Boise',
                'Springfield',
                'Indianapolis',
                'Des Moines',
                'Topeka',
                'Frankfort',
                'Baton Rouge',
                'Augusta',
                'Annapolis',
                'Boston',
                'Lansing',
                'SaintPaul',
                'Jackson',
                'Jefferson City',
                'Helena',
                'Lincoln',
                'Carson City',
                'Concord',
                'Trenton',
                'Santa Fe',
                'Albany',
                'Raleigh',
                'Bismarck',
                'Columbus',
                'Oklahoma City',
                'Salem',
                'Harrisburg',
                'Providence',
                'Columbia',
                'Pierre',
                'Nashville',
                'Austin',
                'Salt Lake City',
                'Montpelier',
                'Richmond',
                'Olympia',
                'Charleston',
                'Madison',
                'Cheyenne'
            ],
            'debug': false,
            'condition' : 0,
            'same' : true,
            'test' : false
        }

        this.settings = Object.merge(settings, default_settings);
        
        //this.settings.condition = 5;   //need to remove this


        // Check the words length if it is overflow the grid
        if (this.parseWords(this.settings.gridSize)) {
            // Add words into the matrix data
            var isWorked = false;

            if (this.settings.test) {
                this.words = ['browser'];
            }

            
            while (isWorked == false) {
                // initialize the application
                this.initialize();
                if (this.settings.test) {
                    isWorked = this.testmatrix(this.settings.gridSize);
                } else {
                    if (!this.settings.same) {

                        isWorked = this.addWords();
                    } else {
                        isWorked = this.bobmatrix(this.settings.gridSize);
                    }
                }
            }

            // Fill up the remaining blank items
            if (!this.settings.debug) {
                if (!this.settings.test) {
                    this.fillUpFools();
                }
                //disable this to check earlystop
            }

            // Draw the matrix into wrap element
            this.drawmatrix();

            //added by bob to show score - require score function in the bob script
            var currentscore = score();
            document.getElementById("score").innerHTML = "Found " + currentscore + " out of " + this.settings.words.length + " words so far.";
        }
    }


    /**
     * Parse words
     * @param {Number} Max size
     * @return {Boolean}
     */
    WordSeach.prototype.parseWords = function(maxSize) {
        var itWorked = true;

        for (var i = 0; i < this.settings.words.length; i++) {
            // Convert all the letters to upper case
            this.settings.words[i] = this.settings.words[i].toUpperCase();

            var word = this.settings.words[i];
            if (word.length > maxSize) {
                alert('The length of word `' + word + '` is overflow the gridSize.');
                console.error('The length of word `' + word + '` is overflow the gridSize.');
                itWorked = false;
            }
        }

        return itWorked;
    }

    /**
     * Put the words into the matrix
     */
    WordSeach.prototype.addWords = function() {
        //modified this function to make impossible puzzles when condition = 1




        var condition = this.settings.condition;
        var endoflist = this.settings.words.length;	//default to add all words
        if (condition == 1) {
            endoflist = 3;					//if condition = 1 then only add first two words
        }

        if (this.settings.test) {
            endoflist = 1;
        }

        var keepGoing = true,
            counter = 0,
            isWorked = true;

        while (keepGoing) {
            // Getting random direction
            var dir = this.settings.directions[Math.rangeInt(this.settings.directions.length - 1)],
                result = this.addWord(this.settings.words[counter], dir),
                isWorked = true;

            if (result == false) {
                keepGoing = false;
                isWorked = false;
            }

            counter++;
//        if (counter >= this.settings.words.length) {
// 			modified this line from original to creat earlystop when condition = 1
            if (counter >= endoflist) {
                keepGoing = false;
            }


        }

        return isWorked;
    }



    /**
     * Add word into the matrix
     *
     * @param {String} word
     * @param {Number} direction
     */
    WordSeach.prototype.addWord = function(word, direction) {
        var itWorked = true,
            directions = {
                'W': [0, 1], // Horizontal (From left to right)
                'N': [1, 0], // Vertical (From top to bottom)
                'WN': [1, 1], // From top left to bottom right
                'EN': [1, -1] // From top right to bottom left
            },
            row, col; // y, x

        switch (direction) {
            case 'W': // Horizontal (From left to right)
                var row = Math.rangeInt(this.settings.gridSize  - 1),
                    col = Math.rangeInt(this.settings.gridSize - word.length);
                break;

            case 'N': // Vertical (From top to bottom)
                var row = Math.rangeInt(this.settings.gridSize - word.length),
                    col = Math.rangeInt(this.settings.gridSize  - 1);
                break;

            case 'WN': // From top left to bottom right
                var row = Math.rangeInt(this.settings.gridSize - word.length),
                    col = Math.rangeInt(this.settings.gridSize - word.length);
                break;

            case 'EN': // From top right to bottom left
                var row = Math.rangeInt(this.settings.gridSize - word.length),
                    col = Math.rangeInt(word.length - 1, this.settings.gridSize - 1);
                break;

            default:
                var error = 'UNKNOWN DIRECTION ' + direction + '!';
                alert(error);
                console.log(error);
                break;
        }

        // Add words to the matrix
        for (var i = 0; i < word.length; i++) {
            var newRow = row + i * directions[direction][0],
                newCol = col + i * directions[direction][1];

            // The letter on the board
            var origin = this.matrix[newRow][newCol].letter;

            if (origin == '.' || origin == word[i]) {
                this.matrix[newRow][newCol].letter = word[i];
            } else {
                itWorked = false;
            }
        }

        return itWorked;
    }

    /**
     * Initialize the application
     */
    WordSeach.prototype.initialize = function() {
        /**
         * Letter matrix
         *
         * param {Array}
         */
        this.matrix = [];

        /**
         * Selection from
         * @Param {Object}
         */
        this.selectFrom = null;

        /**
         * Selected items
         */
        this.selected = [];
        this.initmatrix(this.settings.gridSize);

    }

    /**
     * Fill default items into the matrix
     * @param {Number} size Grid size
     */
    WordSeach.prototype.initmatrix = function(size) {
        var rsize = size;
        var csize = size
        if (this.settings.condition > 2) {
            rsize = 33;
            csize = 33;
        }
        for (var row = 0; row < rsize; row++) {
            for (var col = 0; col < csize; col++) {
                var item = {
                    letter: '.', // Default value
                    row: row,
                    col: col
                }

                if (!this.matrix[row]) {
                    this.matrix[row] = [];
                }

                this.matrix[row][col] = item;
            }
        }
    }

    WordSeach.prototype.testmatrix = function(size) {
        var test_matrix = [
            ['.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.'],
            ['.','B','R','O','W','S','E','R','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.'],
            ['.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.']
        ];
        for (var row = 0; row<3; row++) {
            for (var col = 0; col < 33; col++) {
                var item = {
                    letter: test_matrix [row][col], // Default value
                    row: row,
                    col: col
                }

                this.matrix[row][col] = item;
            }
        }
        return 1;
    }

    WordSeach.prototype.bobmatrix = function(size) {

        //for (var row = 0; row < size; row++) {
        //   if (!this.matrix[row]) {
        //      this.matrix[row] = [];
        //    }
        //}
        //puzzle 85 from jumbo word puzzle book volume 46, landolls, 1995, ashland, oh
        var control_matrix = [
            [	'B',    'Y',    'R',    'E',    'M',    'O',    'G',    'T',    'N',    'O',    'M',    'N',    'W',    'D',    'S',    'Z',    'N',    'Y',    'T',    'I',    'C',    'A', 	'M',    'O',    'H',    'A',    'L',    'K',    'O',    'Z',    'O',    'M',    'G'	],
            [	'G', 	'I', 	'G', 	'R', 	'U', 	'B', 	'S', 	'I', 	'R', 	'R', 	'A', 	'H', 	'K', 	'N', 	'Z', 	'W', 	'U', 	'U', 	'D', 	'G', 	'Z', 	'O', 	'K', 	'T', 	'X', 	'G', 	'J', 	'A', 	'C', 	'K', 	'S', 	'O', 	'N'	],
            [	'A', 	'C', 	'T', 	'F', 	'V', 	'V', 	'S', 	'R', 	'G', 	'U', 	'S', 	'L', 	'U', 	'U', 	'F', 	'M', 	'W', 	'N', 	'L', 	'T', 	'N', 	'X', 	'N', 	'P', 	'B', 	'C', 	'U', 	'D', 	'O', 	'M', 	'Z', 	'Y', 	'X'	],
            [	'G', 	'W', 	'H', 	'M', 	'T', 	'S', 	'G', 	'D', 	'S', 	'N', 	'F', 	'O', 	'J', 	'O', 	'M', 	'R', 	'E', 	'E', 	'H', 	'U', 	'K', 	'I', 	'J', 	'P', 	'G', 	'L', 	'Y', 	'S', 	'V', 	'V', 	'Q', 	'Q', 	'I'	],
            [	'S', 	'V', 	'J', 	'C', 	'X', 	'D', 	'E', 	'A', 	'L', 	'B', 	'A', 	'N', 	'Y', 	'I', 	'A', 	'K', 	'C', 	'R', 	'B', 	'L', 	'L', 	'C', 	'S', 	'Q', 	'A', 	'H', 	'P', 	'X', 	'Z', 	'Q', 	'Q', 	'A', 	'S'	],
            [	'J', 	'O', 	'L', 	'Y', 	'M', 	'P', 	'I', 	'A', 	'J', 	'U', 	'A', 	'E', 	'N', 	'U', 	'J', 	'N', 	'M', 	'F', 	'K', 	'C', 	'Q', 	'O', 	'H', 	'N', 	'B', 	'N', 	'P', 	'J', 	'D', 	'L', 	'N', 	'H', 	'Q'	],
            [	'E', 	'Q', 	'V', 	'H', 	'T', 	'Q', 	'I', 	'I', 	'V', 	'X', 	'D', 	'D', 	'V', 	'L', 	'E', 	'S', 	'D', 	'E', 	'E', 	'T', 	'R', 	'N', 	'N', 	'A', 	'A', 	'G', 	'K', 	'F', 	'D', 	'O', 	'B', 	'U', 	'A'	],
            [	'F', 	'N', 	'L', 	'B', 	'P', 	'J', 	'A', 	'C', 	'N', 	'Q', 	'K', 	'J', 	'Q', 	'D', 	'F', 	'W', 	'A', 	'U', 	'G', 	'U', 	'S', 	'T', 	'A', 	'O', 	'R', 	'L', 	'S', 	'N', 	'T', 	'A', 	'K', 	'R', 	'X'	],
            [	'F', 	'Z', 	'X', 	'A', 	'Z', 	'C', 	'K', 	'O', 	'Y', 	'D', 	'P', 	'Z', 	'I', 	'S', 	'N', 	'Q', 	'P', 	'L', 	'K', 	'Z', 	'F', 	'O', 	'S', 	'G', 	'H', 	'L', 	'O', 	'N', 	'S', 	'N', 	'C', 	'S', 	'F'	],
            [	'E', 	'U', 	'F', 	'T', 	'H', 	'X', 	'E', 	'L', 	'O', 	'H', 	'I', 	'V', 	'H', 	'V', 	'S', 	'S', 	'A', 	'T', 	'I', 	'Q', 	'W', 	'E', 	'F', 	'B', 	'W', 	'M', 	'E', 	'A', 	'B', 	'Z', 	'C', 	'Y', 	'G'	],
            [	'R', 	'D', 	'A', 	'O', 	'F', 	'G', 	'P', 	'U', 	'M', 	'V', 	'O', 	'A', 	'A', 	'L', 	'O', 	'T', 	'A', 	'Z', 	'W', 	'T', 	'G', 	'T', 	'C', 	'B', 	'H', 	'R', 	'N', 	'S', 	'U', 	'A', 	'T', 	'Y', 	'H'	],
            [	'S', 	'L', 	'N', 	'N', 	'X', 	'C', 	'O', 	'M', 	'B', 	'R', 	'C', 	'X', 	'N', 	'P', 	'N', 	'L', 	'R', 	'X', 	'T', 	'I', 	'T', 	'Z', 	'U', 	'C', 	'T', 	'T', 	'Y', 	'C', 	'T', 	'I', 	'Q', 	'A', 	'T'	],
            [	'O', 	'E', 	'B', 	'R', 	'W', 	'X', 	'T', 	'B', 	'P', 	'K', 	'K', 	'V', 	'M', 	'A', 	'L', 	'K', 	'P', 	'O', 	'R', 	'V', 	'H', 	'L', 	'I', 	'A', 	'A', 	'Y', 	'A', 	'H', 	'C', 	'O', 	'R', 	'W', 	'L'	],
            [	'N', 	'K', 	'H', 	'O', 	'K', 	'T', 	'X', 	'I', 	'S', 	'K', 	'T', 	'F', 	'L', 	'A', 	'P', 	'I', 	'H', 	'I', 	'F', 	'K', 	'S', 	'R', 	'E', 	'F', 	'S', 	'A', 	'L', 	'E', 	'M', 	'T', 	'N', 	'C', 	'I'	],
            [	'C', 	'Z', 	'E', 	'U', 	'P', 	'U', 	'I', 	'A', 	'N', 	'B', 	'J', 	'T', 	'H', 	'Y', 	'I', 	'O', 	'M', 	'E', 	'E', 	'K', 	'A', 	'D', 	'E', 	'R', 	'W', 	'O', 	'K', 	'K', 	'F', 	'I', 	'U', 	'G', 	'C'	],
            [	'I', 	'A', 	'L', 	'G', 	'L', 	'C', 	'N', 	'K', 	'U', 	'T', 	'A', 	'A', 	'V', 	'O', 	'T', 	'C', 	'L', 	'L', 	'C', 	'R', 	'N', 	'Q', 	'K', 	'Z', 	'O', 	'A', 	'Z', 	'O', 	'D', 	'I', 	'V', 	'A', 	'F'	],
            [	'T', 	'X', 	'E', 	'E', 	'A', 	'Y', 	'E', 	'S', 	'P', 	'K', 	'S', 	'S', 	'C', 	'U', 	'G', 	'L', 	'U', 	'I', 	'W', 	'C', 	'R', 	'A', 	'O', 	'D', 	'L', 	'C', 	'R', 	'R', 	'G', 	'F', 	'R', 	'R', 	'R'	],
            [	'Y', 	'S', 	'N', 	'P', 	'F', 	'D', 	'O', 	'P', 	'Q', 	'S', 	'A', 	'U', 	'I', 	'Q', 	'I', 	'A', 	'L', 	'P', 	'S', 	'M', 	'E', 	'E', 	'R', 	'T', 	'Z', 	'D', 	'K', 	'N', 	'D', 	'W', 	'P', 	'G', 	'G'	],
            [	'C', 	'Z', 	'A', 	'W', 	'E', 	'U', 	'H', 	'M', 	'E', 	'C', 	'Q', 	'P', 	'F', 	'V', 	'P', 	'E', 	'C', 	'E', 	'L', 	'L', 	'D', 	'Q', 	'L', 	'F', 	'P', 	'R', 	'V', 	'S', 	'C', 	'Q', 	'T', 	'P', 	'P'	],
            [	'U', 	'N', 	'X', 	'N', 	'M', 	'Z', 	'P', 	'E', 	'R', 	'S', 	'K', 	'B', 	'H', 	'T', 	'I', 	'S', 	'L', 	'P', 	'Z', 	'I', 	'U', 	'A', 	'I', 	'H', 	'S', 	'T', 	'D', 	'R', 	'O', 	'C', 	'N', 	'O', 	'C'	],
            [	'X', 	'Q', 	'Z', 	'K', 	'O', 	'Y', 	'X', 	'A', 	'O', 	'V', 	'P', 	'S', 	'N', 	'P', 	'J', 	'I', 	'G', 	'C', 	'O', 	'I', 	'S', 	'W', 	'A', 	'D', 	'P', 	'J', 	'P', 	'I', 	'M', 	'N', 	'A', 	'J', 	'J'	],
            [	'S', 	'K', 	'U', 	'W', 	'L', 	'E', 	'M', 	'A', 	'K', 	'Y', 	'A', 	'I', 	'X', 	'M', 	'R', 	'O', 	'Q', 	'R', 	'I', 	'A', 	'M', 	'E', 	'L', 	'V', 	'R', 	'R', 	'P', 	'J', 	'A', 	'D', 	'C', 	'N', 	'M'	],
            [	'B', 	'S', 	'J', 	'S', 	'Y', 	'E', 	'Y', 	'U', 	'X', 	'N', 	'A', 	'U', 	'O', 	'Q', 	'H', 	'B', 	'W', 	'G', 	'R', 	'Y', 	'Z', 	'W', 	'G', 	'O', 	'I', 	'Z', 	'G', 	'H', 	'D', 	'H', 	'G', 	'E', 	'M'	],
            [	'I', 	'N', 	'S', 	'E', 	'N', 	'S', 	'B', 	'S', 	'X', 	'S', 	'A', 	'K', 	'D', 	'E', 	'S', 	'M', 	'O', 	'I', 	'N', 	'E', 	'S', 	'G', 	'C', 	'R', 	'N', 	'L', 	'Z', 	'L', 	'I', 	'U', 	'M', 	'N', 	'J'	],
            [	'S', 	'H', 	'S', 	'T', 	'J', 	'I', 	'L', 	'T', 	'P', 	'D', 	'B', 	'Y', 	'Y', 	'D', 	'E', 	'N', 	'V', 	'E', 	'R', 	'K', 	'G', 	'B', 	'H', 	'Q', 	'G', 	'V', 	'O', 	'B', 	'S', 	'L', 	'O', 	'O', 	'R'	],
            [	'M', 	'Z', 	'O', 	'D', 	'O', 	'L', 	'X', 	'I', 	'D', 	'A', 	'T', 	'L', 	'V', 	'U', 	'K', 	'I', 	'T', 	'R', 	'E', 	'V', 	'O', 	'D', 	'E', 	'S', 	'F', 	'S', 	'F', 	'B', 	'O', 	'O', 	'N', 	'Q', 	'W'	],
            [	'A', 	'S', 	'Y', 	'A', 	'I', 	'O', 	'T', 	'N', 	'S', 	'F', 	'B', 	'D', 	'Y', 	'T', 	'I', 	'C', 	'N', 	'O', 	'S', 	'R', 	'A', 	'C', 	'Y', 	'V', 	'I', 	'Z', 	'A', 	'F', 	'N', 	'L', 	'T', 	'G', 	'V'	],
            [	'R', 	'E', 	'E', 	'S', 	'R', 	'P', 	'G', 	'S', 	'K', 	'N', 	'P', 	'N', 	'O', 	'T', 	'S', 	'O', 	'B', 	'H', 	'V', 	'Z', 	'U', 	'Q', 	'E', 	'A', 	'E', 	'P', 	'N', 	'E', 	'K', 	'X', 	'P', 	'W', 	'Q'	],
            [	'C', 	'L', 	'X', 	'P', 	'O', 	'A', 	'E', 	'C', 	'H', 	'S', 	'U', 	'B', 	'M', 	'U', 	'L', 	'O', 	'C', 	'K', 	'D', 	'W', 	'S', 	'D', 	'N', 	'S', 	'L', 	'U', 	'I', 	'Y', 	'B', 	'Y', 	'E', 	'A', 	'O'	],
            [	'K', 	'Q', 	'W', 	'J', 	'B', 	'N', 	'Z', 	'H', 	'R', 	'O', 	'G', 	'I', 	'M', 	'E', 	'I', 	'T', 	'U', 	'Z', 	'W', 	'J', 	'I', 	'L', 	'N', 	'Q', 	'D', 	'Z', 	'A', 	'D', 	'B', 	'S', 	'L', 	'T', 	'H'	],
            [	'Y', 	'E', 	'E', 	'C', 	'I', 	'N', 	'N', 	'L', 	'O', 	'C', 	'N', 	'I', 	'L', 	'P', 	'R', 	'B', 	'T', 	'J', 	'Q', 	'P', 	'U', 	'X', 	'E', 	'I', 	'Y', 	'A', 	'Z', 	'F', 	'J', 	'E', 	'I', 	'J', 	'Z'	],
            [	'Y', 	'M', 	'W', 	'Y', 	'G', 	'A', 	'L', 	'R', 	'D', 	'H', 	'O', 	'H', 	'G', 	'I', 	'E', 	'L', 	'A', 	'R', 	'W', 	'H', 	'N', 	'U', 	'Q', 	'Z', 	'C', 	'A', 	'A', 	'G', 	'F', 	'A', 	'E', 	'F', 	'F'	],
            [	'T', 	'X', 	'W', 	'O', 	'N', 	'M', 	'A', 	'G', 	'N', 	'O', 	'D', 	'I', 	'Z', 	'C', 	'Q', 	'G', 	'Z', 	'R', 	'N', 	'Z', 	'L', 	'C', 	'M', 	'S', 	'F', 	'H', 	'Y', 	'F', 	'F', 	'S', 	'R', 	'B', 	'T'	]
        ];

        var impossible_matrix = [
            [	'B',    'Y',    'R',    'E',    'M',    'O',    'G',    'T',    'N',    'O',    'M',    'N',    'W',    'D',    'S',    'Z',    'N',    'Y',    'T',    'I',    'C',    'A', 	'M',    'O',    'H',    'A',    'L',    'K',    'O',    'Z',    'O',    'M',    'G'	],
            [	'G', 	'I', 	'G', 	'R', 	'U', 	'B', 	'S', 	'I', 	'R', 	'R', 	'A', 	'H', 	'K', 	'N', 	'Z', 	'W', 	'U', 	'U', 	'D', 	'G', 	'Z', 	'O', 	'K', 	'T', 	'X', 	'G', 	'J', 	'A', 	'C', 	'K', 	'S', 	'O', 	'N'	],
            [	'A', 	'C', 	'T', 	'F', 	'V', 	'V', 	'S', 	'R', 	'G', 	'U', 	'S', 	'L', 	'U', 	'U', 	'F', 	'M', 	'W', 	'N', 	'L', 	'T', 	'N', 	'X', 	'N', 	'P', 	'B', 	'C', 	'U', 	'D', 	'O', 	'M', 	'Z', 	'Y', 	'X'	],
            [	'G', 	'W', 	'H', 	'M', 	'T', 	'S', 	'G', 	'D', 	'S', 	'N', 	'F', 	'O', 	'J', 	'O', 	'M', 	'R', 	'E', 	'E', 	'H', 	'U', 	'K', 	'I', 	'J', 	'P', 	'G', 	'L', 	'Y', 	'S', 	'V', 	'V', 	'Q', 	'Q', 	'I'	],
            [	'S', 	'V', 	'J', 	'C', 	'X', 	'D', 	'E', 	'A', 	'L', 	'B', 	'A', 	'N', 	'Y', 	'I', 	'A', 	'K', 	'C', 	'R', 	'B', 	'L', 	'L', 	'C', 	'S', 	'Q', 	'A', 	'H', 	'P', 	'X', 	'Z', 	'Q', 	'Q', 	'A', 	'S'	],
            [	'J', 	'O', 	'L', 	'Y', 	'M', 	'P', 	'I', 	'A', 	'J', 	'U', 	'A', 	'E', 	'N', 	'U', 	'J', 	'N', 	'M', 	'F', 	'K', 	'C', 	'Q', 	'O', 	'H', 	'N', 	'B', 	'N', 	'P', 	'J', 	'D', 	'L', 	'N', 	'H', 	'Q'	],
            [	'E', 	'Q', 	'V', 	'H', 	'T', 	'Q', 	'I', 	'I', 	'V', 	'X', 	'D', 	'D', 	'V', 	'L', 	'E', 	'S', 	'D', 	'E', 	'E', 	'T', 	'R', 	'N', 	'N', 	'A', 	'A', 	'G', 	'K', 	'F', 	'D', 	'O', 	'B', 	'U', 	'A'	],
            [	'F', 	'N', 	'L', 	'B', 	'P', 	'J', 	'A', 	'C', 	'N', 	'Q', 	'K', 	'J', 	'Q', 	'D', 	'F', 	'W', 	'A', 	'U', 	'G', 	'U', 	'S', 	'T', 	'A', 	'O', 	'R', 	'L', 	'S', 	'N', 	'T', 	'A', 	'K', 	'R', 	'X'	],
            [	'F', 	'Z', 	'X', 	'A', 	'Z', 	'C', 	'K', 	'O', 	'Y', 	'D', 	'P', 	'Z', 	'I', 	'S', 	'N', 	'Q', 	'P', 	'L', 	'K', 	'Z', 	'F', 	'O', 	'S', 	'G', 	'H', 	'L', 	'O', 	'N', 	'S', 	'N', 	'C', 	'S', 	'F'	],
            [	'E', 	'U', 	'F', 	'T', 	'H', 	'X', 	'E', 	'L', 	'O', 	'H', 	'I', 	'V', 	'H', 	'V', 	'S', 	'S', 	'A', 	'T', 	'I', 	'Q', 	'W', 	'E', 	'F', 	'B', 	'W', 	'M', 	'E', 	'A', 	'B', 	'Z', 	'C', 	'Y', 	'G'	],
            [	'R', 	'D', 	'A', 	'O', 	'F', 	'G', 	'P', 	'U', 	'M', 	'V', 	'O', 	'A', 	'A', 	'L', 	'O', 	'T', 	'A', 	'Z', 	'W', 	'T', 	'G', 	'T', 	'C', 	'B', 	'H', 	'R', 	'N', 	'S', 	'U', 	'A', 	'T', 	'Y', 	'H'	],
            [	'S', 	'L', 	'N', 	'N', 	'X', 	'C', 	'O', 	'M', 	'B', 	'R', 	'C', 	'X', 	'N', 	'P', 	'N', 	'L', 	'R', 	'X', 	'T', 	'I', 	'T', 	'Z', 	'U', 	'C', 	'T', 	'T', 	'Y', 	'C', 	'T', 	'I', 	'Q', 	'A', 	'T'	],
            [	'O', 	'E', 	'B', 	'R', 	'W', 	'X', 	'T', 	'B', 	'P', 	'K', 	'K', 	'V', 	'M', 	'A', 	'L', 	'K', 	'P', 	'O', 	'R', 	'V', 	'H', 	'L', 	'I', 	'A', 	'A', 	'Y', 	'A', 	'H', 	'C', 	'O', 	'R', 	'W', 	'L'	],
            [	'N', 	'K', 	'H', 	'O', 	'K', 	'T', 	'X', 	'I', 	'S', 	'K', 	'T', 	'F', 	'L', 	'A', 	'P', 	'I', 	'H', 	'I', 	'F', 	'K', 	'S', 	'R', 	'E', 	'F', 	'S', 	'A', 	'L', 	'E', 	'M', 	'T', 	'N', 	'C', 	'I'	],
            [	'C', 	'Z', 	'E', 	'U', 	'P', 	'U', 	'I', 	'A', 	'N', 	'B', 	'J', 	'T', 	'H', 	'Y', 	'I', 	'O', 	'M', 	'E', 	'E', 	'K', 	'A', 	'D', 	'E', 	'R', 	'W', 	'O', 	'K', 	'K', 	'F', 	'I', 	'U', 	'G', 	'C'	],
            [	'I', 	'A', 	'L', 	'G', 	'L', 	'C', 	'N', 	'K', 	'U', 	'T', 	'A', 	'A', 	'V', 	'O', 	'T', 	'C', 	'L', 	'L', 	'C', 	'R', 	'N', 	'Q', 	'K', 	'Z', 	'O', 	'A', 	'Z', 	'O', 	'D', 	'I', 	'V', 	'A', 	'F'	],
            [	'T', 	'X', 	'E', 	'E', 	'A', 	'Y', 	'E', 	'S', 	'P', 	'K', 	'S', 	'S', 	'C', 	'U', 	'G', 	'L', 	'U', 	'I', 	'W', 	'C', 	'R', 	'A', 	'O', 	'D', 	'L', 	'C', 	'R', 	'R', 	'G', 	'F', 	'R', 	'R', 	'R'	],
            [	'Y', 	'S', 	'N', 	'P', 	'F', 	'D', 	'O', 	'P', 	'Q', 	'S', 	'A', 	'U', 	'I', 	'Q', 	'I', 	'A', 	'L', 	'P', 	'S', 	'M', 	'E', 	'E', 	'R', 	'T', 	'Z', 	'D', 	'K', 	'N', 	'D', 	'W', 	'P', 	'G', 	'G'	],
            [	'C', 	'Z', 	'A', 	'W', 	'E', 	'U', 	'H', 	'M', 	'E', 	'C', 	'Q', 	'P', 	'F', 	'V', 	'P', 	'E', 	'C', 	'E', 	'L', 	'L', 	'D', 	'Q', 	'L', 	'F', 	'P', 	'R', 	'V', 	'S', 	'C', 	'Q', 	'T', 	'P', 	'P'	],
            [	'U', 	'N', 	'X', 	'N', 	'M', 	'Z', 	'P', 	'E', 	'R', 	'S', 	'K', 	'B', 	'H', 	'T', 	'I', 	'S', 	'L', 	'P', 	'Z', 	'I', 	'U', 	'A', 	'I', 	'H', 	'S', 	'T', 	'D', 	'R', 	'O', 	'C', 	'N', 	'O', 	'C'	],
            [	'X', 	'Q', 	'Z', 	'K', 	'O', 	'Y', 	'X', 	'A', 	'O', 	'V', 	'P', 	'S', 	'N', 	'P', 	'J', 	'I', 	'G', 	'C', 	'O', 	'I', 	'S', 	'W', 	'A', 	'D', 	'P', 	'J', 	'P', 	'I', 	'M', 	'N', 	'A', 	'J', 	'J'	],
            [	'S', 	'K', 	'U', 	'W', 	'L', 	'E', 	'M', 	'A', 	'K', 	'Y', 	'A', 	'I', 	'X', 	'M', 	'R', 	'O', 	'Q', 	'R', 	'I', 	'A', 	'M', 	'E', 	'L', 	'V', 	'R', 	'R', 	'P', 	'J', 	'A', 	'D', 	'C', 	'N', 	'M'	],
            [	'B', 	'S', 	'J', 	'S', 	'Y', 	'E', 	'Y', 	'U', 	'X', 	'N', 	'A', 	'U', 	'O', 	'Q', 	'H', 	'B', 	'W', 	'G', 	'R', 	'Y', 	'Z', 	'W', 	'G', 	'O', 	'I', 	'Z', 	'G', 	'H', 	'D', 	'H', 	'G', 	'E', 	'M'	],
            [	'I', 	'N', 	'S', 	'E', 	'N', 	'S', 	'B', 	'S', 	'X', 	'S', 	'A', 	'K', 	'D', 	'E', 	'S', 	'M', 	'O', 	'I', 	'N', 	'E', 	'S', 	'G', 	'C', 	'R', 	'N', 	'L', 	'Z', 	'L', 	'I', 	'U', 	'M', 	'N', 	'J'	],
            [	'S', 	'H', 	'S', 	'T', 	'J', 	'I', 	'L', 	'T', 	'P', 	'D', 	'B', 	'Y', 	'Y', 	'D', 	'E', 	'N', 	'V', 	'E', 	'R', 	'K', 	'G', 	'B', 	'H', 	'Q', 	'G', 	'V', 	'O', 	'B', 	'S', 	'L', 	'O', 	'O', 	'R'	],
            [	'M', 	'Z', 	'O', 	'D', 	'O', 	'L', 	'X', 	'I', 	'D', 	'A', 	'T', 	'L', 	'V', 	'U', 	'K', 	'I', 	'T', 	'R', 	'E', 	'V', 	'O', 	'D', 	'E', 	'S', 	'F', 	'S', 	'F', 	'B', 	'O', 	'O', 	'N', 	'Q', 	'W'	],
            [	'A', 	'S', 	'Y', 	'A', 	'I', 	'O', 	'T', 	'N', 	'S', 	'F', 	'B', 	'D', 	'Y', 	'T', 	'I', 	'C', 	'N', 	'O', 	'S', 	'R', 	'A', 	'C', 	'Y', 	'V', 	'I', 	'Z', 	'A', 	'F', 	'N', 	'L', 	'T', 	'G', 	'V'	],
            [	'R', 	'E', 	'E', 	'S', 	'R', 	'P', 	'G', 	'S', 	'K', 	'N', 	'P', 	'N', 	'O', 	'T', 	'S', 	'O', 	'B', 	'H', 	'V', 	'Z', 	'U', 	'Q', 	'E', 	'A', 	'E', 	'P', 	'N', 	'E', 	'K', 	'X', 	'P', 	'W', 	'Q'	],
            [	'C', 	'L', 	'X', 	'P', 	'O', 	'A', 	'E', 	'C', 	'H', 	'S', 	'U', 	'B', 	'M', 	'U', 	'L', 	'O', 	'C', 	'K', 	'D', 	'W', 	'S', 	'D', 	'N', 	'S', 	'L', 	'U', 	'I', 	'Y', 	'B', 	'Y', 	'E', 	'A', 	'O'	],
            [	'K', 	'Q', 	'W', 	'J', 	'B', 	'N', 	'Z', 	'H', 	'R', 	'O', 	'G', 	'I', 	'M', 	'E', 	'I', 	'T', 	'U', 	'Z', 	'W', 	'J', 	'I', 	'L', 	'N', 	'Q', 	'D', 	'Z', 	'A', 	'D', 	'B', 	'S', 	'L', 	'T', 	'H'	],
            [	'Y', 	'E', 	'E', 	'C', 	'I', 	'N', 	'N', 	'L', 	'O', 	'C', 	'N', 	'I', 	'L', 	'P', 	'R', 	'B', 	'T', 	'J', 	'Q', 	'P', 	'U', 	'X', 	'E', 	'I', 	'Y', 	'A', 	'Z', 	'F', 	'J', 	'E', 	'I', 	'J', 	'Z'	],
            [	'Y', 	'M', 	'W', 	'Y', 	'G', 	'A', 	'L', 	'R', 	'D', 	'H', 	'O', 	'H', 	'G', 	'I', 	'E', 	'L', 	'A', 	'R', 	'W', 	'H', 	'N', 	'U', 	'Q', 	'Z', 	'C', 	'A', 	'A', 	'G', 	'F', 	'A', 	'E', 	'F', 	'F'	],
            [	'T', 	'X', 	'W', 	'O', 	'N', 	'M', 	'A', 	'G', 	'N', 	'O', 	'D', 	'I', 	'Z', 	'C', 	'Q', 	'G', 	'Z', 	'R', 	'N', 	'Z', 	'L', 	'C', 	'M', 	'S', 	'F', 	'H', 	'Y', 	'F', 	'F', 	'S', 	'R', 	'B', 	'T'	]
        ];
        var power_matrix = [
            [	'B',    'Y',    'R',    'E',    'M',    'O',    'G',    'T',    'N',    'O',    'M',    'N',    'W',    'D',    'S',    'Z',    'N',    'Y',    'T',    'I',    'C',    'A', 	'M',    'O',    'H',    'A',    'L',    'K',    'O',    'Z',    'O',    'M',    'G'	],
            [	'G', 	'I', 	'G', 	'R', 	'U', 	'B', 	'S', 	'I', 	'R', 	'R', 	'A', 	'H', 	'K', 	'N', 	'Z', 	'W', 	'U', 	'U', 	'D', 	'G', 	'Z', 	'O', 	'K', 	'T', 	'X', 	'G', 	'J', 	'A', 	'C', 	'K', 	'S', 	'O', 	'N'	],
            [	'A', 	'C', 	'T', 	'F', 	'V', 	'V', 	'S', 	'R', 	'G', 	'U', 	'S', 	'L', 	'U', 	'U', 	'F', 	'M', 	'W', 	'N', 	'L', 	'T', 	'N', 	'X', 	'N', 	'P', 	'B', 	'C', 	'U', 	'D', 	'O', 	'M', 	'Z', 	'Y', 	'X'	],
            [	'G', 	'W', 	'H', 	'M', 	'T', 	'S', 	'G', 	'D', 	'S', 	'N', 	'F', 	'O', 	'J', 	'O', 	'M', 	'R', 	'E', 	'E', 	'H', 	'U', 	'K', 	'I', 	'J', 	'P', 	'G', 	'L', 	'Y', 	'S', 	'V', 	'V', 	'Q', 	'Q', 	'I'	],
            [	'S', 	'V', 	'J', 	'C', 	'X', 	'D', 	'E', 	'A', 	'L', 	'B', 	'A', 	'N', 	'Y', 	'I', 	'A', 	'K', 	'C', 	'R', 	'B', 	'L', 	'L', 	'C', 	'S', 	'Q', 	'A', 	'H', 	'P', 	'X', 	'Z', 	'Q', 	'Q', 	'A', 	'S'	],
            [	'J', 	'O', 	'L', 	'Y', 	'M', 	'P', 	'I', 	'A', 	'J', 	'U', 	'A', 	'E', 	'N', 	'U', 	'J', 	'N', 	'M', 	'F', 	'K', 	'C', 	'Q', 	'O', 	'H', 	'N', 	'B', 	'N', 	'P', 	'J', 	'D', 	'L', 	'N', 	'H', 	'Q'	],
            [	'E', 	'Q', 	'V', 	'H', 	'T', 	'Q', 	'I', 	'I', 	'V', 	'X', 	'D', 	'D', 	'V', 	'L', 	'E', 	'S', 	'D', 	'E', 	'E', 	'T', 	'R', 	'N', 	'N', 	'A', 	'A', 	'G', 	'K', 	'F', 	'D', 	'O', 	'B', 	'U', 	'A'	],
            [	'F', 	'N', 	'L', 	'B', 	'P', 	'J', 	'A', 	'C', 	'N', 	'Q', 	'K', 	'J', 	'Q', 	'D', 	'F', 	'W', 	'A', 	'U', 	'G', 	'U', 	'S', 	'T', 	'A', 	'O', 	'R', 	'L', 	'S', 	'N', 	'T', 	'A', 	'K', 	'R', 	'X'	],
            [	'F', 	'Z', 	'X', 	'A', 	'Z', 	'C', 	'K', 	'O', 	'Y', 	'D', 	'P', 	'Z', 	'I', 	'S', 	'N', 	'Q', 	'P', 	'L', 	'K', 	'Z', 	'F', 	'O', 	'S', 	'G', 	'H', 	'L', 	'O', 	'N', 	'S', 	'N', 	'C', 	'S', 	'F'	],
            [	'E', 	'U', 	'F', 	'T', 	'H', 	'X', 	'E', 	'L', 	'O', 	'H', 	'I', 	'V', 	'H', 	'V', 	'S', 	'S', 	'A', 	'T', 	'I', 	'Q', 	'W', 	'E', 	'F', 	'B', 	'W', 	'M', 	'E', 	'A', 	'B', 	'Z', 	'C', 	'Y', 	'G'	],
            [	'R', 	'D', 	'A', 	'O', 	'F', 	'G', 	'P', 	'U', 	'M', 	'V', 	'O', 	'A', 	'A', 	'L', 	'O', 	'T', 	'A', 	'Z', 	'W', 	'T', 	'G', 	'T', 	'C', 	'B', 	'H', 	'R', 	'N', 	'S', 	'U', 	'A', 	'T', 	'Y', 	'H'	],
            [	'S', 	'L', 	'N', 	'N', 	'X', 	'C', 	'O', 	'M', 	'B', 	'R', 	'C', 	'X', 	'N', 	'P', 	'N', 	'L', 	'R', 	'X', 	'T', 	'I', 	'T', 	'Z', 	'U', 	'C', 	'T', 	'T', 	'Y', 	'C', 	'T', 	'I', 	'Q', 	'A', 	'T'	],
            [	'O', 	'E', 	'B', 	'R', 	'W', 	'X', 	'T', 	'B', 	'P', 	'K', 	'K', 	'V', 	'M', 	'A', 	'L', 	'K', 	'P', 	'O', 	'R', 	'V', 	'H', 	'L', 	'I', 	'A', 	'A', 	'Y', 	'A', 	'H', 	'C', 	'O', 	'R', 	'W', 	'L'	],
            [	'N', 	'K', 	'H', 	'O', 	'K', 	'T', 	'X', 	'I', 	'S', 	'K', 	'T', 	'F', 	'L', 	'A', 	'P', 	'I', 	'H', 	'I', 	'F', 	'K', 	'S', 	'R', 	'E', 	'F', 	'S', 	'A', 	'L', 	'E', 	'M', 	'T', 	'N', 	'C', 	'I'	],
            [	'C', 	'Z', 	'E', 	'U', 	'P', 	'U', 	'I', 	'A', 	'N', 	'B', 	'J', 	'T', 	'H', 	'Y', 	'I', 	'O', 	'M', 	'E', 	'E', 	'K', 	'A', 	'D', 	'E', 	'R', 	'W', 	'O', 	'K', 	'K', 	'F', 	'I', 	'U', 	'G', 	'C'	],
            [	'I', 	'A', 	'L', 	'G', 	'L', 	'C', 	'N', 	'K', 	'U', 	'T', 	'A', 	'A', 	'V', 	'O', 	'T', 	'C', 	'L', 	'L', 	'C', 	'R', 	'N', 	'Q', 	'K', 	'Z', 	'O', 	'A', 	'Z', 	'O', 	'D', 	'I', 	'V', 	'A', 	'F'	],
            [	'T', 	'X', 	'E', 	'E', 	'A', 	'Y', 	'E', 	'S', 	'P', 	'K', 	'S', 	'S', 	'C', 	'U', 	'G', 	'L', 	'U', 	'I', 	'W', 	'C', 	'R', 	'A', 	'O', 	'D', 	'L', 	'C', 	'R', 	'R', 	'G', 	'F', 	'R', 	'R', 	'R'	],
            [	'Y', 	'S', 	'N', 	'P', 	'F', 	'D', 	'O', 	'P', 	'Q', 	'S', 	'A', 	'U', 	'I', 	'Q', 	'I', 	'A', 	'L', 	'P', 	'S', 	'M', 	'E', 	'E', 	'R', 	'T', 	'Z', 	'D', 	'K', 	'N', 	'D', 	'W', 	'P', 	'G', 	'G'	],
            [	'C', 	'Z', 	'A', 	'W', 	'E', 	'U', 	'H', 	'M', 	'E', 	'C', 	'Q', 	'P', 	'F', 	'V', 	'P', 	'E', 	'C', 	'E', 	'L', 	'L', 	'D', 	'Q', 	'L', 	'F', 	'P', 	'R', 	'V', 	'S', 	'C', 	'Q', 	'T', 	'P', 	'P'	],
            [	'U', 	'N', 	'X', 	'N', 	'M', 	'Z', 	'P', 	'E', 	'R', 	'S', 	'K', 	'B', 	'H', 	'T', 	'I', 	'S', 	'L', 	'P', 	'Z', 	'I', 	'U', 	'A', 	'I', 	'H', 	'S', 	'T', 	'D', 	'R', 	'O', 	'C', 	'N', 	'O', 	'C'	],
            [	'X', 	'Q', 	'Z', 	'K', 	'O', 	'Y', 	'X', 	'A', 	'O', 	'V', 	'P', 	'S', 	'N', 	'P', 	'J', 	'I', 	'G', 	'C', 	'O', 	'I', 	'S', 	'W', 	'A', 	'D', 	'P', 	'J', 	'P', 	'I', 	'M', 	'N', 	'A', 	'J', 	'J'	],
            [	'S', 	'K', 	'U', 	'W', 	'L', 	'E', 	'M', 	'A', 	'K', 	'Y', 	'A', 	'I', 	'X', 	'M', 	'R', 	'O', 	'Q', 	'R', 	'I', 	'A', 	'M', 	'E', 	'L', 	'V', 	'R', 	'R', 	'P', 	'J', 	'A', 	'D', 	'C', 	'N', 	'M'	],
            [	'B', 	'S', 	'J', 	'S', 	'Y', 	'E', 	'Y', 	'U', 	'X', 	'N', 	'A', 	'U', 	'O', 	'Q', 	'H', 	'B', 	'W', 	'G', 	'R', 	'Y', 	'Z', 	'W', 	'G', 	'O', 	'I', 	'Z', 	'G', 	'H', 	'D', 	'H', 	'G', 	'E', 	'M'	],
            [	'I', 	'N', 	'S', 	'E', 	'N', 	'S', 	'B', 	'S', 	'X', 	'S', 	'A', 	'K', 	'D', 	'E', 	'S', 	'M', 	'O', 	'I', 	'N', 	'E', 	'S', 	'G', 	'C', 	'R', 	'N', 	'L', 	'Z', 	'L', 	'I', 	'U', 	'M', 	'N', 	'J'	],
            [	'S', 	'H', 	'S', 	'T', 	'J', 	'I', 	'L', 	'T', 	'P', 	'D', 	'B', 	'Y', 	'Y', 	'D', 	'E', 	'N', 	'V', 	'E', 	'R', 	'K', 	'G', 	'B', 	'H', 	'Q', 	'G', 	'V', 	'O', 	'B', 	'S', 	'L', 	'O', 	'O', 	'R'	],
            [	'M', 	'Z', 	'O', 	'D', 	'O', 	'L', 	'X', 	'I', 	'D', 	'A', 	'T', 	'L', 	'V', 	'U', 	'K', 	'I', 	'T', 	'R', 	'E', 	'V', 	'O', 	'D', 	'E', 	'S', 	'F', 	'S', 	'F', 	'B', 	'O', 	'O', 	'N', 	'Q', 	'W'	],
            [	'A', 	'S', 	'Y', 	'A', 	'I', 	'O', 	'T', 	'N', 	'S', 	'F', 	'B', 	'D', 	'Y', 	'T', 	'I', 	'C', 	'N', 	'O', 	'S', 	'R', 	'A', 	'C', 	'Y', 	'V', 	'I', 	'Z', 	'A', 	'F', 	'N', 	'L', 	'T', 	'G', 	'V'	],
            [	'R', 	'E', 	'E', 	'S', 	'R', 	'P', 	'G', 	'S', 	'K', 	'N', 	'P', 	'N', 	'O', 	'T', 	'S', 	'O', 	'B', 	'H', 	'V', 	'Z', 	'U', 	'Q', 	'E', 	'A', 	'E', 	'P', 	'N', 	'E', 	'K', 	'X', 	'P', 	'W', 	'Q'	],
            [	'C', 	'L', 	'X', 	'P', 	'O', 	'A', 	'E', 	'C', 	'H', 	'S', 	'U', 	'B', 	'M', 	'U', 	'L', 	'O', 	'C', 	'K', 	'D', 	'W', 	'S', 	'D', 	'N', 	'S', 	'L', 	'U', 	'I', 	'Y', 	'B', 	'Y', 	'E', 	'A', 	'O'	],
            [	'K', 	'Q', 	'W', 	'J', 	'B', 	'N', 	'Z', 	'H', 	'R', 	'O', 	'G', 	'I', 	'M', 	'E', 	'I', 	'T', 	'U', 	'Z', 	'W', 	'J', 	'I', 	'L', 	'N', 	'Q', 	'D', 	'Z', 	'A', 	'D', 	'B', 	'S', 	'L', 	'T', 	'H'	],
            [	'Y', 	'E', 	'E', 	'C', 	'I', 	'N', 	'N', 	'L', 	'O', 	'C', 	'N', 	'I', 	'L', 	'P', 	'R', 	'B', 	'T', 	'J', 	'Q', 	'P', 	'U', 	'X', 	'E', 	'I', 	'Y', 	'A', 	'Z', 	'F', 	'J', 	'E', 	'I', 	'J', 	'Z'	],
            [	'Y', 	'M', 	'W', 	'Y', 	'G', 	'A', 	'L', 	'R', 	'D', 	'H', 	'O', 	'H', 	'G', 	'I', 	'E', 	'L', 	'A', 	'R', 	'W', 	'H', 	'N', 	'U', 	'Q', 	'Z', 	'C', 	'A', 	'A', 	'G', 	'F', 	'A', 	'E', 	'F', 	'F'	],
            [	'T', 	'X', 	'W', 	'O', 	'N', 	'M', 	'A', 	'G', 	'N', 	'O', 	'D', 	'I', 	'Z', 	'C', 	'Q', 	'G', 	'Z', 	'R', 	'N', 	'Z', 	'L', 	'C', 	'M', 	'S', 	'F', 	'H', 	'Y', 	'F', 	'F', 	'S', 	'R', 	'B', 	'T'	]
        ];

        var neutral_matrix = [
            [	'B',    'Y',    'R',    'E',    'M',    'O',    'G',    'T',    'N',    'O',    'M',    'N',    'W',    'D',    'S',    'Z',    'N',    'Y',    'T',    'I',    'C',    'A', 	'M',    'O',    'H',    'A',    'L',    'K',    'O',    'Z',    'O',    'M',    'G'	],
            [	'G', 	'I', 	'G', 	'R', 	'U', 	'B', 	'S', 	'I', 	'R', 	'R', 	'A', 	'H', 	'K', 	'N', 	'Z', 	'W', 	'U', 	'U', 	'D', 	'G', 	'Z', 	'O', 	'K', 	'T', 	'X', 	'G', 	'J', 	'A', 	'C', 	'K', 	'S', 	'O', 	'N'	],
            [	'A', 	'C', 	'T', 	'F', 	'V', 	'V', 	'S', 	'R', 	'G', 	'U', 	'S', 	'L', 	'U', 	'U', 	'F', 	'M', 	'W', 	'N', 	'L', 	'T', 	'N', 	'X', 	'N', 	'P', 	'B', 	'C', 	'U', 	'D', 	'O', 	'M', 	'Z', 	'Y', 	'X'	],
            [	'G', 	'W', 	'H', 	'M', 	'T', 	'S', 	'G', 	'D', 	'S', 	'N', 	'F', 	'O', 	'J', 	'O', 	'M', 	'R', 	'E', 	'E', 	'H', 	'U', 	'K', 	'I', 	'J', 	'P', 	'G', 	'L', 	'Y', 	'S', 	'V', 	'V', 	'Q', 	'Q', 	'I'	],
            [	'S', 	'V', 	'J', 	'C', 	'X', 	'D', 	'E', 	'A', 	'L', 	'B', 	'A', 	'N', 	'Y', 	'I', 	'A', 	'K', 	'C', 	'R', 	'B', 	'L', 	'L', 	'C', 	'S', 	'Q', 	'A', 	'H', 	'P', 	'X', 	'Z', 	'Q', 	'Q', 	'A', 	'S'	],
            [	'J', 	'O', 	'L', 	'Y', 	'M', 	'P', 	'I', 	'A', 	'J', 	'U', 	'A', 	'E', 	'N', 	'U', 	'J', 	'N', 	'M', 	'F', 	'K', 	'C', 	'Q', 	'O', 	'H', 	'N', 	'B', 	'N', 	'P', 	'J', 	'D', 	'L', 	'N', 	'H', 	'Q'	],
            [	'E', 	'Q', 	'V', 	'H', 	'T', 	'Q', 	'I', 	'I', 	'V', 	'X', 	'D', 	'D', 	'V', 	'L', 	'E', 	'S', 	'D', 	'E', 	'E', 	'T', 	'R', 	'N', 	'N', 	'A', 	'A', 	'G', 	'K', 	'F', 	'D', 	'O', 	'B', 	'U', 	'A'	],
            [	'F', 	'N', 	'L', 	'B', 	'P', 	'J', 	'A', 	'C', 	'N', 	'Q', 	'K', 	'J', 	'Q', 	'D', 	'F', 	'W', 	'A', 	'U', 	'G', 	'U', 	'S', 	'T', 	'A', 	'O', 	'R', 	'L', 	'S', 	'N', 	'T', 	'A', 	'K', 	'R', 	'X'	],
            [	'F', 	'Z', 	'X', 	'A', 	'Z', 	'C', 	'K', 	'O', 	'Y', 	'D', 	'P', 	'Z', 	'I', 	'S', 	'N', 	'Q', 	'P', 	'L', 	'K', 	'Z', 	'F', 	'O', 	'S', 	'G', 	'H', 	'L', 	'O', 	'N', 	'S', 	'N', 	'C', 	'S', 	'F'	],
            [	'E', 	'U', 	'F', 	'T', 	'H', 	'X', 	'E', 	'L', 	'O', 	'H', 	'I', 	'V', 	'H', 	'V', 	'S', 	'S', 	'A', 	'T', 	'I', 	'Q', 	'W', 	'E', 	'F', 	'B', 	'W', 	'M', 	'E', 	'A', 	'B', 	'Z', 	'C', 	'Y', 	'G'	],
            [	'R', 	'D', 	'A', 	'O', 	'F', 	'G', 	'P', 	'U', 	'M', 	'V', 	'O', 	'A', 	'A', 	'L', 	'O', 	'T', 	'A', 	'Z', 	'W', 	'T', 	'G', 	'T', 	'C', 	'B', 	'H', 	'R', 	'N', 	'S', 	'U', 	'A', 	'T', 	'Y', 	'H'	],
            [	'S', 	'L', 	'N', 	'N', 	'X', 	'C', 	'O', 	'M', 	'B', 	'R', 	'C', 	'X', 	'N', 	'P', 	'N', 	'L', 	'R', 	'X', 	'T', 	'I', 	'T', 	'Z', 	'U', 	'C', 	'T', 	'T', 	'Y', 	'C', 	'T', 	'I', 	'Q', 	'A', 	'T'	],
            [	'O', 	'E', 	'B', 	'R', 	'W', 	'X', 	'T', 	'B', 	'P', 	'K', 	'K', 	'V', 	'M', 	'A', 	'L', 	'K', 	'P', 	'O', 	'R', 	'V', 	'H', 	'L', 	'I', 	'A', 	'A', 	'Y', 	'A', 	'H', 	'C', 	'O', 	'R', 	'W', 	'L'	],
            [	'N', 	'K', 	'H', 	'O', 	'K', 	'T', 	'X', 	'I', 	'S', 	'K', 	'T', 	'F', 	'L', 	'A', 	'P', 	'I', 	'H', 	'I', 	'F', 	'K', 	'S', 	'R', 	'E', 	'F', 	'S', 	'A', 	'L', 	'E', 	'M', 	'T', 	'N', 	'C', 	'I'	],
            [	'C', 	'Z', 	'E', 	'U', 	'P', 	'U', 	'I', 	'A', 	'N', 	'B', 	'J', 	'T', 	'H', 	'Y', 	'I', 	'O', 	'M', 	'E', 	'E', 	'K', 	'A', 	'D', 	'E', 	'R', 	'W', 	'O', 	'K', 	'K', 	'F', 	'I', 	'U', 	'G', 	'C'	],
            [	'I', 	'A', 	'L', 	'G', 	'L', 	'C', 	'N', 	'K', 	'U', 	'T', 	'A', 	'A', 	'V', 	'O', 	'T', 	'C', 	'L', 	'L', 	'C', 	'R', 	'N', 	'Q', 	'K', 	'Z', 	'O', 	'A', 	'Z', 	'O', 	'D', 	'I', 	'V', 	'A', 	'F'	],
            [	'T', 	'X', 	'E', 	'E', 	'A', 	'Y', 	'E', 	'S', 	'P', 	'K', 	'S', 	'S', 	'C', 	'U', 	'G', 	'L', 	'U', 	'I', 	'W', 	'C', 	'R', 	'A', 	'O', 	'D', 	'L', 	'C', 	'R', 	'R', 	'G', 	'F', 	'R', 	'R', 	'R'	],
            [	'Y', 	'S', 	'N', 	'P', 	'F', 	'D', 	'O', 	'P', 	'Q', 	'S', 	'A', 	'U', 	'I', 	'Q', 	'I', 	'A', 	'L', 	'P', 	'S', 	'M', 	'E', 	'E', 	'R', 	'T', 	'Z', 	'D', 	'K', 	'N', 	'D', 	'W', 	'P', 	'G', 	'G'	],
            [	'C', 	'Z', 	'A', 	'W', 	'E', 	'U', 	'H', 	'M', 	'E', 	'C', 	'Q', 	'P', 	'F', 	'V', 	'P', 	'E', 	'C', 	'E', 	'L', 	'L', 	'D', 	'Q', 	'L', 	'F', 	'P', 	'R', 	'V', 	'S', 	'C', 	'Q', 	'T', 	'P', 	'P'	],
            [	'U', 	'N', 	'X', 	'N', 	'M', 	'Z', 	'P', 	'E', 	'R', 	'S', 	'K', 	'B', 	'H', 	'T', 	'I', 	'S', 	'L', 	'P', 	'Z', 	'I', 	'U', 	'A', 	'I', 	'H', 	'S', 	'T', 	'D', 	'R', 	'O', 	'C', 	'N', 	'O', 	'C'	],
            [	'X', 	'Q', 	'Z', 	'K', 	'O', 	'Y', 	'X', 	'A', 	'O', 	'V', 	'P', 	'S', 	'N', 	'P', 	'J', 	'I', 	'G', 	'C', 	'O', 	'I', 	'S', 	'W', 	'A', 	'D', 	'P', 	'J', 	'P', 	'I', 	'M', 	'N', 	'A', 	'J', 	'J'	],
            [	'S', 	'K', 	'U', 	'W', 	'L', 	'E', 	'M', 	'A', 	'K', 	'Y', 	'A', 	'I', 	'X', 	'M', 	'R', 	'O', 	'Q', 	'R', 	'I', 	'A', 	'M', 	'E', 	'L', 	'V', 	'R', 	'R', 	'P', 	'J', 	'A', 	'D', 	'C', 	'N', 	'M'	],
            [	'B', 	'S', 	'J', 	'S', 	'Y', 	'E', 	'Y', 	'U', 	'X', 	'N', 	'A', 	'U', 	'O', 	'Q', 	'H', 	'B', 	'W', 	'G', 	'R', 	'Y', 	'Z', 	'W', 	'G', 	'O', 	'I', 	'Z', 	'G', 	'H', 	'D', 	'H', 	'G', 	'E', 	'M'	],
            [	'I', 	'N', 	'S', 	'E', 	'N', 	'S', 	'B', 	'S', 	'X', 	'S', 	'A', 	'K', 	'D', 	'E', 	'S', 	'M', 	'O', 	'I', 	'N', 	'E', 	'S', 	'G', 	'C', 	'R', 	'N', 	'L', 	'Z', 	'L', 	'I', 	'U', 	'M', 	'N', 	'J'	],
            [	'S', 	'H', 	'S', 	'T', 	'J', 	'I', 	'L', 	'T', 	'P', 	'D', 	'B', 	'Y', 	'Y', 	'D', 	'E', 	'N', 	'V', 	'E', 	'R', 	'K', 	'G', 	'B', 	'H', 	'Q', 	'G', 	'V', 	'O', 	'B', 	'S', 	'L', 	'O', 	'O', 	'R'	],
            [	'M', 	'Z', 	'O', 	'D', 	'O', 	'L', 	'X', 	'I', 	'D', 	'A', 	'T', 	'L', 	'V', 	'U', 	'K', 	'I', 	'T', 	'R', 	'E', 	'V', 	'O', 	'D', 	'E', 	'S', 	'F', 	'S', 	'F', 	'B', 	'O', 	'O', 	'N', 	'Q', 	'W'	],
            [	'A', 	'S', 	'Y', 	'A', 	'I', 	'O', 	'T', 	'N', 	'S', 	'F', 	'B', 	'D', 	'Y', 	'T', 	'I', 	'C', 	'N', 	'O', 	'S', 	'R', 	'A', 	'C', 	'Y', 	'V', 	'I', 	'Z', 	'A', 	'F', 	'N', 	'L', 	'T', 	'G', 	'V'	],
            [	'R', 	'E', 	'E', 	'S', 	'R', 	'P', 	'G', 	'S', 	'K', 	'N', 	'P', 	'N', 	'O', 	'T', 	'S', 	'O', 	'B', 	'H', 	'V', 	'Z', 	'U', 	'Q', 	'E', 	'A', 	'E', 	'P', 	'N', 	'E', 	'K', 	'X', 	'P', 	'W', 	'Q'	],
            [	'C', 	'L', 	'X', 	'P', 	'O', 	'A', 	'E', 	'C', 	'H', 	'S', 	'U', 	'B', 	'M', 	'U', 	'L', 	'O', 	'C', 	'K', 	'D', 	'W', 	'S', 	'D', 	'N', 	'S', 	'L', 	'U', 	'I', 	'Y', 	'B', 	'Y', 	'E', 	'A', 	'O'	],
            [	'K', 	'Q', 	'W', 	'J', 	'B', 	'N', 	'Z', 	'H', 	'R', 	'O', 	'G', 	'I', 	'M', 	'E', 	'I', 	'T', 	'U', 	'Z', 	'W', 	'J', 	'I', 	'L', 	'N', 	'Q', 	'D', 	'Z', 	'A', 	'D', 	'B', 	'S', 	'L', 	'T', 	'H'	],
            [	'Y', 	'E', 	'E', 	'C', 	'I', 	'N', 	'N', 	'L', 	'O', 	'C', 	'N', 	'I', 	'L', 	'P', 	'R', 	'B', 	'T', 	'J', 	'Q', 	'P', 	'U', 	'X', 	'E', 	'I', 	'Y', 	'A', 	'Z', 	'F', 	'J', 	'E', 	'I', 	'J', 	'Z'	],
            [	'Y', 	'M', 	'W', 	'Y', 	'G', 	'A', 	'L', 	'R', 	'D', 	'H', 	'O', 	'H', 	'G', 	'I', 	'E', 	'L', 	'A', 	'R', 	'W', 	'H', 	'N', 	'U', 	'Q', 	'Z', 	'C', 	'A', 	'A', 	'G', 	'F', 	'A', 	'E', 	'F', 	'F'	],
            [	'T', 	'X', 	'W', 	'O', 	'N', 	'M', 	'A', 	'G', 	'N', 	'O', 	'D', 	'I', 	'Z', 	'C', 	'Q', 	'G', 	'Z', 	'R', 	'N', 	'Z', 	'L', 	'C', 	'M', 	'S', 	'F', 	'H', 	'Y', 	'F', 	'F', 	'S', 	'R', 	'B', 	'T'	]
        ];

        var csize = size;
        var rsize = size;
        if (this.settings.condition > 2) {
            csize = 33;
            rsize = 33;
        }

        for (var row = 0; row < rsize; row++) {
            for (var col = 0; col < csize; col++) {
                if(this.settings.condition == 0) {
                    var item = {
                        letter: control_matrix [row][col], // Default value
                        row: row,
                        col: col
                    }
                }
                if(this.settings.condition == 1) {
                    var item = {
                        letter: impossible_matrix [row][col], // Default value
                        row: row,
                        col: col
                    }
                }

                if(this.settings.condition == 4) {
                    var item = {
                        letter: neutral_matrix [row][col], // Default value
                        row: row,
                        col: col
                    }
                }


                if(this.settings.condition == 5) {
                    var item = {
                        letter: power_matrix  [row][col], // Default value
                        row: row,
                        col: col
                    }
                }

                this.matrix[row][col] = item;
            }
        }
        return 1;
    }

    /**
     * Draw the matrix
     */
    WordSeach.prototype.drawmatrix = function() {
        var rowcount = this.settings.gridSize;
        var columncount = this.settings.gridSize;
        if (this.settings.test) {
            rowcount = 33;
            columncount = 33;
        }
        if (this.settings.condition > 2) {
            rowcount = 33;
            columncount = 33;
        }


        for (var row = 0; row < rowcount; row++) {
            // New row
            var divEl = document.createElement('div');
            divEl.setAttribute('class', 'ws-row');
            this.wrapEl.appendChild(divEl);

            for (var col = 0; col < columncount; col++) {
                var cvEl = document.createElement('canvas');
                cvEl.setAttribute('class', 'ws-col');
                cvEl.setAttribute('width', 20);
                cvEl.setAttribute('height', 20);

                // Fill text in middle center
                var x = cvEl.width / 2,
                    y = cvEl.height / 2;

                var ctx = cvEl.getContext('2d');
                ctx.font = '400 18px Calibri';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#333'; // Text color
                ctx.fillText(this.matrix[row][col].letter, x, y);

                // Add event listeners
                cvEl.addEventListener('mousedown', this.onMousedown(this.matrix[row][col]));
                cvEl.addEventListener('mouseover', this.onMouseover(this.matrix[row][col]));
                cvEl.addEventListener('mouseup', this.onMouseup());

                divEl.appendChild(cvEl);
            }
        }
    }

    /**
     * Fill up the remaining items
     */
    WordSeach.prototype.fillUpFools = function() {
        var rsize = this.settings.gridSize;
        var csize = this.settings.gridSize;
        if (this.settings.condition > 2) {
            rsize = 33;
            csize = 33;
        }
        for (var row = 0; row < rsize; row++) {
            for (var col = 0; col < csize; col++) {
                if (this.matrix[row][col].letter == '.') {
                    // Math.rangeInt(65, 90) => A ~ Z
                    this.matrix[row][col].letter = String.fromCharCode(Math.rangeInt(65, 90));
                }
            }
        }
    }

    /**
     * Returns matrix items
     * @param rowFrom
     * @param colFrom
     * @param rowTo
     * @param colTo
     * @return {Array}
     */
    WordSeach.prototype.getItems = function(rowFrom, colFrom, rowTo, colTo) {
        var items = [];

        if ( rowFrom === rowTo || colFrom === colTo || Math.abs(rowTo - rowFrom) == Math.abs(colTo - colFrom) ) {
            var shiftY = (rowFrom === rowTo) ? 0 : (rowTo > rowFrom) ? 1 : -1,
                shiftX = (colFrom === colTo) ? 0 : (colTo > colFrom) ? 1 : -1,
                row = rowFrom,
                col = colFrom;

            items.push(this.getItem(row, col));
            do {
                row += shiftY;
                col += shiftX;
                items.push(this.getItem(row, col));
            } while( row !== rowTo || col !== colTo );
        }

        return items;
    }

    /**
     * Returns matrix item
     * @param {Number} row
     * @param {Number} col
     * @return {*}
     */
    WordSeach.prototype.getItem = function(row, col) {
        return (this.matrix[row] ? this.matrix[row][col] : undefined);
    }

    /**
     * Clear the exist highlights
     */
    WordSeach.prototype.clearHighlight = function() {
        var selectedEls = document.querySelectorAll('.ws-selected');
        for (var i = 0; i < selectedEls.length; i++) {
            selectedEls[i].classList.remove('ws-selected');
        }
    }

    /**
     * Lookup if the wordlist contains the selected
     * @param {Array} selected
     */
    WordSeach.prototype.lookup = function(selected) {


        var words = [''];

        for (var i = 0; i < selected.length; i++) {
            words[0] += selected[i].letter;
        }
        words.push(words[0].split('').reverse().join(''));

        const nowhitespacewords = this.settings.words.map(str => str.replace(/\s/g, ''));
        
        if (nowhitespacewords.indexOf(words[0]) > -1 ||
            nowhitespacewords.indexOf(words[1]) > -1) {


            var index = nowhitespacewords.indexOf(words[0]) ;
            if (index < 0){
             index = nowhitespacewords.indexOf(words[1]);
            }
            //word has been found -- added this code to keep score - requires score function in bob script
            //also, added to strik found words and to check if already found before adding to score
            var ele = document.getElementById(this.settings.words[index]);

            if(document.getElementById(this.settings.words[index]).getAttribute("text-decoration") == 'none') {
                var currentscore = score();
                document.getElementById("score").innerHTML = "Found " + currentscore + " out of " + this.settings.words.length + " words so far.";
                document.getElementById(this.settings.words[index]).style.setProperty("text-decoration", "line-through");
                document.getElementById(this.settings.words[index]).setAttribute("text-decoration", "line-through");
            }


            for (var i = 0; i < selected.length; i++) {
                var row = selected[i].row + 1,
                    col = selected[i].col + 1,
                    el = document.querySelector('.ws-area .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');

                el.classList.add('ws-found');
            }
        }
    }

    /**
     * Mouse event - Mouse down
     * @param {Object} item
     */
    WordSeach.prototype.onMousedown = function(item) {
        var _this = this;
        return function() {
            _this.selectFrom = item;
        }
    }

    /**
     * Mouse event - Mouse move
     * @param {Object}
     */
    WordSeach.prototype.onMouseover = function(item) {
        var _this = this;
        return function() {
            if (_this.selectFrom) {
                _this.selected = _this.getItems(_this.selectFrom.row, _this.selectFrom.col, item.row, item.col);

                _this.clearHighlight();

                for (var i = 0; i < _this.selected.length; i ++) {
                    var current = _this.selected[i],
                        row = current.row + 1,
                        col = current.col + 1,
                        el = document.querySelector('.ws-area .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');

                    el.className += ' ws-selected';
                }
            }
        }
    }

    /**
     * Mouse event - Mouse up
     */
    WordSeach.prototype.onMouseup = function() {
        var _this = this;
        return function() {
            _this.selectFrom = null;
            _this.clearHighlight();
            _this.lookup(_this.selected);
            _this.selected = [];
        }
    }

})();
