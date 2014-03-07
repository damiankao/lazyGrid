lazyGrid = function(element) {
	//polyfill for request animataion frame
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
	})();

	var base = {};

	//variable declaration
	base.container = element;
	base.node = base.container.appendChild(document.createElement('div'));
	var _stage = base.node.appendChild(document.createElement('div'));
	var _tileBoard = _stage.appendChild(document.createElement('div'));

	var _rowHeaderNode = base.container.appendChild(document.createElement('div'));
	var _colHeaderNode = base.container.appendChild(document.createElement('div'));

	var _corner = base.container.appendChild(document.createElement('div'));

	var _rowHeader;
	var _colHeader;

	var _tiles = [];

	var _colHeaderWidth;
	var _rowHeaderWidth;

	var _colHeaderData = [];
	var _rowHeaderData = [];
	var _data;

	var _dataRowCount = 10;
	var _dataColCount = 10;

	var _tileRows;
	var _tileCols;

	var _visibleRows;
	var _visibleCols;

	var _tileWidth;
	var _tileHeight;

	var _scrollLimitX = 15;
	var _scrollLimitY = 15;

	var _dataRow = 0;
	var _dataCol = 0;

	var _maxXIndex;
	var _maxYIndex;

	var _timeout;

	var _cellPadding = 0;
	var _alternate = false;
	var _alternateA = 'white';
	var _alternateB = '#F0F0F0';

	var _buffer = 2;

	var _render = function(cell, data, row, col) {
		cell.innerHTML = data;
	};

	base.configure = function(numRows, numCols) {
		if (numRows == null) {
			numRows = _visibleRows;
		}

		if (numCols == null) {
			numCols = _visibleCols;
		}

		base.node.style.position = 'absolute';
		base.node.style.overflow = 'auto';
		base.node.style.width = base.container.style.width;
		base.node.style.height = base.container.style.height;
		base.node.style.top = 0;
		base.node.style.left = 0;

		if (_rowHeaderWidth != null) {
			_tileBoard.style.left = _rowHeaderWidth;
		}

		if (_colHeaderWidth != null) {
			_tileBoard.style.top = _colHeaderWidth;
		}

		if (_dataRowCount < _tileRows) {
			_tileRows = _dataRowCount + 2 * _buffer;
			_visibleRows = _dataRowCount;
		} else {
			_tileRows = numRows + 2 * _buffer;
			_visibleRows = numRows;
		}

		if (_dataColCount < _tileCols) {
			_tileCols = _dataColCount + 2 * _buffer;
			_visibleCols = _dataColCount;
		} else {
			_tileCols = numCols + 2 * _buffer;
			_visibleCols = numCols;
		}

		_tileWidth = parseInt(base.node.style.width) / _visibleCols;
		_tileHeight = parseInt(base.node.style.height) / _visibleRows;
		_dataRow = -_buffer;
		_dataCol = -_buffer;

		_tileBoard.style.height = _tileHeight * _tileRows;
		_tileBoard.style.width = _tileWidth * _tileCols;


		if (_rowHeaderBoard && _colHeaderBoard) {
			console.log('te');
			_corner.style.position = 'absolute';
			_corner.style.height = _colHeaderWidth;
			_corner.style.width = _rowHeaderWidth;
			_corner.style.background = 'white';
			_corner.style.top = 0;
			_corner.style.left = 0;
		}

		base.init()
		return base;
	}

	//core functions
	base.init = function() {
		//tiles
		while (_tileBoard.firstChild) {
		    _tileBoard.removeChild(_tileBoard.firstChild);
		}
		_tiles = [];

		for (var row = 0 ; row < _tileRows ; row ++ ) {
			var currentRow = [];
			for (var col = 0 ; col < _tileCols ; col ++ ) {
				var currentCell = _tileBoard.appendChild(document.createElement('div'));
				currentCell.style.position = 'absolute';
				currentRow.push(currentCell);
			}
			_tiles.push(currentRow);
		}

		_tileBoard.style.position = 'absolute';

		_tileBoard.style.top = -_buffer * _tileHeight;
		_tileBoard.style.left = -_buffer * _tileWidth;

		if (_colHeaderBoard) {
			_tileBoard.style.top = parseInt(_tileBoard.style.top) + _colHeaderWidth;
		}

		if (_rowHeaderBoard) {
			_tileBoard.style.left = parseInt(_tileBoard.style.left) + _rowHeaderWidth;
		}

		for (var row = 0 ; row < _tileRows ; row ++ ) {
			for (var col = 0 ; col < _tileCols ; col ++ ) {
				var tile = _tiles[row][col];
				tile.style.width = _tileWidth - (2 * _cellPadding);
				tile.style.height = _tileHeight - (2* _cellPadding);

				tile.style.padding = _cellPadding;
				tile.style.top = row * _tileHeight;
				tile.style.left = col * _tileWidth;
				tile.style.lineHeight = _tileHeight - (2* _cellPadding) + 'px';

			}
		}

		//stage
		_stage.style.width = _dataColCount * _tileWidth;
		_stage.style.height = _dataRowCount * _tileHeight;

		_maxXIndex = _dataColCount - _tileCols;
		_maxYIndex = _dataRowCount - _tileRows;

		base.render();

		return base;
	};

	base.render = function() {
		_tileBoard.style.top = _dataRow * _tileHeight;
		_tileBoard.style.left = _dataCol * _tileWidth;

		if (_colHeaderBoard) {
			_tileBoard.style.top = parseInt(_tileBoard.style.top) + _colHeaderWidth;
			_colHeaderBoard.style.left = _dataCol * _tileWidth;

			if (_rowHeaderBoard) {
				_colHeaderBoard.style.left = _dataCol * _tileWidth + _rowHeaderWidth;
			}
		}

		if (_rowHeaderBoard) {
			_tileBoard.style.left = parseInt(_tileBoard.style.left) + _rowHeaderWidth;
			_rowHeaderBoard.style.top = _dataRow * _tileHeight;

			if (_colHeaderBoard) {
				_rowHeaderBoard.style.top = _dataRow * _tileHeight + _colHeaderWidth;  
			}
		}

		for (var row = 0, dataRow = _dataRow ; row < _tileRows ; row ++, dataRow ++ ) {
			if (_data[dataRow] != null) {
				for (var col = 0, dataCol = _dataCol ; col < _tileCols ; col ++ , dataCol ++) {
					if (_data[dataRow][dataCol] != null) {
						var tile = _tiles[row][col];
						if (_alternate) {
							if (dataRow % 2) {
								tile.style.background = _alternateA;
							} else {
								tile.style.background = _alternateB;
							}
						}

						_render(tile, _data[dataRow][dataCol], dataRow, dataCol);
						if (_colHeaderBoard) {
							base.renderColHeader(col, dataCol);
						}

						if (_rowHeaderBoard) {
							base.renderRowHeader(row, dataRow);
						}
					}
				}
			}
		}
		
		return base;
	}

	base.node.onmousewheel = function(e) {
		e.preventDefault();
		base.node.scrollLeft -= Math.min(Math.max(e.wheelDeltaX,-_scrollLimitX),_scrollLimitX);;
		base.node.scrollTop -= Math.min(Math.max(e.wheelDeltaY,-_scrollLimitY),_scrollLimitY);
	}

	base.node.onscroll = function(e) {
		var left = base.node.scrollLeft;
		var top = base.node.scrollTop;
		
		var newDataCol = Math.min(Math.floor(left / _tileWidth) - _buffer, _maxXIndex);
		var newDataRow = Math.min(Math.floor(top / _tileHeight) - _buffer, _maxYIndex);

		if (newDataCol != _dataCol || newDataRow != _dataRow) {
			_dataCol = newDataCol;
			_dataRow = newDataRow;

			window.requestAnimFrame(base.render);
		}

		if (_colHeaderBoard) {
			_colHeaderBoard.style.top = top;
		}

		if (_rowHeaderBoard) {
			_rowHeaderBoard.style.left = left;
		}
		return base;
	}

	//configuration functions
	base.debug = function(numRows, numCols, totalRows, totalCols) {
		var d = [];
		for (var row = 0 ; row < totalRows ; row ++ ) {
			var currentRow = new Float32Array(totalCols);
			for (var col = 0 ; col < totalCols ; col ++ ) {
				currentRow[col] = row + col;
			}
			d.push(currentRow);
		}

		_data = d;
		_dataRowCount = _data.length;
		_dataColCount = _data[0].length;

		base.configure(numRows, numCols);

		return base;
	}

	var _colHeaderBoard;
	var _colHeaderTiles = [];
	base.addColHeader = function(d, width) {
		_colHeaderData = d;
		_colHeaderWidth = width;
		if (_colHeaderBoard) {
			while (_colHeaderBoard.firstChild) {
			    _colHeaderBoard.removeChild(_colHeaderBoard.firstChild);
			}
		} else {
			_colHeaderBoard = base.node.appendChild(document.createElement('div'));
		}

		_colHeaderBoard.style.position = 'absolute';
		_colHeaderBoard.style.height = width;
		_colHeaderBoard.style.width = _tileBoard.style.width;
		_colHeaderBoard.style.top = 0;
		_colHeaderBoard.style.background = '#4A4A4A';

		if (_rowHeaderBoard) {
			_colHeaderBoard.style.left = -_buffer * _tileWidth + _rowHeaderWidth;
		}

		_colHeaderTiles = [];

		for (var i = 0 ; i < _tileCols ; i ++ ){
			var cell = _colHeaderBoard.appendChild(document.createElement('div'));
			cell.style.position = 'absolute';
			cell.style.top = 0;
			cell.style.height = width - _cellPadding * 2;
			cell.style.padding = _cellPadding;
			cell.style.width = _tileWidth - _cellPadding * 2;
			cell.style.left = i * _tileWidth;
			cell.style.textAlign = 'center';
			cell.style.fontWeight = 'bold';
			cell.style.fontFamily = 'Arial';
			cell.style.fontSize = '8pt';
			cell.style.color = '#E3E3E3';
			cell.style.overflow = 'hidden';
			cell.style.whiteSpace = 'nowrap';
			cell.style.textOverflow = 'ellipsis';
			cell.style.borderRight = '1px solid white';
			cell.style.borderBottom = '1px solid white';

			_colHeaderTiles.push(cell);
		}

		base.configure();

		return base;
	};

	base.renderColHeader = function(col, dataCol) {
		if (_colHeaderData[dataCol]) {
			_colHeaderTiles[col].innerHTML = _colHeaderData[dataCol];
		}
	}

	var _rowHeaderBoard;
	var _rowHeaderTiles = [];
	base.addRowHeader = function(d, width) {
		_rowHeaderData = d;
		_rowHeaderWidth = width;
		if (_rowHeaderBoard) {
			while (_rowHeaderBoard.firstChild) {
			    _rowHeaderBoard.removeChild(_rowHeaderBoard.firstChild);
			}
		} else {
			_rowHeaderBoard = base.node.appendChild(document.createElement('div'));
		}

		_rowHeaderBoard.style.position = 'absolute';
		_rowHeaderBoard.style.height = _tileBoard.style.height;
		_rowHeaderBoard.style.width = width;
		_rowHeaderBoard.style.left = 0;
		_rowHeaderBoard.style.background = '#4A4A4A';

		if (_colHeaderBoard) {
			_rowHeaderBoard.style.top = -_buffer * _tileHeight + _colHeaderWidth;
		}

		_rowHeaderTiles = [];

		for (var i = 0 ; i < _tileRows ; i ++ ) {
			var cell = _rowHeaderBoard.appendChild(document.createElement('div'));
			cell.style.position = 'absolute';
			cell.style.top = i * _tileHeight;
			cell.style.height = _tileHeight - _cellPadding * 2;
			cell.style.width = width - _cellPadding * 2;
			cell.style.left = 0;
			cell.style.padding = _cellPadding;
			cell.style.textAlign = 'center';
			cell.style.fontWeight = 'bold';
			cell.style.fontFamily = 'Arial';
			cell.style.fontSize = '8pt';
			cell.style.color = '#E3E3E3';
			cell.style.overflow = 'hidden';
			cell.style.whiteSpace = 'nowrap';
			cell.style.textOverflow = 'ellipsis';
			cell.style.borderRight = '1px solid white';
			cell.style.borderBottom = '1px solid white';

			_rowHeaderTiles.push(cell);
		}

		base.configure();

		return base;
	};

	base.renderRowHeader = function(row, dataRow) {
		if (_rowHeaderData[dataRow] != null) {
			_rowHeaderTiles[row].innerHTML = _rowHeaderData[dataRow];
		}
	}

	_headerCellInit = function(cell, row, col) {
		cell.style.textAlign = 'center';
		cell.style.fontWeight = 'bold';
		cell.style.fontFamily = 'Arial';
		cell.style.fontSize = '8pt';
		cell.style.color = '#E3E3E3';
		cell.style.overflow = 'hidden';
		cell.style.whiteSpace = 'nowrap';
		cell.style.textOverflow = 'ellipsis';
		cell.style.borderRight = '1px solid white';
		cell.style.borderBottom = '1px solid white';
	}

	base.colHeader = function(d, width) {		
		_colHeaderWidth = width;
		_colHeaderNode.style.position = 'absolute';

		_colHeader = new lazyGrid(_colHeaderNode)
			.data(d)
			.cellPadding(4)
			.alternate(false)
			.background('#4A4A4A')
			.configure(1, _visibleCols)
			.eachCell(_headerCellInit)
			.eachCellRender(function(cell, data, row, col) {
				cell.row = row;
				cell.col = col;
				cell.innerHTML = data;
			});

		_colHeader.node.style.overflow = 'hidden';

		base.configure();

		if (_rowHeader) {
			if (_rowHeaderWidth != null) {
				_rowHeaderNode.style.top = parseInt(base.container.style.height) - parseInt(base.node.style.height);
				_rowHeaderNode.style.left = 0;
				_rowHeaderNode.style.width = _rowHeaderWidth;
				_rowHeaderNode.style.height = base.node.style.height;
			}

			_rowHeader
				.background('#4A4A4A')
				.configure(_visibleRows, 1)
				.initCell();

			_rowHeader.node.style.overflow = 'hidden';
		}
		return base;
	};

	base.rowHeader = function(d, width) {
		_rowHeaderWidth = width;
		_rowHeaderNode.style.position = 'absolute';
		
		_rowHeaderNode.style.top = parseInt(base.container.style.height) - parseInt(base.node.style.height);
		_rowHeaderNode.style.left = 0;
		_rowHeaderNode.style.width = _rowHeaderWidth;
		_rowHeaderNode.style.height = base.node.style.height;

		_rowHeader = new lazyGrid(_rowHeaderNode)
			.data(d)
			.cellPadding(4)
			.alternate(false)
			.background('#4A4A4A')
			.configure(_visibleRows, 1)
			.eachCell(_headerCellInit)
			.eachCellRender(function(cell, data, row, col) {
				cell.row = row;
				cell.col = col;
				cell.innerHTML = data;
			});

		_rowHeader.node.style.overflow = 'hidden';

		base.configure();

		if (_colHeaderWidth != null) {
			_colHeaderNode.style.top = 0;
			_colHeaderNode.style.left = parseInt(base.container.style.width) - parseInt(base.node.style.width);
			_colHeaderNode.style.width = base.node.style.width;
			_colHeaderNode.style.height = _colHeaderWidth;

			_colHeader
				.background('#4A4A4A')
				.configure(1, _visibleCols)
				.initCell();

			_colHeader.node.style.overflow = 'hidden';
		}

		return base;
	};

	_initCell = function(cell, row, col) {

	};

	base.initCell = function() {
		for (var row = 0 ; row < _tileRows ; row ++ ) {
			for (var col = 0 ; col < _tileCols ; col ++ ) {
				_initCell(_tiles[row][col], row, col);
			}
		}

		return base;
	};

	base.eachCellRender = function(f) {
		_render = f;

		base.render();
		return base;
	};

	base.eachCell = function(func) {
		_initCell = func;

		base.initCell();

		return base;
	}

	base.alternate = function(b) {
		_alternate = b;

		base.render();
		return base;
	}

	base.alternateColors = function(a, b) {
		_alternateA = a;
		_alternateB = b;

		base.render();
		return base;
	}

	base.data = function(d) {
		_data = d;
		_dataRowCount = _data.length;
		_dataColCount = _data[0].length;

		return base;
	}

	base.cellPadding = function(d) {
		_cellPadding = d;

		base.configure();
		return base;
	}

	base.background = function(c) {
		base.node.style.background = c;

		return base;
	}

	base.scrollLimit = function(x, y) {
		_scrollLimitY = y;
		_scrollLimitX = x;
		return base;
	}

	base.debug(12,10,5000,50);
	return base;
}