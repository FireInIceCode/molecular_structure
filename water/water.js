function init_iframe(id,parent){
    var iframe=document.createElement('iframe');
    iframe.src='./wateriframe.html';
    iframe.onload=function(){
        iframe.contentWindow.eval('draw(false,'+id+')');
        iframe.contentWindow.eval('\
        for(var i of document.querySelectorAll(".text")){\
            i.style.fontSize="16px";\
        }\
        ')
    };
    iframe.scrolling=false;
    iframe.noResize=false;
    parent.appendChild(iframe);
}

hx=[
    [2,'+',3,'<sup>点燃</sup><br>->',4],
    [4,'<sup>通电</sup><br>->',2,'+',3]
]
texts=[
    'H<sub>2</sub>+O<sub>2</sub><arrow>点燃<br><op>-></op></arrow>H<sub>2</sub>O',
    'H<sub>2</sub>O<arrow>通电<br><op>-></op></arrow>H<sub>2</sub>+O<sub>2</sub>'
]
function parse_hx(id){
    arr=hx[id];
    var div=document.createElement('div');
    div.className='line';
    for(var i=0;i<arr.length;i++){
        if(arr[i]<=5&&arr[i]>=0){
            init_iframe(arr[i],div);
        }else{
            var span=document.createElement('span');
            span.className='arrow';
            span.innerHTML=arr[i];
            div.appendChild(span);
        }
    }
    var txt=document.createElement('div');
    txt.innerHTML=texts[id];
    txt.className='text';
    div.appendChild(txt);
    document.body.appendChild(div);
}