(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{17:function(e,t){},20:function(e,t,a){a(67);var n=[],o="",c="how can I help you ",l=null,r="Chatbot",s={apiKey:"Aw6Pqn4Ef51vqKQg1nxgn6kdKU5ijBNuBxqPLL91",invokeUrl:"https://pqj9shseg5.execute-api.us-west-2.amazonaws.com/test",region:"us-west-2"},i=a(402).default.newClient(s),d={};document.onkeypress=function(e){var t=e||window.event,a=t.keyCode||t.which;13!==a&&3!==a||function(){if(""!==document.getElementById("chatbox").value){o=document.getElementById("chatbox").value,n.push(o),document.getElementById("chatbox").value="";var e={question:o};i.invokeApi(d,"/search","GET",{headers:{},queryParams:{}},e).then(function(e){console.log("Sucessfully got chatbot response"),c=String(JSON.parse(e.data.body).answer),l=JSON.parse(e.data.body).imageList,console.log(e),console.log(l);for(var t=document.getElementById("myImg");t.firstChild;)t.removeChild(t.firstChild);for(var a=l.length-1;a>=0;a--){var o=document.createElement("img");o.src="https://s3-us-west-2.amazonaws.com/hw3photos/"+l[a],document.getElementById("myImg").appendChild(o)}for(console.log(c,l),n.push("<b>"+r+":</b> "+c),a=1;a<8;a++)n[n.length-a]&&(document.getElementById("chatlog"+a).innerHTML=n[n.length-a])}).catch(function(e){console.error(e),console.error("Chatbot response failure")})}}();38===a&&console.log("hi")}},430:function(e,t,a){"use strict";a.r(t);var n=a(3),o=a.n(n),c=a(52),l=a.n(c),r=(a(63),a(53)),s=a(54),i=a(56),d=a(55),h=a(57),u=(a(65),a(20)),m=function(e){function t(){var e,a;Object(r.a)(this,t);for(var n=arguments.length,o=new Array(n),c=0;c<n;c++)o[c]=arguments[c];return(a=Object(i.a)(this,(e=Object(d.a)(t)).call.apply(e,[this].concat(o)))).fileChangedHandler=function(e){a.setState({selectedFile:e.target.files[0]})},a.uploadHandler=function(){console.log(a.state.selectedFile,a.state.selectedFile.name),Object(u.uploadFile)(a.state.selectedFile)},a}return Object(h.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){return o.a.createElement("body",null,o.a.createElement("div",null,o.a.createElement("div",{id:"bodybox"},o.a.createElement("div",{id:"chatborder"},o.a.createElement("p",{id:"chatlog7",class:"chatlog"},"\xa0"),o.a.createElement("p",{id:"chatlog6",class:"chatlog"},"\xa0"),o.a.createElement("p",{id:"chatlog5",class:"chatlog"},"\xa0"),o.a.createElement("p",{id:"chatlog4",class:"chatlog"},"\xa0"),o.a.createElement("p",{id:"chatlog3",class:"chatlog"},"\xa0"),o.a.createElement("p",{id:"chatlog2",class:"chatlog"},"\xa0"),o.a.createElement("p",{id:"chatlog1",class:"chatlog"},"\xa0"),o.a.createElement("input",{type:"text",name:"chat",id:"chatbox",placeholder:"Hi there! Type here to talk to me.",onfocus:"placeHolder()"}))),o.a.createElement("script",{src:"https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"}),o.a.createElement("div",{id:"myImg"})))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(o.a.createElement(m,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},58:function(e,t,a){e.exports=a(430)},63:function(e,t,a){},65:function(e,t,a){}},[[58,2,1]]]);
//# sourceMappingURL=main.ac3b31a6.chunk.js.map