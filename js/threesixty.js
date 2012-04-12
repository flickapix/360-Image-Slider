/**
 *	Forked from https://github.com/heartcode/360-Image-Slider
 *	Many thanks to Robert Pataki for his hard work and inspiration
 *
 *	Licensed under MIT, please see https://github.com/pkalogiros/360-Image-Slider/
 **/
(function( parent ) {
	"use strict";
	// if no parent is specified attach to the window
	!parent && ( parent = window );
			
	/**
	 *	CONSTRUCTOR of SwipeSequence
	 *
	 *	@param	HTMLElement - container of the swipesequence
	 *	@param	Array	-	String array that contains all the image paths, or configuration
	 *	@param	Boolean	-	Specified the img_array, false for {object}, true for [array]
	 **/
	var _swipeSequence = function( container, img_array, controls, way ) {
		"use strict";

		// if img_array is in the form of { frames : Z, path : X, ext : C }
		// let's construct the full object
		if( !way )
		{
			var _tmparr = img_array,
				_len = this.length = img_array.frames,
				_path = img_array.path,
				_ext = img_array.ext;
			
			++_len;
			
			img_array = [];
			// building the array (at this point both config ways become the same)
			while( --_len )
				img_array.unshift( _path + _len + _ext );
			
			// cleaning up
			_tmparr = _len = _path = _ext = null;
		}
		
		// @public
		/**
		 *	@return Array Image array accessor
		 **/
		this.getImageArray = function() {
			return img_array;
		},
		/**
		 *	@return HTMLElement The image element's parent/container
		 **/
		this.getContainer = function() {
			return container;
		},
		/**
		 *	@return HTMLImageElement The image element
		 **/
		this.getImageElement = function() {
			return img_el;
		},
		/**
		 *	(void) Halts the rotation
		 **/
		this.stop = function() {
			window.clearInterval( ticker );
			ticker = 0;
		},
		/**
		 *	(void) Destroys the swipeSequence, please follow this function with a
		 *	mySwipeView = null; to clear everything
		 **/
		this.destroy = function() {
			if( document.addEventListener )
				container.removeEventListener( eventDown, eventDownFunc, false ),
				container.removeEventListener( eventMove, eventMoveFunc, false ),
				container.removeEventListener( eventUp, eventDownFunc, false );
			else
				container.detachEvent( 'on' + eventDown, eventDownFunc ),
				container.detachEvent( 'on' + eventMove, eventMoveFunc ),
				container.detachEvent( 'on' + eventUp, eventDownFunc );
			
			img_el.src = img_array = null;
			container.removeChild( img_el );
			img_el = null;
			return false;
		},
		/** (int) holds position of the current loaded image **/
		this.currentFrame = 0,
		/** the total amount of images we have in the sequence **/
		this.length = img_array.length;

		// @private
		var max_zoom = 2.2, // pinch zoom - max value (220%)
			min_zoom = 0.8, // pinch zoom - min value (220%)
			initCallback,	// called when the module is initialized
			stepCallback;	// called once per loaded image
		
		// overriding zoom values
		if( controls )
			max_zoom = controls.max,
			min_zoom = controls.min,
			initCallback = controls.init,
			stepCallback = controls.step;
			
		var q = this,
			// We keep track of the loaded images by increasing every time a new image is added to the image slider
			loadedImages = 0,
			// keeping the count of images cached
			len = this.length,
			// the source of this element will change depending on the angle
			img_el = document.createElement('img'),
			img_elStyle = img_el.style,
			// A setInterval instance used to call the rendering function
			ticker = 0,
			// browser transform property
			_transform = findTransform( img_elStyle ),
			
			// events
			eventDown = 'mousedown',
			eventMove = 'mousemove',
			eventUp = 'mouseup',
			
			dragging = false,		// Tells the app if the user is dragging the pointer
			container_width,		// width of the container
			endFrame,				// frame where the rotation will stop
			monitorStartTime = 0,	// The starting time of the pointer tracking period
			monitorInt = 10,		// The pointer tracking time duration
			speedMultiplier = 10,	// Sets the speed of the image sliding animation
			pointerStartPosX = 0,	// Stores the pointer starting X position for the pointer tracking
			pointerEndPosX = 0,		// Stores the pointer ending X position for the pointer tracking
			pointerDistance = 0,	// Stores the distance between the starting and ending pointer X position in each time period we are tracking
			
			scaleVal = 1.0,			// initial scale value (default is 100%)
			origVal = 1.0,
			isPinch = false,
			
			pinchPointX = 0,		// distance
			pinchPointY = 0,
			
			/**
			 *	(void) runs once per loaded image
			 **/
			updateloadedImages = function() {
				stepCallback && stepCallback( ( loadedImages / len * 100 ) >> 0 );
				++loadedImages === len && initialize();
			},
			
			/**
			 *	(void) Invoked when all images are loaded
			 **/
			initialize = function() {
				img_el.src = img_array[ 0 ];
				container.style.display = "block";
				setTimeout(function() {
					container.style.opacity = 1;
				}, 20 );
				//computing container's width
				container_width = container.offsetWidth;
				//call the interval if it's not running already
				refresh();
				// call the callback (initialized)
				initCallback && initCallback();
			},
			/**
			* (void) Creates a new setInterval and stores it in the "ticker"
			* By default I set the FPS value to 45 which gives a nice and smooth rendering
			**/
			refresh = this.refresh = function() {
				if( ticker === 0 ) // If the ticker is not running already
					ticker = self.setInterval( render, 23 );
			},
			/**
			* (void) Renders the image slider frame animations.
			*/
			render = function() {
				var currentFrame = q.currentFrame,
					_endFrame = endFrame;
				// The rendering function only runs if the "currentFrame" value hasn't reached the "endFrame" one
				if( currentFrame !== _endFrame )
				{	
					/*
						Calculates the 10% of the distance between the "currentFrame" and the "endFrame".
						By adding only 10% we get a nice smooth and eased animation.
						If the distance is a positive number, we have to ceil the value, if its a negative number, we have to floor it to make sure
						that the "currentFrame" value surely reaches the "endFrame" value and the rendering doesn't end up in an infinite loop.
					*/
					var frameEasing = _endFrame < currentFrame ? Math.floor( ( _endFrame - currentFrame ) * 0.1 ) : Math.ceil( ( _endFrame - currentFrame ) * 0.1 );
					// Increments / decrements the "currentFrame" value by the 10% of the frame distance
					q.currentFrame += frameEasing;
					// Sets the current image to be visible
					showCurrentFrame( q.currentFrame );
				} else {
					// If the rendering can stop, we stop and clear the ticker
					window.clearInterval( ticker );
					ticker = 0;
				}
			},

			/**
			* (void) Tracks the pointer X position changes and calculates the "endFrame" for the image slider frame animation.
			* This function only runs if the application is ready and the user really is dragging the pointer; this way we can avoid unnecessary calculations and CPU usage.
			*/
			trackPointer = function( e ) {
				if( dragging ) {
					// Stores the last x position of the pointer
					pointerEndPosX = getPageX( e );
					// Checks if there is enough time past between this and the last time period of tracking
					if( monitorStartTime < new Date().getTime() - monitorInt ) {
						// Calculates the distance between the pointer starting and ending position during the last tracking time period
						pointerDistance = pointerEndPosX - pointerStartPosX;
						// Calculates the endFrame using the distance between the pointer X starting and ending positions and the "speedMultiplier" values
						endFrame = q.currentFrame + Math.ceil((len) * speedMultiplier * ( pointerDistance / container_width ));
						// Updates the image slider frame animation
						refresh();
						// restarts counting the pointer tracking period
						monitorStartTime = new Date().getTime();
						// Stores the the pointer X position as the starting position (because we started a new tracking period)
						pointerStartPosX = getPageX( e );
					}
				}
			},
			
			/**
			* (void) Displays the current frame
			*/
			showCurrentFrame = function( i ) {
				img_el.src = img_array[ getNormalizedCurrentFrame( i ) ];
			},
			/**
			* (int) Returns the "currentFrame" value translated to a value inside the range of 0 and "totalFrames"
			*/
			getNormalizedCurrentFrame = function( i ) {
				var c = -Math.ceil( i % len );
				if( c < 0 )
					c += ( len - 1 );
				return c;
			},
			
			// getting coordinates
			getPageX = function( e ) {
				return e.pageX;
			},
			getPageY = function( e ) {
				return e.pageY;
			},
			// Event functions
			eventDownFunc = function( e ) {
				e.preventDefault ? e.preventDefault() : ( e.returnValue = false );
				pointerStartPosX = getPageX( e );

				if( !dragging )
				{
					window.clearInterval( ticker );
					ticker = 0;
				}
					
				dragging = true;
			},
			eventMoveFunc = function( e ) {
				e.preventDefault ? e.preventDefault() : ( e.returnValue = false );
				
				// handle zoom
				if( e.touches && e.touches.length > 1 )
				{
					if( !isPinch )
						pinchPointX = Math.abs( e.touches[ 0 ].pageX - e.touches[ 1 ].pageX ),
						pinchPointY = Math.abs( e.touches[ 0 ].pageY - e.touches[ 1 ].pageY );
					else
						scaleVal = origVal + 2.5 * ( ( Math.abs( e.touches[ 0 ].pageX - e.touches[ 1 ].pageX ) - pinchPointX ) 
							+ ( Math.abs( e.touches[ 0 ].pageY - e.touches[ 1 ].pageY ) - pinchPointY ) ) / 2 / container_width,
						scaleVal = scaleVal > max_zoom ? max_zoom : scaleVal < min_zoom ? min_zoom : scaleVal,
						img_elStyle[ _transform ] = "scale(" + scaleVal + ")";

					isPinch = true;
				}
				else
					trackPointer( e );
			},
			eventUpFunc = function( e ) {
				e.preventDefault ? e.preventDefault() : ( e.returnValue = false );
				dragging = false;
				
				//zoom reset
				if( e.touches && e.touches.length < 2 )
					origVal = scaleVal,
					isPinch = false;
			};
			
		// appending the img element to the user-specified container element
		container.appendChild( img_el );
		
		while( len-- )
			loadImage( img_array[ len ], updateloadedImages );
		len = endFrame = this.length;
		
		//listeners - first a check to see if we are on a mobile device
		if( 'ontouchstart' in window )
			eventDown = 'touchstart',
			eventMove = 'touchmove',
			eventUp = 'touchend',
			getPageX = function( e ) {
				if( e.touches[ 0 ] )
					return e.touches[ 0 ].pageX;
			},
			getPageY = function( e ) {
				if( e.touches[ 0 ] )
					return e.touches[ 0 ].pageY;
			};

		if( document.addEventListener )
			container.addEventListener( eventDown, eventDownFunc, false ),
			container.addEventListener( eventMove, eventMoveFunc, false ),
			container.addEventListener( eventUp, eventUpFunc, false );
		else	// < IE9 fix
			container.attachEvent( 'on' + eventDown, eventDownFunc ),
			container.attachEvent( 'on' + eventMove, eventMoveFunc ),
			container.attachEvent( 'on' + eventUp, eventUpFunc ),
			getPageX = function( e ) {
				return e.clientX;
			},
			getPageY = function( e ) {
				return e.clientY;
			};

		return false;
	},
	// prototype cached
	proto = _swipeSequence.prototype,
	/**
	 *	(void) loads the image (in the background)
	 */
	loadImage = function( path, callback ) {
		var img = document.createElement('img');
		img.src = path;
		
		img.onload = callback;
		return false;
	},
	/**
	 *	@return String The Transform property supported by the browser
	 **/
	findTransform = function( el ) {
		if( 'webkitTransform' in el )
			return 'webkitTransform';
		else if( 'mozTransform' in el )
			return 'mozTransform';
		else if( 'OTransform' in el )
			return 'OTransform';
		else if( 'MSTransform' in el )
			return 'MSTransform';
		
		return 'transform';
	};
	
	/**
	 * (void) Goes to frame 0
	 */
	proto.reset = function() {
		this.goTo(0);
	},
	/**
	 *	(void) Goes to the specified frame
	 *
	 *	@param	int	specified frame
	 **/
	proto.goTo = function( i ) {
		this.currentFrame = i;
		this.refresh();
	},
	/**
	 *	Wrapper around new _swipeSequence
	 **/
	parent.SwipeSequence = function( container, img_array, zoom_controls ) {
		 typeof container === "string"
		 &&	( container = document.getElementById( container ) );
		 
		 var config;
		 ( img_array.length > 0 ) && ( config = true );
		 
		return new _swipeSequence( container, img_array, zoom_controls, config );
	};

	//cleaning up
	proto = null;
	return false;
})( window );