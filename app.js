const client_id = '066280b58a524f389f8ddfd79d5610cf'
const client_secret = '077b2f163b244e58ba2ed9e5dd125e14'

const AUTHOURIZE = 'https://accounts.spotify.com/authorize'
const TOKEN = 'https://accounts.spotify.com/api/token'

let access_token = ''

let redirect_uri = 'https://borishangh.github.io/aspotifything/'
let scope = 'user-read-recently-played user-top-read'

function page_onload() {
	if (window.location.search.length > 0) {
		handle_redirect();
		window.history.pushState("", "", redirect_uri);
	}
}

function request_auth() {
	let url = AUTHOURIZE;
	url += "?client_id=" + client_id;
	url += "&response_type=code";
	url += "&redirect_uri=" + encodeURI(redirect_uri);
	url += "&show_dialog=true";
	url += "&scope=" + scope;

	window.location.href = url;
}

function get_code() {
	let str = window.location.search;

	if (str.length = 0)
		return null

	str = str.slice(6)
	return str;
}

function handle_redirect() {

	let body = "grant_type=authorization_code";
	body += "&code=" + get_code();
	body += "&redirect_uri=" + encodeURI(redirect_uri);
	body += "&client_id=" + client_id;

	fetch(TOKEN, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + btoa(client_id + ":" + client_secret)
		},
		body: body
	})
		.then(response => response.json())
		.then(data => {
			access_token = data.access_token
		})
}

function show_tracks(choice,timerange) {

	fetch(`https://api.spotify.com/v1/me/top/${choice}?time_range=${timerange}&limit=50&offset=0`, {
		headers: {
			'Authorization': 'Bearer ' + access_token
		}
	})
		.then(response => response.json())
		.then(data => {
			// if (choice=='artists')
			additem(data.items,choice)
		})
}

const list = document.querySelector('.list');

function additem(obj,choice) {
	let WIDTH;
	if(window.innerWidth<600){
		WIDTH = window.innerWidth/4;
	}else{
		WIDTH = 125;
	}

	for (i in obj) {
		let source

		let item = document.createElement('div')
		let artistname = document.createElement('div')
		let img = document.createElement('img')
		item.className = 'item'
		artistname.className = 'artistname'

		if(choice=='artists'){
			source = obj[i].images[1].url
			artistname.innerHTML =(parseInt(i)+1) + ". " + obj[i].name
		}
		else if(choice=='tracks'){
			source = obj[i].album.images[1].url
			artistname.innerHTML =(parseInt(i)+1) + ". " + obj[i].name
		}

		img.src = source

		img.style.width= `${WIDTH}px` ;
		item.style.width= `${WIDTH+14}px` ;

		item.appendChild(img)
		item.appendChild(artistname)

		list.appendChild(item)
	}
}

let select=document.querySelector('.select')
let fulfilled=0;
let timerange='',choice='';

select.addEventListener('click',(e)=>{

	if(access_token==''){
		alert('request auth first.')
		return
	}

	if(e.target.tagName=='A'){
		while (list.lastElementChild) {
			list.removeChild(list.lastElementChild);
		}

		if(e.target.id=='time'){

			let element=document.getElementById(e.target.id).parentNode;
		
			while (element.getElementsByClassName('selected')[0]) {
				element.getElementsByClassName('selected')[0].classList.remove('selected');
			}

			e.target.classList.add('selected')
			timerange=e.target.name;
		}

		if(e.target.id=='choice'){

			let element=document.getElementById(e.target.id).parentNode;
		
			while (element.getElementsByClassName('selected')[0]) {
				element.getElementsByClassName('selected')[0].classList.remove('selected');
			}

			e.target.classList.add('selected')
			choice=e.target.name;
		}
	}

		show_tracks(choice,timerange)
	// }
})