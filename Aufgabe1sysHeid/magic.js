/**
 * Created by Barni on 25.05.2017.
 */

var o = { text : "No" } ,
    a = [1 , 15 , 5 ,
        o, " Welt ", 5 , " Tiger ", " Hallo ", " Welt ",
        { text : "!" } , { text : "!" } , o];

var n = [1, 23,12, 1, 23, 4, 6];

document.getElementById("originalArray_dub").innerHTML = JSON.stringify(a);
document.getElementById("originalArray_dubNum").innerHTML = JSON.stringify(n);

document.getElementById("draw").onmousemove = mouseMoved;
document.getElementById("draw").onmousedown = mouseClicked;

function removeDuplicates(a) {
    var newList = a;
    for (var i = 0; i < newList.length; i++) {
        for (var j = i+1; j < a.length; j++) {
            if (a[i] === a[j]) {
                newList.splice(j , 1);
            }
        }
    }
    return newList;
}

function removeDuplicatesNumber(a) {
    var o = new Object();
    var newList = new Array();
    for (var i = 0; i < a.length; i++) {
        var tmp = a[i];
        if (o[tmp] === undefined) {
            o[tmp] = true;
            newList.push(tmp);
        }
    }
    return newList;
}

function timeIt(a) {
    performance.mark("mark -A");
    if(a !== undefined && typeof a == 'function')
        a();
    performance.mark ("mark -B");
    performance.measure("m -1", "mark -A", "mark -B");
    console.log(performance.getEntriesByName("m -1")[0].duration);
    var div = document.getElementById("output_dubTh");
    div.innerHTML = div.innerHTML + performance.getEntriesByName("m -1")[0].duration + "<br>";
}


function mouseMoved(event) {
    var draw = document.getElementById("draw");
    var x = draw.getBoundingClientRect().left - event.clientX;
    var y = draw.getBoundingClientRect().top - event.clientY;

    draw.innerHTML = "X: " + x  + "  " + "Y: " + y;
}

function mouseClicked(event) {
    var draw = document.getElementById("draw");
    var points = document.getElementById("points");
    var x = draw.getBoundingClientRect().left - event.clientX;
    var y = draw.getBoundingClientRect().top - event.clientY;

    points.innerHTML = points.innerHTML + "<br>" + "X: " + x  + "  " + "Y: " + y;
}

document.getElementById("outputArray_dub").innerHTML = JSON.stringify(removeDuplicates(a));
document.getElementById("outputArray_dubNum").innerHTML = JSON.stringify(removeDuplicatesNumber(n));

console.log(removeDuplicates(a));
console.log(removeDuplicatesNumber(n));
