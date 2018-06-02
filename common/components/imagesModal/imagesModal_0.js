var imageShowStyle = {
    classPageInfo:'classPageInfo',
    classPre:'classPre',
    classNext:'classNext',
    classThumbnailImg:'classThumbnailImg',
    classCurrThumbnailImg:'classCurrThumbnailImg'
};
window.addEventListener('message',function (ev) {
    var d = ev.data;
    switch (d.msg){
        case "ready":
            ev.source.postMessage({msg:"ready"},"*");
            break;
        case "data":
            if(typeof d.data === 'object'){
                var ele= document.getElementById('imagesContainer');//图片大容器
                imageShowStyle.thumbnail = document.getElementById('thumbnail');//缩略图;
                imageShowStyle.rightClickMenu = document.getElementById('rightClickMenu');//右键菜单(可空);
                imagesShow(ele,d.data,imageShowStyle);
            }
            break;
    }
},false);
function imagesShow(ele, value,style) {
    if(!value)return;
    var val = value.srcs;
    var currIdx = value.currIdx||0;
    if(!val ||!val.length)return;
    style = style||{};
    ele.__currIndex = currIdx;
    var img = ele.__imageEle || ele.ownerDocument.createElement('img');
    img.ondragstart = function (ev) {
        return false;
    };
    img.src = val[ele.__currIndex];
    !ele.__imageEle && ele.appendChild(img);
    ele.__imageEle = img;
    if (!imagesShow.imageTransform) {
        imagesShow.imageTransform = new components.ImageTransform({
            targetElement: img,
            menuList: style.rightClickMenu||null,
            scaleDetail: 0.06,//单次缩放比(可空)
            initTop: 90
        });
    }
    if (val.length > 1) { //如果有多张图
        var pageInfo = ele.__pageInfo || ele.ownerDocument.createElement('div');
        pageInfo.innerHTML = "当前为第"+ (ele.__currIndex + 1) +"张,总共" + val.length + "张";
        pageInfo.className = style.classPageInfo;
        //左右箭头切换src
        var pre = ele.__pre || ele.ownerDocument.createElement('div');
        var left = ele.ownerDocument.createElement('div');
        left.innerHTML = '<';
        pre.appendChild(left);
        pre.className = style.classPre;
        pre.onclick = function (ev) {
            ele.__currIndex--;
            if (ele.__currIndex < 0) {
                ele.__currIndex = 0;
            } else {
                //加载上一张图
                jumpTo(ele.__currIndex);
            }
        };
        var next = ele.__next || ele.ownerDocument.createElement('div');
        var right = ele.ownerDocument.createElement('div');
        right.innerHTML = '>';
        next.appendChild(right);
        next.className = style.classNext;

        next.onclick = function (ev) {
            ele.__currIndex++;
            if (ele.__currIndex > val.length - 1) {
                ele.__currIndex = val.length - 1;
            } else {
                //加载下一张图
                jumpTo(ele.__currIndex);
            }
        };
        !ele.__pageInfo && ele.ownerDocument.body.appendChild(pageInfo);
        !ele.__pre && ele.ownerDocument.body.appendChild(pre);
        !ele.__next && ele.ownerDocument.body.appendChild(next);
        ele.__pageInfo = pageInfo;
        ele.__pre = pre;
        ele.__next = next;
        //缩略图
        var thumbnail = imageShowStyle.thumbnail;
        for(var j=thumbnail.children.length-1;j>val.length-1;j--){
            thumbnail.removeChild(thumbnail.children[j]);
        }
        for(var c=thumbnail.children.length;c<val.length;c++){
            var thumbnailImg = document.createElement('img');
            thumbnail.appendChild(thumbnailImg);
        }
        for(var i = 0;i<thumbnail.children.length;i++){
            thumbnail.children[i].src = val[i];
            thumbnail.children[i].className = style.classThumbnailImg;
            thumbnail.children[i].index = i;
            thumbnail.children[i].onclick = function () {
                jumpTo(this.index);
            }
        }
        thumbnail.children[ele.__currIndex].className = style.classCurrThumbnailImg;
        thumbnail.__currSelected = thumbnail.children[ele.__currIndex];
        function jumpTo(idx) {
            ele.__currIndex = idx;
            pageInfo.innerHTML = "当前为第"+ (ele.__currIndex + 1) +"张,总共" + val.length + "张";
            img.src = val[ele.__currIndex];
            if(thumbnail.__currSelected)thumbnail.__currSelected.className = style.classThumbnailImg;
            thumbnail.children[ele.__currIndex].className = style.classCurrThumbnailImg;
            thumbnail.__currSelected = thumbnail.children[ele.__currIndex];
        }
    }
};