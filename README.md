AlloyClip
=========
##DEMO PAGE
###[查看使用DEMO](http://alloyteam.github.com/AlloyClip/)

##description

A PC &amp; Mobile Image Clip Kit based on AlloyImage

基于AlloyImage的图片裁切组件

##为什么使用AlloyClip
基于移动互联网的Web页面越来越多，与此同时，用户获取图像的成本也越来越低，裁剪、进一步修修饰图像的需求也越来越多。
本着Don't Repeat Yourself的原则，AlloyClip是基于AlloyImage图像处理库的图像裁剪组件，将适配大多数的开发需求，做到嵌入即可用的开发模式，避免相似场景重复开发的局面出现，同时使AlloyImage基础技术服务于业务需求。

## 文档

###0.0.1

>###$AC或AlloyClip
构造方法 初始化AlloyClip对象<br />
new $AC(String Selector, Number width, Number height, Number Style);<br />
{Selector} DOM选择器<br />
{width} 要裁剪到宽度<br />
{height} 要裁剪的高度<br />
{Style} 使用的样式 0是不固定选择框，1是固定选择框<br />
返回 AlloyClip对象

###AlloyClip对象的方法

>###ok
点击确定按钮进行的方法注册<br />
ok(Function callback)<br />
{callback} 回调函数，有两个参数分别为base64, AIObj<br />
base64为裁剪好的图片base64字符串<br />
AIObj为裁剪好的图片AlloyImage对象<br />

示例
```javascript
new $AC(".t", 200, 100, 1).ok(function(base64, AIObj){
        //upload base64

        //or use AlloyImage processing image
        AIObj.ps("lomo").download("AIpsed.jpg", 0.6);
});
```


## Licence ##
Released under [GPLv3](https://github.com/AlloyTeam/AlloyClip/blob/master/gpl.txt)

© 2013-2014 Alloyteam.
