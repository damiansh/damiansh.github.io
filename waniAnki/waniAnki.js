// @name             WaniAnki
// @version          2.0
// @description      Displays using Javascript the kanji information for the given vocabulary word. 
// @author           https://www.reddit.com/user/Damshh
// @license          MIT
// @credits 		 Thanks to WaniKani, https://kanjiapi.dev/, jisho.org, and KanjiDamage for all of this. 
    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

kanjiBlank = {
    "kanji": "",
    "grade": 0,
    "stroke_count": 0,
    "meanings": [
        "Unknown"
    ],
    "kun_readings": [
        "N/A"
    ],
    "on_readings": [
        "N/A"
    ],
    "name_readings": [
        "N/A"
    ],
    "jlpt": null,
    "unicode": "4e11",
    "heisig_en": "sign of the cow"
};	

wkBlank = {
    "level": "",
    "slug": "",
    "document_url": "",
    "characters": "NOPE",
    "meanings": [
        {
            "meaning": "",
        }
    ],
    "readings": [
        {
            "type": "onyomi",
            "reading": "",
        },
        {
            "type": "kunyomi",
            "reading": "",
        }
    ],
    "component_subject_ids": [],

    "meaning_mnemonic": "",
};
kanjiInfo = document.getElementById('kanjiInfo');
kanjiInfo.classList.add("kanjiInfo");
kanjiInfo.setAttribute("lang", "ja-jp");
kanjiBreakdown();


/**
 * This method starts the process by getting the kanji information from WaniKani API. 
 * @main 
 */
async function kanjiBreakdown(){
	var allRadicals = await localJSON("wkRadicals");
	var jsKanji = await localJSON("kanji");
	kanji = kanji.replace(/([ぁ-ゟ]+|[゠-ヿ]+|[!-~]+|[々〆〤「」]+|[！-￮]+|[\s*])/g, '');
	kanjiArr = kanji.split("");
	k = kanjiArr.join(",");
	//console.log(k);}
	kanjiJS = await getSubject("subjects?types=kanji&slugs=" + k);
	if(kanjiJS==undefined)kanjiJS = new Array(0);
	if(kanjiJS.length==0) kanjiJS = wkBlank;
	sorted = sortKanji();
	//console.log(sorted);
	for(let i = 0; i < sorted.length; i++){
		await createKanji(sorted[i],jsKanji,allRadicals);
	}
}

/**
 * This method calls local json files
 */ 
async function localJSON(end){
	var js = "";
	await $.getJSON("https://damiansh.github.io/json/japanese/" + end + ".json", function(json) {
		js = json;
	});			
	return js;
}


/**
 * Method to sort the array returned by WaniKani API using the kanji contained within the vocab
 */
function sortKanji(){
	//console.log(kanjiJS);
	var index=0;
	sortedKanji = new Array(kanjiArr.length);
	for(let i=0;i<kanjiArr.length;i++){
		for(let j = 0;j<kanjiJS.length;j++){
			if(kanjiJS[j].data.slug==kanjiArr[i]){
				sortedKanji[index]=kanjiJS[j].data;
			}
		}
		if(sortedKanji[index]==null){
			noWK = new Object();
			Object.assign(noWK, wkBlank);
			noWK.slug =kanjiArr[i];
			sortedKanji[index]=noWK;			
		}
		index++;
	}
	return sortedKanji;
}


/**
 * The main method that builds the html for the kanji within Anki
 * @param {object} data - the JSON data recovered from WK. 
 */
