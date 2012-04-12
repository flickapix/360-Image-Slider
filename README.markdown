# 360 Image Slider Standalone

DEMO : http://isqueel.com/test/360/

I stumbled upon Robert's http://www.netmagazine.com/tutorials/build-360-view-image-slider-javascript Slider, and thought it was a 
genuinely great idea. Only problem being that it heavily required jquery, and a specific structure of initialization.

Also the li img li, structure seemed a bit odd to me, so I decided to re do it, by keeping the core functions intact 
(see render() and the ticker) but changing the "slideshow" logic (now it uses only one image tag with a dynamic src element) and making it 
framework agnostic.

Pinch Zoom support added for mobile devices.
Support for multiple instances added as well.

Works on,
IE7, IE8, IE9, FF, Chrome, Opera,
mobile safari, android browser, firefox mobile, opera mobile


Many Thanks to the original Author (see below)

#ORIGINAL README

# 360 Image Slider

The 360 Image Slider was a experimental project, which I worked on when I was writing a javascript tutorial for .net Magazine (issue #224).
Luckily the tutorial was pretty well received, so I decided to make it open source, and create a git repository to allow others to collaborate and help to make it awesome :)

## Credits

The 360 Image Slider was originally created by Róbert Pataki for a JavaScript tutorial for .net Magazine (issue #224).

## License

**(The MIT License)**

Copyright (c) 2012 Róbert Pataki heartcode@robertpataki.com;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.