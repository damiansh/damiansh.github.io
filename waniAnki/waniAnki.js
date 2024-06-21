// @name             WaniAnki
// @version          2.1
// @description      Displays using Javascript the kanji information for the given vocabulary word and its usage in vocabulary. 
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
		"amalgamation_subject_ids": []
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
		kanjiJS = await getSubject("subjects?types=kanji&slugs=" + k);
		if(kanjiJS==undefined)kanjiJS = new Array(0);
		if(kanjiJS.length==0) kanjiJS = wkBlank;
		sorted = sortKanji();
		for(let i = 0; i < sorted.length; i++){
			await createKanji(sorted[i], jsKanji, allRadicals);
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
				noWK.slug = kanjiArr[i];
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
	async function createKanji(data, jsKanji, allRadicals){
		const grid = document.createElement('div');
		grid.classList.add('grid-container');
		//divs for items
		const item1 = document.createElement('div');
		const kanjiGrid = document.createElement('div');
		const item2 = document.createElement('div');
		const item3 = document.createElement('div');
		const item4 = document.createElement('div');
		const item5 = document.createElement('div');
		const item6 = document.createElement('div'); // New item for vocabulary usage
	
		//class for items
		item1.classList.add('item1');
		kanjiGrid.classList.add('entry');
		item2.classList.add('item2');
		item3.classList.add('item3');
		item4.classList.add('item4');
		item5.classList.add('item5');
		item6.classList.add('item6'); // New class for vocabulary usage
	
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
			data.document_url = getURL(data.slug);
			code = await getCode(data.document_url);
			kanjiAPI = jsKanji[data.slug];
			if(code === "404") data.document_url = "https://jisho.org/search/" + data.slug + "%20%23kanji";
			//KanjIDamage
			data.meaning_mnemonic = getMnemonic(code); 
			item3.innerHTML = getRadicals(code, data.slug);
			data.component_subject_ids = new Array(0);
			if(kanjiAPI == null) kanjiAPI = kanjiBlank;
			data.level = "<jlpt><span title='jlpt level'>JLPT n" + kanjiAPI.jlpt + "</span></jlpt>";
			if(kanjiAPI.jlpt == null){
				data.level = "<jlpt><span title='jlpt level'>n/a</span></jlpt>"
			}
			var readings = {kun:kanjiAPI.kun_readings, on:kanjiAPI.on_readings};
			data.readings = readings;
			data.meanings = kanjiAPI.meanings;
			onyomi = readings["kun"].join(", ");
			kunyomi = readings["on"].join(", ");
		}
	
		// Add Content
		// item 1 - meaning
		var meaning = ""
		for (let i = 0; i < data.meanings.length; i++) {
			if(data.meanings[i].meaning != null){
				if(i == 0){
					meaning = "<kanji>" + data.meanings[i].meaning + "</kanji>";
				}
				else{
					meaning = meaning + ", " + "<kanji>" + data.meanings[i].meaning + "</kanji>";
				}
			}
			else{
				if(i == 0){
					meaning = "<kanji>" + data.meanings[i] + "</kanji>";
				}
				else{
					meaning = meaning + ", " + "<kanji>" + data.meanings[i] + "</kanji>";
				}
			}
		}
		item1.innerHTML = "<a href='" + data.document_url + "'>" + meaning +  "</a> " + data.level;
	
		// kanjiGrid
		const kanjiStrokeOrder = document.createElement('ul');
		rawKanji = data.slug;
		kanjiINFO = jsKanji[rawKanji];
		kanjiStrokeOrder.classList.add('stroke-order');
		const position = -56.5;
		var kCode = rawKanji.charCodeAt()
		var strokeCount = 0;
		if(kanjiINFO != null){
			strokeCount = kanjiINFO.stroke_count;
		}
		var code = ""
		var style = "style='background-image: url(https://damiansh.github.io/kanji-sheets/strokes/" + kCode + ".png);background-position:";
		var clase = "class='strokeBox' ";
	
		for(let i = 0; i<strokeCount;i++){
			if(i == 0){
				code = code + "<li " + clase + style + position * i + "px 0px;'> </li>";
			}
			else{
				code = code + "<li " + clase + style + position * i + "px 0px;'> </li>";
			}
		}
		kanjiStrokeOrder.innerHTML = code;
		kanjiGrid.innerHTML = "<kanji>" + rawKanji + "</kanji>";
		kanjiGrid.append(kanjiStrokeOrder);
	
		// item 2 readings
		onR.innerHTML = onyomi;
		kunR.innerHTML = kunyomi;
		on.append(onR);
		kun.append(kunR);
		item2.append(on);
		item2.append(kun);
	
		// item 3 radicals
		if(data.characters != 'NOPE'){
			item3.innerHTML = getRadicals(data.component_subject_ids, allRadicals);
		}
	
		// item 4 mnemonic
		item4.innerHTML = "<kanji>" + data.meaning_mnemonic + "</kanji>";
		
		// item 5 - amalgamations
		if(data.characters != 'NOPE'){
			item5.innerHTML = await getAmalgamation(data.amalgamation_subject_ids);
		}
		
		// item 6 - Used in Vocabulary
		const vocabUsage = await getVocabUsage(data.id); // Function to get vocabulary usage
		item6.innerHTML = "<strong>Used in:</strong><br>" + vocabUsage;
		
		grid.appendChild(item1);
		grid.appendChild(kanjiGrid);
		grid.appendChild(item2);
		grid.appendChild(item3);
		grid.appendChild(item4);
		grid.appendChild(item5);
		grid.appendChild(item6); // Append the new item to the grid
	
		kanjiInfo.appendChild(grid);
	}
	
	/**
	 * Get Kanji info from WK API
	 * @param {string} endpoint - the url for the api endpoint
	 */
	async function getSubject(endpoint){
		var js = "";
		await $.ajax({
			url: 'https://api.wanikani.com/v2/' + endpoint,
			type: 'GET',
			headers: {
				'Authorization': 'Bearer ' + wkAPI,
				'Wanikani-Revision': '20170710'
			},
			success: function(data) {
				js = data.data;
			}
		});
		return js;
	}
	
	/**
	 * Gets the amalgamation kanji for the radical/kanji
	 * @param {Array} ids - Array of kanji Ids that include the radical/kanji
	 */
	async function getAmalgamation(ids){
		var am = new Array(0);
		var js = "<kanji>";
		var tmp = "";
		var kanji = new Array(0);
		var index = 0;
		for(let i = 0; i < ids.length; i++){
			await $.ajax({
				url: 'https://api.wanikani.com/v2/subjects/' + ids[i],
				type: 'GET',
				headers: {
					'Authorization': 'Bearer ' + wkAPI,
					'Wanikani-Revision': '20170710'
				},
				success: function(data) {
					if(data.data.object === 'kanji'){
						kanji[index] = data.data.slug;
						index++;
					}
				}
			});
		}
		kanji = kanji.sort();
		for (let i = 0; i < kanji.length; i++) {
			if(i == kanji.length - 1){
				js = js + "<a href='https://www.wanikani.com/kanji/" + kanji[i] + "'>" + kanji[i] + "</a>";
			}
			else{
				js = js + "<a href='https://www.wanikani.com/kanji/" + kanji[i] + "'>" + kanji[i] + "</a>, ";
			}
		}
		js = js + "</kanji>";
		return js;
	}
	
	/**
	 * Function to get the vocabulary usage of a kanji
	 * @param {string} kanjiId - ID of the kanji
	 */
	async function getVocabUsage(kanjiId){
		var vocab = "";
		await $.ajax({
			url: 'https://api.wanikani.com/v2/subjects?types=vocabulary&kanji_ids=' + kanjiId,
			type: 'GET',
			headers: {
				'Authorization': 'Bearer ' + wkAPI,
				'Wanikani-Revision': '20170710'
			},
			success: function(data) {
				data.data.forEach(function(vocabItem) {
					vocab += "<a href='https://www.wanikani.com/vocabulary/" + vocabItem.data.slug + "'>" + vocabItem.data.characters + "</a>, ";
				});
			}
		});
		return vocab.slice(0, -2); // Remove the trailing comma and space
	}
	
	/**
	 * This method gets the radicals from WK API for the current kanji
	 * @param {Array} ids - Array of ids related to the radicals that are used in the kanji
	 */
	function getRadicals(ids, allRadicals){
		radicals = new Array(0);
		rad = "";
		var tmp = "";
		for(let i = 0; i<ids.length;i++){
			for (let j = 0; j < allRadicals.length; j++) {
				if(allRadicals[j].id == ids[i]){
					radicals[i] = allRadicals[j];
				}
			}
		}
		radicals = radicals.sort(function(a, b){
			if(a.data.slug < b.data.slug) { return -1; }
			if(a.data.slug > b.data.slug) { return 1; }
			return 0;
		})
		for(let i = 0; i < radicals.length; i++){
			if(i == radicals.length - 1){
				tmp = "<a href='https://www.wanikani.com/radicals/" + radicals[i].data.slug + "'>" + radicals[i].data.slug + "</a>";
				rad = rad + tmp;
			}
			else{
				tmp = "<a href='https://www.wanikani.com/radicals/" + radicals[i].data.slug + "'>" + radicals[i].data.slug + "</a>, ";
				rad = rad + tmp;
			}
		}
		return rad;
	}
	
	/**
	 * Method to get the URL for NON-WK Kanji using Kanji Damage
	 * @param {string} kanji - the kanji that is being searched
	 */
	function getURL(kanji){
		url = "https://www.kanjidamage.com/kanji/search?utf8=✓&q=" + kanji;
		return url;
	}
	
	/**
	 * Method to retrieve the HTML page of the NON-WK Kanji. 
	 * @param {string} url - the URL being retrieved. 
	 */
	async function getCode(url){
		var code = "";
		await $.ajax({
			url: 'https://api.allorigins.win/get?url=' + encodeURIComponent(url),
			type: 'GET',
			success: function(data) {
				code = data.contents;
			},
			error: function(data) {
				code = data.status.toString();
			}
		});
		return code;
	}
	
	/**
	 * Method to retrieve the mnemonics from Kanji Damage
	 * @param {string} code - the HTML code from the page
	 */
	function getMnemonic(code){
		mn = "";
		if(code === "404") return mn;
		str = code.split("Readings</h2>");
		str = str[0].split("</p>");
		str = str[1].split("<p>");
		return str[1];
	}
	