async function createKanji(data,jsKanji,allRadicals){
	//console.log(data);
	const grid = document.createElement('div');
	grid.classList.add('grid-container');
	//divs for items
	const item1 = document.createElement('div');
	const kanjiGrid = document.createElement('div');
	const item2 = document.createElement('div');
	const item3 = document.createElement('div');
	const item4 = document.createElement('div');
	const item5 = document.createElement('div');
	
	//class for items
	item1.classList.add('item1');
	kanjiGrid.classList.add('entry');
	item2.classList.add('item2');
	item3.classList.add('item3');
	item4.classList.add('item4');
	item5.classList.add('item5');
	
	//readings p 
	const on = document.createElement('p');
	const kun = document.createElement('p');
	const onR = document.createElement('p');
	const kunR = document.createElement('p');
	var onyomi = "";
	var kunyomi = "";
	on.innerHTML = "<p><strong>On’yomi:</strong></p>";
	kun.innerHTML = "<p><strong>Kun’yomi:</strong></p>";
	
	data.level = "<wk><span title='wk level'>WK" + data.level + "</span></wk>";
	//This is for NON-WK Kanji
	if(data.characters === 'NOPE'){
		data.document_url=getURL(data.slug);
		code = await getCode(data.document_url);
		kanjiAPI = jsKanji[data.slug];
		//console.log(kanjiAPI);
		if(code==="404") data.document_url="https://jisho.org/search/" + data.slug + "%20%23kanji";
		//KanjIDamage
		data.meaning_mnemonic = getMnemonic(code); 
		item3.innerHTML = getRadicals(code,data.slug);
		data.component_subject_ids = new Array(0);
		if(kanjiAPI==null) kanjiAPI =kanjiBlank;
		data.level = "<jlpt><span title='jlpt level'>JLPT n" + kanjiAPI.jlpt + "</span></jlpt>";
		if(kanjiAPI.jlpt==null){
			data.level="<jlpt><span title='jlpt level'>n/a</span></jlpt>"
		}
		var readings = {kun:kanjiAPI.kun_readings, on:kanjiAPI.on_readings};
		data.readings = readings;
		data.meanings=kanjiAPI.meanings;
		onyomi = readings["kun"].join(", ");
		kunyomi = readings["on"].join(", ");
		
		//console.log(data.slug + " no esta en WK");
	}
	
	
	//Add Content
	//item 1 - meaning
	var meaning = ""
	for (let i = 0; i < data.meanings.length; i++) {
			if(data.meanings[i].meaning!=null){
				if(i==0){
					meaning = "<kanji>" + data.meanings[i].meaning + "</kanji>";
				}
				else{
					meaning = meaning + ", " + "<kanji>" + data.meanings[i].meaning + "</kanji>";
				}
			}
			else{
				if(i==0){
					meaning = "<kanji>" + data.meanings[i] + "</kanji>";
				}
				else{
					meaning =  meaning + ", " + "<kanji>" + data.meanings[i] + "</kanji>";
				}
			}
	}
	item1.innerHTML = "<a href='" + data.document_url + "'>" + meaning +  "</a> " + data.level;
	
	
	//kanjiGrid
	const kanjiStrokeOrder = document.createElement('ul');
	rawKanji = data.slug;
	kanjiINFO = jsKanji[rawKanji];
	kanjiStrokeOrder.classList.add('stroke-order');
			const position = -56.5;
			var kCode = rawKanji.charCodeAt()
			var strokeCount = 0;
			if(kanjiINFO!=null){
				strokeCount = kanjiINFO.stroke_count;
			}
			//if(strokeCount==null) strokeCount = findStroke2(kCode);
			var code = ""
			var style = "style='background-image: url(https://damiansh.github.io/kanji-sheets/strokes/" + kCode + ".png);background-position:";
			var clase = "class='strokeBox' ";
			
			for(let i=0;i<strokeCount;i++){
				code = code + "<li><div " + clase + style + (position*(i+1)) + "em 0em;'</div></li>";
			}
	kanjiStrokeOrder.innerHTML = code;
	kanjiGrid.appendChild(kanjiStrokeOrder);
	//item 2 - slug
	item2.innerHTML = "<a href='" + data.document_url + "'><slug>" +  data.slug + "</slug></a>"
	
	//item 3 - radicals
	for (let i = 0; i < data.component_subject_ids.length; i++) {
				createRadical(allRadicals["wk" + data.component_subject_ids[i]].data,item3,i);
	}

	//item 4 - readings
	o = 0;
	ku = 0;
	//console.log(data.readings.length);
	for (let i = 0; i < data.readings.length; i++) {
		if(data.readings[i].type=="onyomi"){
			if(o==0){
				onyomi = data.readings[i].reading;
				o++;
			}
			else{
				onyomi = onyomi + ", " + data.readings[i].reading;
			}
		}
		if(data.readings[i].type=="kunyomi"){
			if(ku==0){
				kunyomi = data.readings[i].reading;
				ku++;
			}
			else{
				kunyomi = kunyomi + ", " + data.readings[i].reading;
			}
		}
	}
	if(onyomi!=""){
		onR.innerHTML = onyomi;
		on.appendChild(onR);
		item4.appendChild(on);
	}
	if(kunyomi!=""){
		kunR.innerHTML = kunyomi;
		kun.appendChild(kunR);
		item4.appendChild(kun);
	}

	//item 5 - mnemonic
	item5.innerHTML = data.meaning_mnemonic;
	//append to grid
	grid.appendChild(item1);
	grid.appendChild(kanjiGrid);
	grid.appendChild(item2);
	grid.appendChild(item3);
	grid.appendChild(item4);
	grid.appendChild(item5);
	
	
	//console.log(data);
	//append grid to kanjiinfo
	kanjiInfo.appendChild(grid);
	lineaBreak = document.createElement("br");
	kanjiInfo.appendChild(lineaBreak);
}

/**
 * Method to build the html section of the radicals (item3)
 * @param {object} r - the radical data from WaniKani API
 * @param {html object} radical - the html element of radicals 
 * @param {int} check - A number to check if it is the first radical on the list.
 */
