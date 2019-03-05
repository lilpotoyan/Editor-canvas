let currentImgTag = '';
let currentImgObject = {};

let currentWidth;
let currentHeight;
let currentXTopLeft;
let currentYTopLeft;
var modal = document.getElementById('myModal');
var cropbtn = document.getElementById("cropbutton");
var zoombutton = document.getElementById('plus');
var minus = document.getElementById('minus');
var span = document.getElementsByClassName("close")[0];

function createImageTag(imgObject) {
    let allimagesdiv = document.getElementById('allimagesdiv');
    let image = document.createElement("img");
    allimagesdiv.appendChild(image);
    let crossorigin = document.createAttribute("crossorigin");
    crossorigin.value = "anonymous";
    image.setAttributeNode(crossorigin);
    let srcattribute = document.createAttribute("src");
    srcattribute.value = imgObject.url;
    image.setAttributeNode(srcattribute);
    let imgId = document.createAttribute("id");
    imgId.value = imgObject.id;
    image.setAttributeNode(imgId);
    image.addEventListener('click', () => { setImageToCanvas(imgObject, image, "myCanvas", '600', 0, 0, false, false); setCurrentImgData(imgObject, image) });
}

function setCurrentImgData(obj, tag) {
    currentImgObject = obj;
    currentImgTag = tag;
}

function setImageToCanvas(imgObject, imageTag, canvasId, canvasParam, x, y, sWidth, sHeight) {
    let originalWidth = imgObject.width
    let originalHeight = imgObject.height;

    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext("2d");
    canvas.width = canvasParam;
    canvas.height = canvasParam;
    let newHeight
    let newWidth

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (originalWidth > originalHeight && sWidth == false && sHeight == false) {
        newHeight = (canvas.width / originalWidth) * originalHeight
        ctx.drawImage(imageTag, x, y, originalWidth, originalHeight, 0, 0, canvas.width, newHeight)
    }
    else if (originalHeight >= originalWidth && sWidth == false && sHeight == false) {
        newWidth = (canvas.height / originalHeight) * originalWidth
        ctx.drawImage(imageTag, x, y, originalWidth, originalHeight, 0, 0, newWidth, canvas.height)
    }

    if (sWidth !== false && sHeight !== false && sWidth > sHeight) {
        let diff = canvas.width / originalWidth
        ctx.drawImage(imageTag, x / diff, y / diff, sWidth / diff, sHeight / diff, 0, 0, canvas.width, (canvas.width / sWidth) * sHeight)
    } else if (sWidth !== false && sHeight !== false && sHeight > sWidth) {
        let diff = canvas.height / originalHeight;
        ctx.drawImage(imageTag, x / diff, y / diff, sWidth / diff, sHeight / diff, 0, 0, (canvas.height / sHeight) * sWidth, canvas.height)
    }
}


fetch('https://api.picsart.com/photos/search.json?tag=pa_infinitescroll', {
    method: 'get'
}).then(function (data) {
    return data.json()
        .then(data => {
            let response = data.response;
            console.log(response);
            for (let i = 0; i < response.length; i++) {
                createImageTag(response[i]);
            }
        })
}).catch(function (err) {
    console.log(err);
});

cropbtn.addEventListener('click', function () {
    //debugger
    modal.style.display = "block";
    let cropimgwidth = document.getElementById('cropimgwidth');
    cropimgwidth.innerHTML = "Width: " + currentWidth + " px";
    let cropimgheight = document.getElementById('cropimgheight');
    cropimgheight.innerHTML = "Height: " + currentHeight + " px";

    setImageToCanvas(currentImgObject, currentImgTag, "inerModalCanvas", '500', currentXTopLeft, currentYTopLeft, currentWidth, currentHeight)

});


zoombutton.addEventListener('click', function () {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(1.1, 1.1);
    ctx.drawImage(currentImgTag, 0, 0, currentImgObject.width, currentImgObject.height, 0, 0, canvas.width, canvas.height);
});


minus.addEventListener('click', function () {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(0.9, 0.9);
    ctx.drawImage(currentImgTag, 0, 0, currentImgObject.width, currentImgObject.height, 0, 0, canvas.width, canvas.height)
});


let downloadbtn = document.getElementById('download')
downloadbtn.addEventListener('click', function () {
    downloadbtn.download = "image.png";
    let dataURL = document.getElementById('inerModalCanvas').toDataURL('image/png')
    downloadbtn.href = dataURL;
})


function makeResizableDiv(elem) {
    const element = document.querySelector(elem);
    const resizers = document.querySelectorAll(elem + ' .resizer')
    const minimum_size = 20;
    let original_width = 0;
    let original_height = 0;
    let original_x = 0;
    let original_y = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;
    let canvas = document.getElementById("myCanvas");
    let rect = canvas.getBoundingClientRect();
    let l = rect.left;
    let t = rect.top;
    let b = rect.bottom;
    let r = rect.right;
    //console.log("toooooop", t)

    for (let i = 0; i < resizers.length; i++) {
        const currentResizer = resizers[i];
        currentResizer.addEventListener('mousedown', function (e) {
            e.preventDefault()
            original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
            original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
            original_x = element.getBoundingClientRect().left;
            original_y = element.getBoundingClientRect().top;
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize)
        })

        function resize(e) {
            if (currentResizer.classList.contains('bottom-right')) {
                const width = original_width + (e.pageX - original_mouse_x);
                const height = original_height + (e.pageY - original_mouse_y);
                if (e.pageX < r && e.pageY < b) {
                    if (width > minimum_size) {
                        element.style.width = width + 'px'
                    }
                    if (height > minimum_size) {
                        element.style.height = height + 'px'
                    }
                }
                currentWidth = width;
                currentHeight = height;
            }
            else if (currentResizer.classList.contains('bottom-left')) {
                const height = original_height + (e.pageY - original_mouse_y)
                const width = original_width - (e.pageX - original_mouse_x)
                if (height > minimum_size) {
                    element.style.height = height + 'px'
                }
                if (width > minimum_size) {
                    element.style.width = width + 'px'
                    element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
                }
                currentWidth = width;
                currentHeight = height;
            }
            else if (currentResizer.classList.contains('top-right')) {
                const width = original_width + (e.pageX - original_mouse_x)
                const height = original_height - (e.pageY - original_mouse_y)
                if (width > minimum_size) {
                    element.style.width = width + 'px'
                }
                if (height > minimum_size) {
                    element.style.height = height + 'px'
                    element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
                }
                currentWidth = width;
                currentHeight = height;
            }
            else {
                var width = original_width - (e.pageX - original_mouse_x)
                var height = original_height - (e.pageY - original_mouse_y)
                currentWidth = width;
                currentHeight = height;
                currentXTopLeft = e.pageX - l;
                currentYTopLeft = e.pageY - t;

                if (e.pageX > l && e.pageY > t) {
                    if (width > minimum_size) {
                        element.style.width = width + 'px'
                        element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
                    }
                    if (height > minimum_size) {
                        element.style.height = height + 'px'
                        element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
                    }
                }
            }
        }
        function stopResize() {
            window.removeEventListener('mousemove', resize)
        }
    }
}
makeResizableDiv('#resizable');

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}




