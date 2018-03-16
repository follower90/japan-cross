var JapanCross = function(inputData, width, height, cellsize) {

	var input = inputData;
	var rows = height;
	var cols = width;
	var gameWidth = cols * cellsize;
	var gameHeight = rows * cellsize;

	var calcCondintionRow = function(cond) {
		let result = [], acc = 0;

		for (let i = 0; i < cond.length; i++) {
			if (cond[i]) {
				acc++;
			}
			if (acc && !cond[i]) {
				result.push(acc);
				acc = 0;
			}
		}
		return acc ? result.concat(acc) : result;
	};

	var getComputedRowConditions = function () {
		var rowConditions = d3.range(0, rows).map(function (d, i) {
			return input.slice(cols * i, cols + i * cols);
		});

		var calcConditions = function (conds) {
			var result = [];
			for (var i = 0; i < conds.length; i++) {
				result.push(calcCondintionRow(conds[i]));
			}
			return result;
		};

		return calcConditions(rowConditions);
	};

	var getComputedColConditions = function () {
		var colConditions = d3.range(0, cols).map(function (d, i) {
			var col = [];
			for (var x = 0; x < rows; x++) {
				col.push(input[x * cols + i]);
			}
			return col;
		});

		var calcCondintionRow = function (cond) {
			var result = [];
			var acc = 0;

			for (var i = 0; i < cond.length; i++) {
				if (cond[i]) {
					acc++;
				}
				if (acc && !cond[i]) {
					result.push(acc);
					acc = 0;
				}
			}
			return acc ? result.concat(acc) : result;
		};

		var calcConditions = function (conds) {
			var result = [];
			for (var i = 0; i < conds.length; i++) {
				result.push(calcCondintionRow(conds[i]));
			}
			return result;
		};

		return calcConditions(colConditions);
	};

	var computedRowConditions = getComputedRowConditions();
	var computedColConditions = getComputedColConditions();

	var rowsCondCols = d3.max(computedRowConditions.map(function (i) {
			return i.length
		})) + 1;

	var colsCondRols = d3.max(computedColConditions.map(function (i) {
			return i.length
		})) + 1;

	var pad_array = function (arr, len, fill) {
		return Array(len).fill(fill).concat(arr).slice(-len);
	};

	var rowsCondCells = d3.range(0, computedRowConditions.length * rowsCondCols).map(function (d) {
		var col = d % rowsCondCols;
		var row = (d - col) / rowsCondCols;

		computedRowConditions[row] = pad_array(computedRowConditions[row], rowsCondCols, '');

		return {
			x: col * cellsize,
			y: row * cellsize,
			value: computedRowConditions[row][col],
		};
	});

	var cellCondRows = d3.range(0, computedColConditions.length * colsCondRols).map(function (d) {
		var row = d % colsCondRols;
		var col = (d - row) / colsCondRols;

		computedColConditions[col] = pad_array(computedColConditions[col], colsCondRols, '');

		return {
			x: col * cellsize,
			y: row * cellsize,
			value: computedColConditions[col][row] || '',
		};
	});

	var rectx = function (d) {
		return d.x;
	};
	var recty = function (d) {
		return d.y;
	};

	var drawConditions = function (selector, cells, width, height) {
		var svg = d3.select(selector).append("svg")
			.attr("width", width)
			.attr("height", height);

		var cellContainer = svg.selectAll(".cell")
			.data(cells)
			.enter()
			.append('g');

		cellContainer.append("rect")
			.attr("class", function (d) {
				return "cell cond";
			})
			.attr("x", rectx)
			.attr("y", recty)
			.attr("width", cellsize)
			.attr("height", cellsize);

		cellContainer
			.append("text")
			.attr("x", function (d) {
				return d.x + cellsize / 2.5;
			})
			.attr("y", function (d) {
				return d.y + cellsize / 1.5;
			})
			.text(function (d) {
				return d.value
			});
	};

	drawConditions('#rowConditions', rowsCondCells, rowsCondCols * cellsize, gameHeight);
	drawConditions('#colConditions', cellCondRows, gameWidth, colsCondRols * cellsize);

	document.querySelector('#sep').style = 'width: ' + rowsCondCols * cellsize + 'px';

	var cells = d3.range(0, rows * cols).map(function (d) {
		var col = d % cols;
		var row = (d - col) / cols;

		return {
			x: col * cellsize,
			y: row * cellsize,
			pixel: false
		};
	});

	document.querySelector('.game').addEventListener('contextmenu', function (event) {
		event.preventDefault()
	});

	var svg = d3.select("#picture").append("svg")
		.attr("width", gameWidth)
		.attr("height", gameHeight);

	var draw = function (d) {
		if (d3.event.buttons == 1 || d3.event.buttons == 2 || d3.event.buttons == 3) {
			d.pixel = (d3.event.shiftKey || d3.event.buttons == 2) ? null : !d.pixel;
			var currentClass = this.classList.value;
			switch (d.pixel) {
				case true:
					if (currentClass !== 'cell empty') this.classList = 'cell pic';
					break;
				case false:
					if (currentClass !== 'cell empty') this.classList = 'cell air';
					break;
				default:
					if (currentClass !== 'cell pic') {
						this.classList = (currentClass === 'cell empty')
							? 'cell air'
							: 'cell empty';
					}
			}

			checkConditionsAsserts();
			checkGameIsFinished();
		}

		d3.event.preventDefault();
		d3.event.stopPropagation();
		return false;
	};

	var cell = svg.selectAll(".cell")
		.data(cells)
		.enter()
		.append('g');

	cell
		.append("rect")
		.attr("class", function (d) {
			return "cell" + (d.pixel ? " pic" : " air");
		})
		.attr("x", rectx)
		.attr("y", recty)
		.attr("width", cellsize)
		.attr("height", cellsize)
		.on("mousedown", draw)
		.on("mouseover", draw);

	cell
		.append('text')
		.attr('class', 'empty-cross')
		.attr("x", function (d) {
			return d.x + cellsize / 2.5;
		})
		.attr("y", function (d) {
			return d.y + cellsize / 1.5;
		})
		.text('x');


	for (var i = 0; i <= rows; i++) {
		if (i === rows || i % 5 === 0) {
			svg
				.append('line')
				.attr("x1", 0)
				.attr("y1", i * cellsize)
				.attr("x2", cols * cellsize)
				.attr("y2", i * cellsize)
				.attr("stroke-width", 1)
				.attr('stroke', 'black');
		}
	}

	for (var i = 0; i <= cols; i++) {
		if (i === cols || i % 5 === 0) {
			svg
				.append('line')
				.attr("y1", 0)
				.attr("x1", i * cellsize)
				.attr("y2", cols * cellsize)
				.attr("x2", i * cellsize)
				.attr("stroke-width", 1)
				.attr('stroke', 'black');
		}
	}

	var gameStartedAt = new Date().getTime();

	var startTimer = function (elem) {
		var clock = 0, offset, interval;

		function update() {
			clock += delta();
			render();
		}

		function render() {
			elem.innerHTML = (clock / 1000).toFixed(1);
		}

		function stop() {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		}

		function delta() {
			var now = Date.now(),
				d = now - offset;

			offset = now;
			return d;
		}

		if (!interval) {
			offset = Date.now();
			interval = setInterval(update, 100);
		}

		this.stop = stop;
	};
	var timer = new startTimer(document.querySelector('#status'));


	var getRow = function (rowNumber) {
		var cells = [].slice.call(svg.selectAll(".cell")._groups[0]);

		var row = cells.slice(rowNumber * cols, rowNumber * cols + cols);
		var data = row.map(function (i) {
			return i.classList.value === 'cell pic';
		});

		return calcCondintionRow(data);
	};

	var getCol = function (colNumber) {
		var cells = [].slice.call(svg.selectAll(".cell")._groups[0]);
		var col = [];

		for (var x = 0; x < rows; x++) {
			col.push(cells[x * cols + colNumber]);
		}

		var data = col.map(function (i) {
			return i.classList.value === 'cell pic';
		});

		return calcCondintionRow(data);
	};

	var checkConditionsAsserts = function () {
		for (var i = 0; i < computedRowConditions.length; i++) {

			var condCells = [].slice.call(document.querySelectorAll('#rowConditions svg g rect'));
			var rowConds = condCells.slice(i * rowsCondCols, i * rowsCondCols + rowsCondCols);

			var cond = computedRowConditions[i].filter(function (e) { return e });
			var roww = getRow(i);

			rowConds.forEach(function(ccc) { ccc.classList = 'cell cond'; });

			cond.forEach(function(item, index) {
				if (item === roww[index]) {
					var condEl = rowConds.find(function(ccc) { return !ccc.classList.contains('passed') && parseInt(ccc.nextSibling.textContent) === item; });
					condEl.classList = 'cell cond passed';
				}
			});
		}

		for (var i = 0; i < computedColConditions.length; i++) {

			var condColCells = [].slice.call(document.querySelectorAll('#colConditions svg g rect'));
			var cellConds = condColCells.slice(i * colsCondRols, i * colsCondRols + colsCondRols);

			var cond = computedColConditions[i].filter(function (e) { return e });
			var coll = getCol(i);

			cellConds.forEach(function(ccc) { ccc.classList = 'cell cond'; });

			cond.forEach(function(item, index) {
				if (item === coll[index]) {
					var condEl = cellConds.find(function(ccc) { return !ccc.classList.contains('passed') && parseInt(ccc.nextSibling.textContent) === item; });
					condEl.classList = 'cell cond passed';
				}
			});
		}
	};

	var checkGameIsFinished = function () {
		var arr = [];

		svg.selectAll(".cell")
			.each(function (d) {
				arr.push(d.pixel === true ? 1 : 0)
			});

		if (JSON.stringify(arr) == JSON.stringify(input)) {
			timer.stop();
			var time = (new Date().getTime() - gameStartedAt) / 1000;
			document.querySelector('#status').innerHTML = '<h2>YOU WIN</h2><p>' + time + ' seconds elapsed</p>';

		cell
			.selectAll('rect')
			.on('mouseover', null)
			.on('mousedown', null);

		}
	};

	return function () {

	};
};