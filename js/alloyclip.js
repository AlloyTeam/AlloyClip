/**
 * alloyClip
 * @author dorsywang
 * clip pic based on alloyimage
 */
;(function(){
    var Utils = window.AlloyClipTools.Utils;
    var createEl = function(type, parentNode, className){
        if(! className || typeof className == "string"){
            var el = document.createElement(type);
            parentNode && (parentNode.appendChild(el));
            className && (el.className = className);
            return el;
        }else{
            var el = document.createElement(type);

            for(var i in parentNode){
                if(i != "className" && i !="id") el.setAttribute(i, parentNode[i]);
                else el[i] = parentNode[i];
            }

            className && className.appendChild(el);

            return el;
        }
    };

    // isFixed  固定选取框 缩放图片
    var singleAC = function(el, _w, _h, isFixed){
        _w = _w || 80;
        _h = _h || 80;

        this.defaultWidth = _w;
        this.defaultHeight = _h;

        var _this = this;
        this.el = el;

        this.setting = {};
        this.status = {};
        this.eventPool = {};

        this.setting.isFixed = isFixed;

        //图像边界信息
        this.imgBoundInfo = {};
        //裁剪边界信息
        this.clipInfo = {};

        var frament = document.createDocumentFragment();
        var wrapperEl = createEl("div", frament, "AlloyClipWapper");
        var leftWrapper = createEl("div", wrapperEl, "AlloyClipLeftWrapper");
        var right = createEl("div", wrapperEl, "AlloyClipRight");
        var left = createEl("div", leftWrapper, "AlloyClipLeft");
        var optionWrapper = createEl("div", leftWrapper, "AlloyClipOptionWrapper");

        this.left = left;
        this.right = right;
        this.optionWrapper = optionWrapper;

        //用于居中定位
        var buttonTop = createEl("div", left, "AlloyClipButtonTop");
        var button = createEl("div", left, "AlloyClipButton");
        var canvasWrapper = createEl("div", left, "AlloyCanvasWrapper");
        var buttonBottom = createEl("div", left, "AlloyClipButtonTop");

        var mask = createEl("div", left, "AlloyClipMask");

        canvasWrapper.id = "AlloyCanvasWrapper";
        canvasWrapper.style.display = "none";

        //加载一个隐藏的input
        var inputFile = createEl("input", document.body, "AlloyClipInputFile");
        inputFile.style.display = "none";
        inputFile.type = "file";

        //根据要求的图片大小设置右边预览区
        var rightTitle = createEl("div", right, "AlloyClipRightTitle");
        var rightContent = createEl("div", right, "AlloyClipRightContent");
        var rightInfo = createEl("div", right, "AlloyClipRightInfo");
        var switchPic = createEl("div", right, "AlloyClipSwitchPic");
        var confirmButton = createEl("div", right, "AlloyClipConfim");

        confirmButton.onclick = function(){
            var eventQueue = _this.eventPool['ok'] || [];
            var data = _this.psedAIPic.save();

            for(var i = 0; i < eventQueue.length; i ++){
                eventQueue[i](data, _this.psedAIPic);
            }
        };

        rightTitle.innerHTML = "预览";
        rightInfo.innerHTML = _w + "×" + _h;
        confirmButton.innerHTML = "确定";
        switchPic.innerHTML = "切换图片";

        rightInfo.style.display = "none";

        this.rightInfo = rightInfo;
        this.rightContent = rightContent;
        this.switchPic = switchPic;
        right.style.width = _w + 40 + "px";


        el.appendChild(frament);

        //right右边el

        this.hideUploadBox = function(){
            button.style.display = "none";
        };

        this.showCanvas = function(el){
            canvasWrapper.innerHTML = "";
            canvasWrapper.style.display = "";
            canvasWrapper.appendChild(el);
        };

        this.showMask = function(){
            mask.style.display = "block";
        };

        this.hideMask = function(){
            mask.style.display = "none";
        };

        this.canvasWrapper = canvasWrapper;

        button.onclick = function(){
            inputFile.click();
        };

        switchPic.onclick = function(){
            inputFile.click();
        };

        //上传文件后
        inputFile.onchange = function(e){
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(){
                var tempImg = new Image();
                tempImg.onload = function(){
                    _this.imgEl = this;
                    _this.originAILayer = $AI(this);

                    _this.hideUploadBox();
                    _this.showCanvas(this);
                    _this.showMask();

                    _this.alterImgPositon(this);
                    _this.getRect().init();
                    _this.showClipPic();

                    //show confirm
                    confirmButton.style.display = "block";
                    switchPic.style.display = "block";

                    if(isFixed){
                        _this.fixedInit();
                    }

                    _this.getOption();
                };

                tempImg.src = this.result;
            };
        };

        //选取框元素
        this.rect = null;


        //生成随机ID
        this.uid = 'AlloyClip_' + ~~ (Math.random() * 1E6);

    };

    singleAC.prototype = {
        constructor: singleAC,
        fileHandler: function(imgFile){
            //隐藏上传按钮
            this.hideUploadBox();
            //显示CanvasWrapper
            this.showCanvas();
        },

        //对于固定的情形做初始化
        fixedInit: function(){
            this.imgEl.style.position = "absolute";
            this.imgEl.style.left = this.imgBoundInfo.offsetLeft + "px";
            this.imgEl.style.top = this.imgBoundInfo.offsetTop + "px";
            this.bindFixedEvent();
        },

        //固定选取框事件监听
        bindFixedEvent: function(){
            var _this = this;
            var clickFlag = 0;
            var currLeft, currTop, currPageX, currPageY;
            this.left.onmousedown = function(e){
                currLeft = parseInt(_this.imgEl.style.left);
                currTop = parseInt(_this.imgEl.style.top);

                currPageX = e.pageX;
                currPageY = e.pageY;

                clickFlag = 1;
                e.preventDefault();
            };

            //监听mousemove的动作
            Utils.addEvent(window, this.left, "mousemove", function(e){
                var dx, dy;
                if(clickFlag){
                    dx = e.pageX - currPageX;
                    dy = e.pageY - currPageY;

                    var left = currLeft + dx;
                    var top = currTop + dy;

                    _this.imgEl.style.left = ~~ left + "px";
                    _this.imgEl.style.top = ~~ top + "px";

                    _this.getRect().setBackgroundPosition();

                    _this.showClipPic();

                    e.preventDefault();
                }
            });

            window.addEventListener("mouseup", function(e){
                clickFlag = 0;
            });

            //放大的动作
            var scalePic = function(origin, scaleSize){
                var w = _this.imgEl.offsetWidth;
                var h = _this.imgEl.offsetHeight;

                var oX = origin[0];
                var oY = origin[1];

                //计算origin变换后的坐标
                var originX = oX * scaleSize;
                var originY = oY * scaleSize;

                var dx = originX - oX;
                var dy = originY - oY;

                var left = parseInt(_this.imgEl.style.left) - dx;
                var top = parseInt(_this.imgEl.style.top) - dy;

                var width = w * scaleSize;
                var height = h * scaleSize;

                _this.imgEl.style.width = ~~ width + "px";
                _this.imgEl.style.height = ~~ height + "px";
                _this.imgEl.style.left = ~~ left + "px";
                _this.imgEl.style.top = ~~ top + "px";

                _this.imgBoundInfo.width = width;
                _this.imgBoundInfo.height = height;

                _this.getRect().init();

                _this.showClipPic();
            };

            this.left.addEventListener("mousewheel", function(e){
                if(e.target.className && e.target.className == "AlloyClipRect"){
                    var origin = [
                        e.offsetX + e.target.offsetLeft - _this.imgEl.offsetLeft,
                        e.offsetY + e.target.offsetTop - _this.imgEl.offsetTop
                    ];
                }else{
                    var origin = [
                        e.offsetX - _this.imgEl.offsetLeft,
                        e.offsetY - _this.imgEl.offsetTop
                    ];
                }

                if(e.wheelDeltaY < 0){
                    scalePic(origin, 0.8);
                }else{
                    scalePic(origin, 1.2);
                }
            });
        },

        //调整img元素位置
        alterImgPositon: function(imgEl){
            console.log(this.left.offsetHeight + "OK");
            var imgWidth = imgEl.width;
            var imgHeight = imgEl.height;

            imgEl.style.width = "0px";
            imgEl.style.height = "0px";

            var wrapperWidth = imgEl.parentNode.parentNode.offsetWidth;
            var wrapperHeight = imgEl.parentNode.parentNode.offsetHeight;

            console.log(wrapperHeight + " L");

            var imgRatio = imgWidth / imgHeight;

            console.log(this.canvasWrapper.offsetHeight);
            console.log(this.left.offsetHeight);

            //图像的边界信息
            var offsetLeft, offsetTop, width, height;

            if(wrapperWidth / wrapperHeight > imgRatio){
                width = wrapperHeight * imgRatio; 
                height = wrapperHeight;
                imgEl.style.width = ~~ width + "px";
                imgEl.style.height = "auto";

                offsetLeft = ~~ ((wrapperWidth - width) / 2);
                offsetTop = 0;
            }else{
                imgEl.style.height = "auto";
                imgEl.style.width = "100%";

                height = wrapperWidth / imgRatio;
                width = wrapperWidth;

                offsetLeft = 0;
                offsetTop = ~~ ((wrapperHeight - height) / 2);
            }

            //imgEl.parentNode.style.maxHeight = ~~ height + "px";

            this.imgBoundInfo.offsetLeft = imgEl.offsetLeft;
            this.imgBoundInfo.offsetTop = imgEl.offsetTop;
            this.imgBoundInfo.width = width; 
            this.imgBoundInfo.height = height; 
        },

        //创建option
        getOption: function(){
            var _this = this;

            //初始化当前的操作为alteration
            return this.optionEl || function(){
                _this.status.currOper = "alterationHandler";
                var el = {};

                var barEl = createEl("div", _this.optionWrapper, "AlloyClipOptionBar");
                var optionPreviewWrapper = createEl("div", _this.optionWrapper, "AlloyClipOptionPW");

                var navItemWrapper = createEl("ul", barEl, "AlloyClipNav");

                navItemWrapper.innerHTML = "<li id='alteration'>调节</li><li id='filter'>滤镜</li><li id='border'>边框</li>";

                var controller = createEl("div", barEl, "AlloyClipOptionController");

                if(_this.isFixed){
                    var scale = createEl("span", controller, "AlloyClipCItem");
                    var minify = createEl("span", controller, "AlloyClipCItem");
                    scale.innerHTML = "+";
                    minify.innerHTML = "-";
                }

                var rotate = createEl("span", controller, "AlloyClipCItem");
                rotate.innerHTML = "旋转";

                rotate.style.fontSize = "14px";
                rotate.style.verticalAlign = "top";
                rotate.style.fontFamily = "Microsoft Yahei";

                //处理旋转后操作
                rotate.onclick = function(){
                    //旋转图片  暂时使用AlloyImage旋转方法
                    /*
                    _this.imgEl.style.webkitTransform = "rotate(90deg)";
                    _this.imgEl.style.transform = "rotate(90deg)";
                    */
                    _this.originAILayer.rotate(90).replace(_this.imgEl);
                    _this.alterImgPositon(_this.imgEl);
                    _this.getRect().init();
                    _this.showClipPic();

                    //更新图片边界信息
                };

                //滤镜处理函数
                var filterHandler = function(){
                    if(_this.status.currOper != "filterHandler"){
                        _this.psedAIPic && (_this.currLayer = _this.psedAIPic);
                    }

                    _this.status.currOper = "filterHandler";
                    //清空原来所有的dom
                    optionPreviewWrapper.innerHTML = "";
                    var ul = createEl("ul", optionPreviewWrapper, "AlloyClipFilter");
                    var effects = ["sketch", "lomo", "soften", "softenFace", "purpleStyle", "vintage", "warmAutumn", "rough", "softEnhancement"];

                    //缩略图默认大小
                    var preveiwHeight = optionPreviewWrapper.offsetHeight;
                    var miniHeight = preveiwHeight * 0.7;

                    ul.style.paddingTop = ~~(preveiwHeight * 0.15) + "px";

                    //得到一个小的缩略图
                    var cHeight = _this.currLayer.width;
                    var cWidth = _this.currLayer.height;

                    var scaleSize = miniHeight / cHeight; 

                    var miniLayer = _this.currLayer.clone().scale(scaleSize);

                    for(var i = 0; i < effects.length; i ++){
                        var effect = effects[i];
                        var effectItem = createEl("li", ul);
                        miniLayer.clone().ps(effect).show(effectItem);

                        //点击item时候的操作
                        effectItem.onclick = function(e){
                            return function(){
                                _this.psedAIPic = _this.currLayer.clone().ps(e).replaceChild(_this.rightContent);
                            };
                        }(effect);
                    }
                };

                //边框处理函数
                var borderHandler = function(){
                    if(_this.status.currOper != "borderHandler"){
                        _this.psedAIPic && (_this.currLayer = _this.psedAIPic);
                    }

                    _this.status.currOper = "borderHandler";
                    //清空原来所有的dom
                    optionPreviewWrapper.innerHTML = "";
                    var ul = createEl("ul", optionPreviewWrapper, "AlloyClipFilter AlloyClipBorder");
                    var effects = ["../border/border1.png", "../border/border2.png"];

                    //缩略图默认大小
                    var miniHeight = 50;

                    //得到一个小的缩略图
                    var cHeight = _this.currLayer.width;
                    var cWidth = _this.currLayer.height;

                    var scaleSize = miniHeight / cHeight; 

                    var miniLayer = _this.currLayer.clone().scaleTo(null, miniHeight);

                    for(var i = 0; i < effects.length; i ++){
                        var effect = effects[i];
                        var effectItem = createEl("li", ul);

                        var borderImg = new Image();
                        borderImg.onload = function(effectItem){
                            return function(){
                                var borderLayer = $AI(this);
                                borderLayer.scaleTo(miniLayer.width, miniLayer.height);
                                miniLayer.clone().add(borderLayer.clone()).show(effectItem);
                            };
                        }(effectItem);
                        borderImg.src = effect;

                        //点击item时候的操作
                        effectItem.onclick = function(effect){
                            return function(){
                                var borderImg = new Image();
                                borderImg.onload = function(effectItem){
                                    return function(){
                                        var borderLayer = $AI(this);
                                        borderLayer.scaleTo(_this.currLayer.width, _this.currLayer.height);
                                        _this.psedAIPic = _this.currLayer.clone().add(borderLayer.clone()).replaceChild(_this.rightContent);
                                    };
                                }(effectItem);
                                borderImg.src = effect;
                            };
                        }(effect);
                    }
                };

                var alterationHandler = function(e){
                    if(_this.status.currOper != "alterationHandler"){
                        _this.psedAIPic && (_this.currLayer = _this.psedAIPic);
                    }

                    _this.status.currOper = "alterationHandler";

                    optionPreviewWrapper.innerHTML = "";
                    var ul = createEl("ul", optionPreviewWrapper, "AlloyClipFilter AlloyClipAlter");

                    var callback = function(){};
                    var SBar = _this.getScrollBar(160, 0.5, "色　相", "apH", callback);
                    var HBar = _this.getScrollBar(160, 0.5, "饱和度", "apS", callback);
                    var IBar = _this.getScrollBar(160, 0.5, "亮　度", "apI", callback);
                    var DBar = _this.getScrollBar(160, 0.5, "对比度", "apD", callback);
                    ul.appendChild(SBar);
                    ul.appendChild(HBar);
                    ul.appendChild(IBar);
                    ul.appendChild(DBar);

                    _this.status.currOperation = "Alteration";
                    _this.status.toolBarValue = {
                        Alteration: [0.5, 0.5, 0.5, 0.5]
                    };
                };

                Utils.addEvent(navItemWrapper, "li", "click", function(e){
                    switch(this.id){
                        case 'filter': filterHandler(e);
                        break;

                        case 'border': borderHandler(e);
                        break;

                        case 'alteration': alterationHandler(e);
                        break;
                    }
                });

                _this.bindScrollBarEvent();

                barEl.appendChild(_this.switchPic);

                _this.optionEl = el;

                //el.filterHandler = filterHandler;
                //el.borderHandler = borderHandler;
                //el.alterationHandler = alterationHandler;

                el.doCurrOptionPro = function(){
                    switch(_this.status.currOper){
                        case "filterHandler" : filterHandler();
                        break;

                        case "borderHandler" : borderHandler();
                        break;

                        case "alterationHandler" : alterationHandler();
                        break;
                    }
                };

                return el;
            }();
        },

        getScrollBar: function(width, originPoint, name, id, changeCallback){
            var width = width || 200;
            var originPoint = originPoint || 0.5;
            var name = name || "";
            var uid = this.uid;

            var barEl = document.createElement("li");
            barEl.className = "apScrollBarWrapper";

            var apBarTitle = createEl("div", {className: "apBarTitle"}, barEl);

            var apBarContent = createEl("div", {className: "apBarContent"}, barEl);
            var apBarLineLeft = createEl("div", {className: "apBarLineLeft"}, apBarContent);
            var apBarScrollEl = createEl("div", {className: "apBarScrollEl", "data-uid": uid, id: id}, apBarContent);
            var apBarLineRight = createEl("div", {className: "apBarLineRight"}, apBarContent);

            var scrollElWidth = 30;

            apBarTitle.innerHTML = name;

            //设置位置
            apBarLineLeft.style.width = originPoint * width + "px";
            apBarLineRight.style.width = (1 - originPoint) * width + "px";
            apBarScrollEl.style.left = originPoint * width - scrollElWidth / 2 + "px";

            //P.event.bindScrollBarEvent(name, apBarLineLeft, apBarScrollEl, apBarLineRight, width, scrollElWidth, changeCallback);
            
            return barEl;
        },
                    //绑定scrollBarEvent
        bindScrollBarEvent: function(width){
            var _this = this;
            var scrollMouseDown = 0;

            var originX = 0, originY = 0, originLeft = 0; originTop = 0;

            var width = width || 160;
            var scrollElWidth = scrollElWidth || 30;
            var currPoint = 0.5;

            var scrollEl, leftEl, rightEl;

            var originImg;

            document.body.addEventListener("mousedown", function(e){
                var target = e.target;
                if(target.className == "apBarScrollEl"){
                    var uid = target.getAttribute('data-uid');

                    if(uid != _this.uid) return;
                    scrollMouseDown = 1;

                    scrollEl = target;

                    leftEl = scrollEl.parentNode.childNodes[0];
                    rightEl = scrollEl.parentNode.childNodes[2];
                    
                    originX = e.pageX;
                    originY = e.pageY;

                    originLeft = target.offsetLeft;
                    originTop = target.offsetTop;
                }

                e.preventDefault();
            }, false);

            document.body.addEventListener("mouseup", function(e){
                if(scrollMouseDown){
                    var id = scrollEl.id;
                    var currImg = _this.currLayer.clone();

                    //当前操作为色调的处理
                    if(_this.status.currOperation == "Alteration"){
                        if(id == "apH"){
                            _this.status.toolBarValue.Alteration[0] = currPoint;
                        }else if(id == "apS"){
                            _this.status.toolBarValue.Alteration[1] = currPoint;
                        }else if(id == "apI"){
                            _this.status.toolBarValue.Alteration[2] = currPoint;
                        }else if(id == "apD"){
                            _this.status.toolBarValue.Alteration[3] = currPoint;
                        }

                        scrollMouseDown = 0;

                        var toolBarValue = _this.status.toolBarValue.Alteration;
                        if(id == "apD"){
                            var D = toolBarValue[3];
                            D = (D - 0.5) * 100;

                            currImg.act("brightness", 0, D).replaceChild(_this.rightContent);
                        }else{
                            var H = toolBarValue[0];
                            var S = toolBarValue[1];
                            var I = toolBarValue[2];

                            //换算成正常的值
                            H = (H - 0.5) * 360;
                            S = (S - 0.5) * 100;
                            I = (I - 0.5) * 100;

                            //originImg = $AI(P.watchQueue[currImg]);
                            currImg.act("setHSI", H, S, I, 0).replaceChild(_this.rightContent);
                        }
                    }
                }

                scrollMouseDown = 0;
            }, false);


            document.body.addEventListener("mousemove", function(e){
                var targetEl = e.target;
                if(scrollMouseDown){
                    var x = e.pageX;
                    var y = e.pageY;

                    var dx = x - originX;
                    var dy = y - originY;

                    var left = originLeft + dx;
                    var top = originTop + dy;

                    currPoint = (left + scrollElWidth / 2) / width;
                    if(currPoint > 1 || currPoint < 0) return;

                    scrollEl.style.left = left + "px";
                    //scrollEl.style.top = top + "px";

                    //设置左右宽度
                    leftEl.style.width = width * currPoint + "px";
                    rightEl.style.width = width * (1 - currPoint) + "px";
                    
                    e.preventDefault();
                }

            }, false);
        },

        //创建选取框
        getRect: function(){
            var _this = this;
            return this.rect || function(){
                var el = createEl("div", _this.left, "AlloyClipRect");
                el.style.width = _this.defaultWidth + "px";
                el.style.height = _this.defaultHeight + "px";

                var bgImgWrapper = createEl("div", el, "AlloyBgImgWrapper");
                var bgImg = createEl("img", bgImgWrapper, "AlloyBgImg");

                //居中框
                var centerRect = function(){
                    el.style.width = _this.defaultWidth + "px";
                    el.style.height = _this.defaultHeight + "px";
                    var parentWidth = _this.left.offsetWidth;
                    var parentHeight = _this.left.offsetHeight;
                    var elLeft = ~~ ((parentWidth - _this.defaultWidth) / 2) + "px";
                    var elTop = ~~ ((parentHeight - _this.defaultHeight) / 2) + "px";
                    el.style.left = elLeft;
                    el.style.top = elTop;
                };

                var currPageX, currPageY;
                var currWidth, currHeight;
                var currLeft, currTop;

                var rectWidth = el.offsetWidth;
                var rectHeight = el.offsetHeight;
                var rectRatio = rectWidth / rectHeight;

                var currControlDotI;

                //先四个控制点
                var controlDot = [
                    {
                        position: "top left",
                        left: "0px",
                        top: "0px"
                    },

                    {
                        position: "top right",
                        right: "0px",
                        top: "0px"
                    },

                    {
                        position: "bottom left",
                        bottom: "0px",
                        left: "0px"
                    },

                    {
                        position: "bottom right",
                        bottom: "0px",
                        right: "0px"
                    }
                ];

                var rectClickFlag = 0;
                var controlClickFlag = 0;

                //设置rect的背景position
                var setBackgroundPosition = function(){

                    var imgOffsetLeft = _this.imgEl.offsetLeft;
                    var imgOffsetTop = _this.imgEl.offsetTop;

                    var left = ~~ (el.offsetLeft - imgOffsetLeft) + 2;
                    var top = ~~ (el.offsetTop - imgOffsetTop) + 2;

                    bgImg.style.left = - left + "px";
                    bgImg.style.top = - top + "px";

                    _this.clipInfo.left = left;
                    _this.clipInfo.top = top;
                    _this.clipInfo.width = el.offsetWidth;
                    _this.clipInfo.height = el.offsetHeight;
                };

                //检查是否到边界了
                var checkBound = function(left, top, w, h){
                    if(left != undefined){
                        _left = left;
                    }else{
                        _left = currLeft;
                    }

                    if(top != undefined){
                        _top = top;
                    }else{
                        _top = currTop;
                    }

                    var _w = w || currWidth;
                    var _h = h || currHeight;

                    //边界
                    var maxX = ~~ (_this.imgBoundInfo.offsetLeft + _this.imgBoundInfo.width);
                    var maxY = ~~ ( _this.imgBoundInfo.offsetTop + _this.imgBoundInfo.height);
                    //检查中心点
                    //四个控制点
                    if(w){
                        if((left != undefined) & (top != undefined)){
                            //固定点为右下角
                            var fixX = currLeft + currWidth;
                            var fixY = currTop + currHeight;

                            //先检查上边界是不是越界
                            if(_top < _this.imgBoundInfo.offsetTop){
                                //上边界越界把上边界置为top
                                var resetTop = _this.imgBoundInfo.offsetTop;

                                //此时高度为top到fixY的距离
                                var resetHeight = fixY - _this.imgBoundInfo.offsetTop;

                                //计算此时的宽度
                                var resetWidth = resetHeight * rectRatio;

                                //计算此时的left
                                var resetLeft = fixX - resetWidth;

                                //检查左边界是不是越界
                                if(resetLeft < _this.imgBoundInfo.offsetLeft){

                                    //越界了使用左边界缩放
                                    resetWidth = fixX - _this.imgBoundInfo.offsetLeft;
                                    resetHeight = resetWidth / rectRatio;
                                    resetTop = fixY - resetHeight;
                                    resetLeft = fixX - resetWidth;
                                }

                                el.style.top = ~~ resetTop + "px";
                                el.style.left = ~~ resetLeft + "px";
                                el.style.width = ~~ resetWidth + "px";
                                el.style.height = ~~ resetHeight + "px";
                                return;
                            }

                            //检查左边界是不是越界
                            if(fixX - _w < _this.imgBoundInfo.offsetLeft){
                                //越界宽度为
                                var resetWidth = fixX - _this.imgBoundInfo.offsetLeft;
                                var resetHeight = resetWidth / rectRatio;

                                //计算此时top值
                                var resetTop = fixY - resetHeight;
                                var resetLeft = fixX - resetWidth;

                                //检查上边边界是不是越界
                                if(resetTop < _this.imgBoundInfo.offsetHeight){
                                    //上边界越界使用上边界绽放
                                    resetTop = _this.imgBoundInfo.offsetHeight;
                                    resetHeight = fixY - resetTop;
                                    resetWidth = resetHeight * rectRatio;
                                    resetLeft = fixX - resetWidth;
                                }

                                el.style.top = ~~ resetTop + "px";
                                el.style.left = ~~ resetLeft + "px";
                                el.style.width = ~~ resetWidth + "px";
                                el.style.height = ~~ resetHeight + "px";

                                return;
                            }

                        }else if(left != undefined){
                            var fixX = currLeft + currWidth;
                            var fixY = currTop;

                            if(_top + _h > maxY){
                                var resetHeight = maxY - _top;
                                var resetWidth = resetHeight * rectRatio;
                                var resetLeft = fixX - resetWidth;

                                if(resetLeft < _this.imgBoundInfo.offsetLeft){
                                    resetLeft = _this.imgBoundInfo.offsetLeft;
                                    resetWidth = fixX - resetLeft;
                                    resetHeight = resetWidth / rectRatio;
                                }

                                el.style.left = ~~ resetLeft + "px";
                                el.style.width = ~~ resetWidth + "px";
                                el.style.height = ~~ resetHeight + "px";

                                return;
                            }

                            if(_left < _this.imgBoundInfo.offsetLeft){
                                var resetLeft = _this.imgBoundInfo.offsetLeft;
                                var resetWidth = fixX - _this.imgBoundInfo.offsetLeft;
                                var resetHeight = resetWidth / rectRatio;

                                if(_top + resetHeight > maxY){
                                    resetHeight = maxY - _top;
                                    resetWidth = resetHeight * rectRatio;
                                }

                                el.style.left = ~~ resetLeft + "px";
                                el.style.width = ~~ resetWidth + "px";
                                el.style.height = ~~ resetHeight + "px";
                            }
                            
                        //右上控制点
                        }else if(top != undefined){
                            //固定点为左下角
                            var fixX = currLeft;
                            var fixY = currTop + currHeight;

                            //先检查上边界是不是越界
                            if(_top < _this.imgBoundInfo.offsetTop){
                                //上边界越界把上边界置为top
                                var resetTop = _this.imgBoundInfo.offsetTop;

                                //此时高度为top到fixY的距离
                                var resetHeight = fixY - _this.imgBoundInfo.offsetTop;

                                //计算此时的宽度
                                var resetWidth = resetHeight * rectRatio;

                                //检查右边界是不是越界
                                if(_left + resetWidth > maxX){

                                    //越界了使用右边界缩放
                                    resetWidth = maxX - _left;
                                    resetHeight = resetWidth / rectRatio;
                                    resetTop = fixY - resetHeight;
                                }

                                el.style.top = ~~ resetTop + "px";
                                el.style.width = ~~ resetWidth + "px";
                                el.style.height = ~~ resetHeight + "px";
                                return;
                            }

                            //检查右边界是不是越界
                            if(fixX + _w > maxX){
                                //越界宽度为
                                var resetWidth = maxX - fixX;
                                var resetHeight = resetWidth / rectRatio;

                                //计算此时top值
                                var resetTop = fixY - resetHeight;

                                //检查上边边界是不是越界
                                if(resetTop < _this.imgBoundInfo.offsetHeight){
                                    //上边界越界使用上边界绽放
                                    resetTop = _this.imgBoundInfo.offsetHeight;
                                    resetHeight = fixY - resetTop;
                                    resetWidth = resetHeight * rectRatio;
                                }

                                el.style.top = ~~ resetTop + "px";
                                el.style.width = ~~ resetWidth + "px";
                                el.style.height = ~~ resetHeight + "px";

                                return;
                            }

                        }else{
                            if(_left + _w > maxX){
                                var resetWidth = maxX - _left;
                                var resetHeight = resetWidth / rectRatio;

                                if(_top + resetHeight > maxY){
                                    resetHeight = maxY - _top;
                                    resetWidth = resetHeight * rectRatio;
                                }

                                el.style.width = ~~ resetWidth + "px";
                                el.style.height = ~~ resetHeight + "px";
                            }else if(_top + _h > maxY){

                                var resetHeight = maxY - _top;
                                var resetWidth = resetHeight * rectRatio;

                                if(_left + resetWidth > maxX){
                                    resetWidth = maxX - _left;
                                    resetHeight = resetWidth / rectRatio;
                                }

                                el.style.width = ~~ resetWidth + "px";
                                el.style.height = ~~ resetHeight + "px";
                            
                            }
                        }
                    }else{
                        //检查左边界
                        if(_left < _this.imgBoundInfo.offsetLeft){
                            el.style.left = ~~ _this.imgBoundInfo.offsetLeft + "px";
                        }

                        if(_top < _this.imgBoundInfo.offsetTop){
                            el.style.top = ~~ _this.imgBoundInfo.offsetTop + "px";
                        }

                        if(_left + _w > maxX){
                            el.style.left = ~~ (maxX - _w) + "px";
                        }

                        if(_top + _h > maxY){
                            el.style.top = ~~ (maxY - _h) + "px";
                        }
                    }

                };

                var initBackground = function(){
                    bgImg.src = _this.imgEl.src;
                    bgImg.style.width =  _this.imgBoundInfo.width + "px";
                    bgImg.style.height =  _this.imgBoundInfo.height + "px";

                    //设置el的bg
                    //el.style.background = "url(" + _this.imgEl.src + ") no-repeat";
                    //el.style.backgroundSize = backgroundSize;
                    setBackgroundPosition();
                }

                //如果非fixed则监听选取框的运动
                if(! _this.setting.isFixed){
                    Utils.addEvent(window, el, "mousedown", function(e){
                        rectClickFlag = 1;

                        currPageX = e.pageX;
                        currPageY = e.pageY;

                        currLeft = el.offsetLeft;
                        currTop = el.offsetTop;

                        currWidth = el.offsetWidth;
                        currHeight = el.offsetHeight;

                    });
                }

                if(! _this.setting.isFixed){

                    //创建控制点
                    for(var i = 0; i < controlDot.length; i ++){
                        var controlEl = createEl("div", el, "AlloyClipControl");

                        var attrName = ['left', 'right', 'top', 'bottom'];
                        for(var j = 0; j < attrName.length; j ++){
                            var attr = attrName[j];
                            controlDot[i][attr] && (controlEl.style[attr] = (~~ controlDot[i][attr] - 10 + "px"));
                        }

                        Utils.addEvent(_this.left, controlEl, "mousedown", function(i){
                            return function(e){
                                controlClickFlag = 1;
                                el.style.webkitTransformOrigin = controlDot[(controlDot.length - 1 - i)].position;

                                currPageX = e.pageX;
                                currPageY = e.pageY;

                                currWidth = el.offsetWidth;
                                currHeight = el.offsetHeight;

                                currLeft = el.offsetLeft;
                                currTop = el.offsetTop;

                                currControlDotI = i;

                                e.stopPropagation();
                            };
                        }(i));
                    }
                }else{
                }

                window.addEventListener("mousemove", function(e){
                    var x = e.pageX;
                    var y = e.pageY;
                    if(controlClickFlag){
                        e.preventDefault();

                        //bottom right
                        var dx = x - currPageX;
                        var dw = dx / rectRatio;

                        if(currControlDotI == 3){
                            var width = currWidth + dx;
                            var height = width / rectRatio;

                            if(width < 0 || height < 0) return;

                            el.style.width = width + "px";
                            el.style.height = height + "px";

                            checkBound(null, null, width, height);
                        }else if(currControlDotI == 2){
                            var width = - dx + currWidth;
                            var height = width / rectRatio;
                            var left = currLeft + dx;

                            if(width < 0 || height < 0) return;

                            el.style.width = width + "px";
                            el.style.height = height + "px";
                            el.style.left = left + "px";

                            checkBound(left, null, width, height);
                        }else if(currControlDotI == 1){
                            var width = currWidth + dx;
                            var height = width / rectRatio;

                            var top = currTop - dw;

                            if(width < 0 || height < 0) return;

                            el.style.width = width + "px";
                            el.style.height = height + "px";
                            el.style.top = top + "px";

                            checkBound(null, top, width, height);
                        }else if(currControlDotI == 0){
                            var width = currWidth - dx;
                            var height = width / rectRatio;

                            var left = currLeft + dx;
                            var top = currTop + dw;

                            if(width < 0 || height < 0) return;

                            el.style.width = width + "px";
                            el.style.height = height + "px";
                            el.style.left = left + "px";
                            el.style.top = top + "px";

                            checkBound(left, top, width, height);
                        }

                        setBackgroundPosition();

                    }else if(rectClickFlag){
                        e.preventDefault();

                        var dx = x - currPageX;
                        var dy = y - currPageY;

                        var left = currLeft + dx;
                        var top = currTop + dy;


                        el.style.left = left + "px";
                        el.style.top = top + "px";

                        checkBound(left, top);
                        setBackgroundPosition();

                    }

                });
                
                window.addEventListener("mouseup", function(e){
                    if(controlClickFlag || rectClickFlag) _this.showClipPic();
                    controlClickFlag = 0;
                    rectClickFlag = 0;
                });


                _this.rect = el;

                el.init = function(){
                    centerRect();
                    initBackground();
                };

                el.setBackgroundPosition = setBackgroundPosition;

                return el;
            }();
        },

        showClipPic: function(){
            var aiLayer = $AI(this.imgEl);
            var clipInfo = this.clipInfo;

            var scaleX = this.defaultWidth / clipInfo.width;
            var scaleY = this.defaultHeight / clipInfo.height;

            this.currLayer = aiLayer.clip(clipInfo.left, clipInfo.top, clipInfo.width, clipInfo.height).scale(scaleX, scaleY).replaceChild(this.rightContent);
            this.psedAIPic = this.currLayer;
            this.rightInfo.style.display = "";

            this.getOption().doCurrOptionPro();
        },

        addEventListener: function(eventType, func){
            if(! this.eventPool[eventType]){
                this.eventPool[eventType] = [];
            }

            this.eventPool[eventType].push(func);
        }
    };

    var AC = function(selector, width, height, isFixed){
        if(typeof selector == "object"){
        }else{
            //取到el
            var el = document.querySelectorAll(selector);

            var outObject = {};
            var acPool = [];

            for(var i = 0; i < el.length; i ++){
                acPool.push(new singleAC(el[i], width, height, isFixed));
            }

            outObject.ok = function(func){
                for(var i = 0; i < acPool.length; i ++){
                    acPool[i].addEventListener('ok', function(base64string, aiObj){
                        func && func(base64string, aiObj);
                    });
                }
            };

            return outObject;
        }
    };

    $AC = AlloyClip = AC;
})();
