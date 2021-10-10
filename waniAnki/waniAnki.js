//By Damshh https://www.reddit.com/user/Damshh
wanikani();

async function wanikani(){
	kanjiInfo = document.getElementById('kanjiInfo');
	kanjiArr = kanji.split("");
	
	k = kanjiArr.join(",");
	console.log(k);
	kanjiJS = await getSubject("subjects?types=kanji&slugs=" + k);
	sorted = sortKanji();
	console.log(sorted);
	for(let i = 0; i < kanjiJS.length; i++){
		await createKanji(sorted[i]);
	}
}

function sortKanji(){
	//console.log(kanjiJS);
	var index=0;
	sortedKanji = new Array(kanjiJS.length);
	for(let i=0;i<kanjiArr.length;i++){
		for(let j = 0;j<kanjiJS.length;j++){
			if(kanjiJS[j].data.slug==kanjiArr[i]){
				sortedKanji[index]=kanjiJS[j].data;
				index++;
			}
		}
	}
	return sortedKanji;
}

async function createKanji(data){
	const grid = document.createElement('div');
	grid.classList.add('grid-container');
	//divs for items
	const item1 = document.createElement('div');
	const item2 = document.createElement('div');
	const item3 = document.createElement('div');
	const item4 = document.createElement('div');
	const item5 = document.createElement('div');
	
	//class for items
	item1.classList.add('item1');
	item2.classList.add('item2');
	item3.classList.add('item3');
	item4.classList.add('item4');
	item5.classList.add('item5');
	
	//readings p 
	const on = document.createElement('p');
	const kun = document.createElement('p');
	const onR = document.createElement('p');
	const kunR = document.createElement('p');
	on.innerHTML = "<p><strong>On’yomi:</strong></p>";
	kun.innerHTML = "<p><strong>Kun’yomi:</strong></p>";
	
	//Add Content
	//item 1 - meaning
	var meaning = ""
	for (let i = 0; i < data.meanings.length; i++) {
		if(i==0){
			meaning = data.meanings[i].meaning;
		}
		else{
			meaning = meaning + ", " + data.meanings[i].meaning;
		}
	}
	item1.innerHTML = "<a href='" + data.document_url + "'>" + meaning +  "</a> — <strong>Level:</strong> " + data.level;
	//item 2 - slug
	item2.innerHTML = data.slug;
	
	//item 3 - radicals
	for (let i = 0; i < data.component_subject_ids.length; i++) {
		radicalJS = await getSubject("subjects/" + data.component_subject_ids[i]);
		createRadical(radicalJS,item3,i);
	}
	
	//item 4 - readings
	onyomi = "";
	kunyomi = "";
	o = 0;
	ku = 0;
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

function createRadical(r,radical,i){
	//console.log(r);
	rString = "";
	if(r.characters!=null){
		rString = "<radical>" + r.characters + "</radical> " + r.meanings[0].meaning;
		
	}
	else{
		for(let i = 0; i < r.character_images.length; i++){
		 if(r.character_images[i].content_type == "image/png"){
			rString = "<span class='raSpan'><img weight='34' height ='34' class='raimg' src='" + r.character_images[i].url + "'></span> " + r.meanings[0].meaning;
		 }
		}
	}
	if(i==0){
		radical.innerHTML = rString;
	}
	else{
		radical.innerHTML = radical.innerHTML + " + " + rString;
	}
	
}

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