function createRadical(r,radical,check){
	//console.log(radical);
	//console.log(r);
	rString = "";
	if(r.characters!=null){
		rString = "<a href='" + r.document_url + "'>" + "<radical2>" + r.characters + "</radical2></a> " + r.meanings[0].meaning;
		
	}
	else{
		for(let i = 0; i < r.character_images.length; i++){
		 if(r.character_images[i].content_type == "image/png"){
			rString = "<a href='" + r.document_url + "' " + "class='ralink'><img weight='34' height ='34' class='raimg' src='" + r.character_images[i].url + "'></a> " + r.meanings[0].meaning;
		 }
		}
	}
	if(check==0){
		radical.innerHTML = rString;
	}
	else{
		radical.innerHTML = radical.innerHTML + " + " + rString;
	}
	
}

/**
 * Method to call the WaniKani API
 * @param {string} apiEndpointPath - the endpoint for the API
 */
async function getSubject(apiEndpointPath){
	var requestHeaders =
	  new Headers({
		Authorization: 'Bearer ' + apiToken,
	  });
 
	var apiEndpoint =
	  new Request('https://api.wanikani.com/v2/' + apiEndpointPath, {
		method: 'GET',
		headers: requestHeaders
	  });
	const response = await fetch(apiEndpoint)
	json = await response.json();
	return json.data;
}

/**
 * Method to get the KanjiDamage copy url
 * @param {char} kanji - the kanji slug 
 */
function getURL (kanji) {
    return "https://damiansh.github.io/waniAnki/kanjidamage/" + kanji;
}

/**
 * Method to call the APIs or websites. 
 * @param {String} url - url to call
 */
async function getCode(url){
	var response="";
	try{
		await $.get(url,function(data)//Remember, same domain
		{
			response = data;
		});
	}
	catch(err) {
		return "404";
	}
	
	return response;
}

/**
 * Method to get mnemonic part from the KanjiDamage website
 * @param {String} code - the html code from KanjiDamage
 */
function getMnemonic(code){
	if(code=="404") return "N/A";
	code = code.replace(/(\r\n|\n|\r)/gm, "");
    var first = "<table class='definition'><tr><td></td><td><p>"; 
    var second = "</p></td></tr></table><h2>"; 
    var criteria = new RegExp("(?:"+first+")((.[\\s\\S]*?))(?:"+second+")", "ig");
    var mnemonic = criteria.exec(code);

    if (mnemonic && mnemonic.length > 1)
    {  
		var dom = new DOMParser ();
		var mHTML   = dom.parseFromString (mnemonic[1], "text/html");
		var imgs = mHTML.getElementsByTagName("img");
		var oIMG;
		for(let i=0;i<imgs.length;i++){
			imgs[i].setAttribute("width", "80");
			imgs[i].setAttribute("height", "80");
			oIMG = imgs[i].outerHTML;
			imgs[i].outerHTML = oIMG.replace("../visualaids/", "https://damiansh.github.io/waniAnki/visualaids/");
			//console.log(links[i]);
		}
		return mHTML.body.innerHTML; //return second result.
    }

}

/**
 * Method to get radicals part from the KanjiDamage website
 * @param {String} code - the html code from KanjiDamage
 */
function getRadicals(code,kanjiIn){
	if(code=="404") return "<radical><a href='https://jisho.org/search/" + kanjiIn + "%20%23kanji'>Go to Jisho.org</a></radical>";
	code = code.replace(/(\r\n|\n|\r)/gm, "");
    var first = "</h1>"; 
    var second = "</div>"; 
    var criteria = new RegExp("(?:"+first+")((.[\\s\\S]*?))(?:"+second+")", "ig");
    var radicals = criteria.exec(code);
    if (radicals && radicals.length > 1){  
		var dom = new DOMParser ();
		var rHTML   = dom.parseFromString (radicals[1], "text/html");
		links = rHTML.getElementsByTagName("a");
		var olink;
		//console.log(links);
		for(let i=0;i<links.length;i++){
			olink = links[i].outerHTML;
			links[i].outerHTML = olink.replace('href="','href="https://www.kanjidamage.com/kanji/');
		}
		var imgs = rHTML.getElementsByTagName("img");
		var oIMG;		
		for(let i=0;i<imgs.length;i++){
			imgs[i].parentNode.classList.remove('component');
			imgs[i].classList.add('ralink');
			imgs[i].setAttribute("width", "40");
			imgs[i].setAttribute("height", "40");
			oIMG = imgs[i].outerHTML;
			imgs[i].outerHTML = oIMG.replace("../assets/radsmall/", "https://damiansh.github.io/waniAnki/assets/radsmall/");
		}
		
		return rHTML.body.innerHTML; //return second result.
    }
	
}


